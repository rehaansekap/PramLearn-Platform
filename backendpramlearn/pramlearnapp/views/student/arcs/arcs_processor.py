import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from django.db import transaction
from pramlearnapp.models.user import StudentMotivationProfile
import logging

logger = logging.getLogger(__name__)


class ARCSProcessor:
    """
    Kelas untuk memproses data ARCS dan melakukan clustering menggunakan algoritma K-Means

    Kelas ini bertanggung jawab untuk:
    1. Mengambil data profil motivasi siswa dari database
    2. Melakukan normalisasi data menggunakan StandardScaler
    3. Menjalankan algoritma K-Means clustering dengan 3 cluster
    4. Memetakan hasil cluster ke level motivasi (Low, Medium, High)
    5. Memperbarui database dengan hasil clustering
    """

    def __init__(self, n_clusters=3):
        """
        Inisialisasi ARCSProcessor

        Args:
            n_clusters (int): Jumlah cluster untuk K-Means (default: 3)
        """
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        logger.info(f"ARCSProcessor diinisialisasi dengan {n_clusters} cluster")

    def update_all_motivation_levels(self):
        """
        Memperbarui level motivasi untuk semua siswa menggunakan K-Means clustering

        Proses yang dilakukan:
        1. Mengambil semua profil dengan data ARCS lengkap
        2. Mempersiapkan data untuk clustering (fitur: attention, relevance, confidence, satisfaction)
        3. Melakukan normalisasi menggunakan StandardScaler
        4. Menjalankan K-Means clustering
        5. Memetakan hasil cluster berdasarkan nilai centroid
        6. Memperbarui database dengan level motivasi baru

        Returns:
            dict: Statistik hasil clustering atau None jika gagal
        """
        try:
            logger.info("Memulai proses clustering motivasi siswa")

            # Langkah 1: Mengambil semua profil dengan data ARCS lengkap
            profiles = self._get_complete_arcs_profiles()

            if not self._validate_clustering_requirements(profiles):
                return None

            # Langkah 2: Mempersiapkan data untuk clustering
            features, profile_ids = self._prepare_clustering_data(profiles)

            # Langkah 3: Melakukan normalisasi dan clustering
            cluster_labels = self._perform_clustering(features)

            # Langkah 4: Memetakan cluster ke level motivasi
            level_mapping = self._create_motivation_level_mapping(
                features, cluster_labels
            )

            # Langkah 5: Memperbarui database
            clustering_stats = self._update_motivation_levels_in_db(
                profile_ids, cluster_labels, level_mapping
            )

            logger.info(
                f"Clustering berhasil diselesaikan untuk {len(profile_ids)} profil"
            )
            return clustering_stats

        except Exception as e:
            logger.error(f"Error dalam proses clustering K-Means: {str(e)}")
            raise

    def _get_complete_arcs_profiles(self):
        """
        Mengambil semua profil siswa yang memiliki data ARCS lengkap

        Returns:
            QuerySet: Profil siswa dengan data ARCS yang valid
        """
        logger.info("Mengambil profil siswa dengan data ARCS lengkap")

        profiles = StudentMotivationProfile.objects.filter(
            attention__isnull=False,
            relevance__isnull=False,
            confidence__isnull=False,
            satisfaction__isnull=False,
        ).exclude(
            # Mengecualikan profil dengan semua nilai 0.0
            attention=0.0,
            relevance=0.0,
            confidence=0.0,
            satisfaction=0.0,
        )

        logger.info(f"Ditemukan {profiles.count()} profil dengan data ARCS lengkap")
        return profiles

    def _validate_clustering_requirements(self, profiles):
        """
        Memvalidasi apakah data cukup untuk melakukan clustering

        Args:
            profiles (QuerySet): Profil siswa yang akan di-cluster

        Returns:
            bool: True jika data cukup, False jika tidak
        """
        profile_count = profiles.count()

        if profile_count < self.n_clusters:
            logger.warning(
                f"Data tidak cukup untuk clustering: {profile_count} profil < {self.n_clusters} cluster minimum"
            )
            return False

        logger.info(
            f"Validasi berhasil: {profile_count} profil tersedia untuk clustering"
        )
        return True

    def _prepare_clustering_data(self, profiles):
        """
        Mempersiapkan data untuk proses clustering

        Args:
            profiles (QuerySet): Profil siswa yang akan diproses

        Returns:
            tuple: (features array, profile_ids list)
        """
        logger.info("Mempersiapkan data untuk clustering")

        features = []
        profile_ids = []

        for profile in profiles:
            # Mengambil fitur ARCS dari setiap profil
            feature_vector = [
                profile.attention,
                profile.relevance,
                profile.confidence,
                profile.satisfaction,
            ]
            features.append(feature_vector)
            profile_ids.append(profile.id)

        features_array = np.array(features)
        logger.info(
            f"Data dipersiapkan: {features_array.shape[0]} sampel dengan {features_array.shape[1]} fitur"
        )

        return features_array, profile_ids

    def _perform_clustering(self, features):
        """
        Melakukan normalisasi dan clustering menggunakan K-Means

        Args:
            features (np.array): Array fitur ARCS

        Returns:
            np.array: Label cluster untuk setiap sampel
        """
        logger.info("Memulai proses normalisasi dan clustering")

        # Normalisasi fitur menggunakan StandardScaler
        # Ini penting untuk memastikan semua dimensi ARCS memiliki bobot yang sama
        features_scaled = self.scaler.fit_transform(features)
        logger.info("Normalisasi data menggunakan StandardScaler selesai")

        # Inisialisasi dan menjalankan K-Means clustering
        kmeans = KMeans(
            n_clusters=self.n_clusters,
            random_state=42,  # Untuk reproducibility
            n_init=10,  # Jumlah inisialisasi untuk mendapatkan hasil terbaik
        )

        cluster_labels = kmeans.fit_predict(features_scaled)
        logger.info(f"K-Means clustering selesai dengan {self.n_clusters} cluster")

        # Menyimpan model untuk debugging (opsional)
        self.kmeans_model = kmeans
        self.scaled_features = features_scaled

        return cluster_labels

    def _create_motivation_level_mapping(self, features, cluster_labels):
        """
        Membuat pemetaan dari label cluster ke level motivasi berdasarkan centroid

        Logika pemetaan:
        - Cluster dengan centroid rata-rata terendah = Low
        - Cluster dengan centroid rata-rata sedang = Medium
        - Cluster dengan centroid rata-rata tertinggi = High

        Args:
            features (np.array): Array fitur ARCS
            cluster_labels (np.array): Label cluster hasil K-Means

        Returns:
            dict: Mapping dari cluster label ke motivation level
        """
        logger.info("Membuat pemetaan cluster ke level motivasi")

        # Menghitung centroid untuk setiap cluster
        centroids = self.kmeans_model.cluster_centers_

        # Menghitung rata-rata nilai centroid untuk setiap cluster
        # Ini memberikan gambaran umum tingkat motivasi cluster tersebut
        centroid_means = np.mean(centroids, axis=1)

        # Mengurutkan cluster berdasarkan nilai rata-rata centroid
        sorted_indices = np.argsort(centroid_means)

        # Membuat pemetaan: cluster dengan nilai terendah = Low, tertinggi = High
        level_mapping = {
            sorted_indices[0]: "Low",  # Cluster dengan centroid terendah
            sorted_indices[1]: "Medium",  # Cluster dengan centroid sedang
            sorted_indices[2]: "High",  # Cluster dengan centroid tertinggi
        }

        # Log informasi untuk debugging
        for cluster_idx, level in level_mapping.items():
            count = np.sum(cluster_labels == cluster_idx)
            avg_score = centroid_means[cluster_idx]
            logger.info(
                f"Cluster {cluster_idx} -> {level}: {count} siswa, rata-rata skor: {avg_score:.3f}"
            )

        return level_mapping

    def _update_motivation_levels_in_db(
        self, profile_ids, cluster_labels, level_mapping
    ):
        """
        Memperbarui level motivasi di database berdasarkan hasil clustering

        Args:
            profile_ids (list): List ID profil yang di-cluster
            cluster_labels (np.array): Label cluster untuk setiap profil
            level_mapping (dict): Mapping dari cluster ke motivation level

        Returns:
            dict: Statistik hasil clustering
        """
        logger.info("Memperbarui level motivasi di database")

        # Menggunakan atomic transaction untuk memastikan konsistensi data
        with transaction.atomic():
            for i, profile_id in enumerate(profile_ids):
                cluster_label = cluster_labels[i]
                motivation_level = level_mapping[cluster_label]

                # Update profil siswa dengan level motivasi baru
                StudentMotivationProfile.objects.filter(id=profile_id).update(
                    motivation_level=motivation_level
                )

        # Menghitung statistik hasil clustering
        clustering_stats = self._calculate_clustering_statistics(
            cluster_labels, level_mapping
        )

        logger.info("Update database selesai")
        return clustering_stats

    def _calculate_clustering_statistics(self, cluster_labels, level_mapping):
        """
        Menghitung statistik dari hasil clustering

        Args:
            cluster_labels (np.array): Label cluster
            level_mapping (dict): Mapping cluster ke level

        Returns:
            dict: Statistik clustering
        """
        # Menghitung distribusi siswa per level motivasi
        sorted_indices = sorted(level_mapping.keys(), key=lambda x: level_mapping[x])

        stats = {
            "total_profiles": len(cluster_labels),
            "clusters": {
                "Low": int(np.sum(cluster_labels == sorted_indices[0])),
                "Medium": int(np.sum(cluster_labels == sorted_indices[1])),
                "High": int(np.sum(cluster_labels == sorted_indices[2])),
            },
        }

        logger.info(f"Statistik clustering: {stats}")
        return stats

    def get_cluster_statistics(self):
        """
        Mendapatkan statistik distribusi level motivasi saat ini dari database

        Returns:
            dict: Statistik distribusi level motivasi
        """
        logger.info("Mengambil statistik distribusi level motivasi")

        # Mengambil profil yang sudah memiliki level motivasi
        analyzed_profiles = StudentMotivationProfile.objects.exclude(
            motivation_level__isnull=True
        )

        # Menghitung jumlah profil yang belum dianalisis
        unanalyzed_count = StudentMotivationProfile.objects.filter(
            motivation_level__isnull=True
        ).count()

        stats = {
            "total": analyzed_profiles.count(),
            "high": analyzed_profiles.filter(motivation_level="High").count(),
            "medium": analyzed_profiles.filter(motivation_level="Medium").count(),
            "low": analyzed_profiles.filter(motivation_level="Low").count(),
            "unanalyzed": unanalyzed_count,
        }

        logger.info(f"Statistik level motivasi: {stats}")
        return stats

    def get_clustering_model_info(self):
        """
        Mendapatkan informasi tentang model clustering yang terakhir digunakan

        Returns:
            dict: Informasi model clustering
        """
        if not hasattr(self, "kmeans_model"):
            return {"error": "Model clustering belum dijalankan"}

        return {
            "n_clusters": self.kmeans_model.n_clusters,
            "inertia": self.kmeans_model.inertia_,
            "n_iter": self.kmeans_model.n_iter_,
            "centroids": self.kmeans_model.cluster_centers_.tolist(),
        }
