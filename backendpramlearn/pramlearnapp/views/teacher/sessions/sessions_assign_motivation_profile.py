import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from django.db import transaction
from pramlearnapp.models import CustomUser, StudentMotivationProfile
import logging

logger = logging.getLogger(__name__)


def sessions_assign_motivation_profiles(csv_file):
    """
    Fungsi khusus untuk sessions - assign motivation profiles dari CSV file

    Proses yang dilakukan:
    1. Membaca dan memvalidasi data CSV
    2. Menghitung skor ARCS dari format dimensi atau langsung
    3. Melakukan clustering K-Means untuk menentukan level motivasi
    4. Menyimpan hasil ke database dengan atomic transaction

    Args:
        csv_file (str): Path ke file CSV yang berisi data ARCS siswa

    Returns:
        dict: Statistik hasil pemrosesan (updated_count, skipped_count, total_processed)
    """
    try:
        logger.info(f"Memulai proses assign motivation profiles dari file: {csv_file}")

        # Langkah 1: Membaca dan memvalidasi data CSV
        data = _load_and_validate_csv_data(csv_file)

        # Langkah 2: Menghitung skor ARCS
        data = _calculate_arcs_scores(data)

        # Langkah 3: Melakukan clustering K-Means
        data = _perform_motivation_clustering(data)

        # Langkah 4: Menyimpan ke database
        result_stats = _save_motivation_profiles_to_database(data)

        logger.info(f"Proses selesai: {result_stats}")
        return result_stats

    except Exception as e:
        logger.error(f"Error dalam proses assign motivation profiles: {str(e)}")
        raise


def _load_and_validate_csv_data(csv_file):
    """
    Membaca dan memvalidasi data CSV

    Args:
        csv_file (str): Path ke file CSV

    Returns:
        pd.DataFrame: Data CSV yang sudah divalidasi

    Raises:
        ValueError: Jika format CSV tidak sesuai
    """
    logger.info("Membaca data CSV...")

    # Membaca file CSV
    data = pd.read_csv(csv_file)

    # Validasi kolom username yang wajib ada
    if "username" not in data.columns:
        raise ValueError("CSV file harus memiliki kolom 'username'")

    # Validasi jumlah data
    if len(data) == 0:
        raise ValueError("File CSV kosong")

    logger.info(f"Berhasil membaca {len(data)} baris data")
    return data


def _calculate_arcs_scores(data):
    """
    Menghitung skor ARCS berdasarkan format data yang tersedia

    Mendukung 2 format:
    1. Format dimensi: dim_A_q1-5, dim_R_q1-5, dim_C_q1-5, dim_S_q1-5
    2. Format langsung: attention, relevance, confidence, satisfaction

    Args:
        data (pd.DataFrame): Data CSV input

    Returns:
        pd.DataFrame: Data dengan kolom ARCS yang sudah dihitung

    Raises:
        ValueError: Jika format tidak sesuai dengan yang didukung
    """
    logger.info("Menghitung skor ARCS...")

    # Mengecek format dimensi (20 pertanyaan)
    dimension_columns = [
        f"dim_{dim}_q{i}" for dim in ["A", "R", "C", "S"] for i in range(1, 6)
    ]
    has_dimension_format = all(col in data.columns for col in dimension_columns)

    # Mengecek format langsung
    direct_columns = ["attention", "relevance", "confidence", "satisfaction"]
    has_direct_format = all(col in data.columns for col in direct_columns)

    if has_dimension_format:
        logger.info("Menggunakan format dimensi - menghitung rata-rata per dimensi")
        data = _calculate_from_dimension_format(data)
    elif has_direct_format:
        logger.info("Menggunakan format langsung - validasi skor ARCS")
        data = _validate_direct_format(data)
    else:
        raise ValueError(
            "CSV file harus memiliki kolom dimensi (dim_A_q1-5, dim_R_q1-5, dll) "
            "atau kolom langsung (attention, relevance, confidence, satisfaction)"
        )

    return data


def _calculate_from_dimension_format(data):
    """
    Menghitung skor ARCS dari format dimensi (20 pertanyaan)

    Args:
        data (pd.DataFrame): Data dengan kolom dimensi

    Returns:
        pd.DataFrame: Data dengan kolom ARCS yang dihitung
    """
    # Menghitung rata-rata untuk setiap dimensi ARCS
    data["attention"] = data[[f"dim_A_q{i}" for i in range(1, 6)]].mean(axis=1)
    data["relevance"] = data[[f"dim_R_q{i}" for i in range(1, 6)]].mean(axis=1)
    data["confidence"] = data[[f"dim_C_q{i}" for i in range(1, 6)]].mean(axis=1)
    data["satisfaction"] = data[[f"dim_S_q{i}" for i in range(1, 6)]].mean(axis=1)

    logger.info("Berhasil menghitung rata-rata skor dari 20 pertanyaan dimensi")
    return data


def _validate_direct_format(data):
    """
    Memvalidasi format langsung kolom ARCS

    Args:
        data (pd.DataFrame): Data dengan kolom ARCS langsung

    Returns:
        pd.DataFrame: Data yang sudah divalidasi

    Raises:
        ValueError: Jika ada nilai yang tidak valid
    """
    arcs_columns = ["attention", "relevance", "confidence", "satisfaction"]

    # Validasi bahwa semua nilai adalah numerik dan dalam rentang yang wajar
    for col in arcs_columns:
        if not pd.api.types.is_numeric_dtype(data[col]):
            raise ValueError(f"Kolom {col} harus berisi nilai numerik")

        # Cek rentang nilai (asumsi skala 1-7 atau 1-5)
        min_val, max_val = data[col].min(), data[col].max()
        if min_val < 1 or max_val > 7:
            logger.warning(
                f"Nilai {col} di luar rentang normal (1-7): min={min_val}, max={max_val}"
            )

    logger.info("Format langsung ARCS sudah valid")
    return data


def _perform_motivation_clustering(data):
    """
    Melakukan clustering K-Means untuk menentukan level motivasi

    Menggunakan algoritma K-Means dengan 3 cluster:
    - Low: Cluster dengan centroid terendah
    - Medium: Cluster dengan centroid sedang
    - High: Cluster dengan centroid tertinggi

    Args:
        data (pd.DataFrame): Data dengan skor ARCS

    Returns:
        pd.DataFrame: Data dengan kolom motivation_level
    """
    logger.info("Memulai proses clustering K-Means...")

    # Menyiapkan fitur untuk clustering
    arcs_features = data[
        ["attention", "relevance", "confidence", "satisfaction"]
    ].values

    # Normalisasi menggunakan StandardScaler
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(arcs_features)

    logger.info(f"Data dinormalisasi untuk {len(features_scaled)} sampel")

    # Melakukan K-Means clustering dengan 3 cluster
    kmeans = KMeans(
        n_clusters=3,
        random_state=42,  # Untuk reproducibility
        n_init=10,  # Jumlah inisialisasi untuk hasil terbaik
        max_iter=300,  # Maksimum iterasi
    )

    cluster_labels = kmeans.fit_predict(features_scaled)

    # Membuat pemetaan cluster ke level motivasi berdasarkan centroid
    level_mapping = _create_cluster_level_mapping(kmeans.cluster_centers_)

    # Menambahkan kolom motivation_level ke dataframe
    data["motivation_level"] = [level_mapping[label] for label in cluster_labels]

    # Log statistik clustering
    _log_clustering_statistics(data, level_mapping, cluster_labels)

    logger.info("Clustering K-Means selesai")
    return data


def _create_cluster_level_mapping(centroids):
    """
    Membuat pemetaan dari label cluster ke level motivasi berdasarkan centroid

    Args:
        centroids (np.array): Centroid hasil K-Means

    Returns:
        dict: Mapping dari cluster label ke motivation level
    """
    # Menghitung rata-rata nilai centroid untuk setiap cluster
    centroid_means = np.mean(centroids, axis=1)

    # Mengurutkan cluster berdasarkan nilai rata-rata centroid
    sorted_indices = np.argsort(centroid_means)

    # Membuat pemetaan: cluster dengan centroid terendah = Low, tertinggi = High
    level_mapping = {
        sorted_indices[0]: "Low",  # Cluster dengan centroid terendah
        sorted_indices[1]: "Medium",  # Cluster dengan centroid sedang
        sorted_indices[2]: "High",  # Cluster dengan centroid tertinggi
    }

    logger.info("Pemetaan cluster ke level motivasi:")
    for cluster_idx, level in level_mapping.items():
        avg_score = centroid_means[cluster_idx]
        logger.info(f"  Cluster {cluster_idx} -> {level} (rata-rata: {avg_score:.3f})")

    return level_mapping


def _log_clustering_statistics(data, level_mapping, cluster_labels):
    """
    Mencatat statistik hasil clustering untuk monitoring

    Args:
        data (pd.DataFrame): Data dengan hasil clustering
        level_mapping (dict): Mapping cluster ke level
        cluster_labels (np.array): Label cluster
    """
    # Menghitung distribusi siswa per level
    level_counts = data["motivation_level"].value_counts()

    logger.info("Distribusi level motivasi hasil clustering:")
    for level in ["Low", "Medium", "High"]:
        count = level_counts.get(level, 0)
        percentage = (count / len(data)) * 100
        logger.info(f"  {level}: {count} siswa ({percentage:.1f}%)")


def _save_motivation_profiles_to_database(data):
    """
    Menyimpan hasil clustering ke database dengan atomic transaction

    Args:
        data (pd.DataFrame): Data dengan hasil clustering

    Returns:
        dict: Statistik hasil penyimpanan
    """
    logger.info("Menyimpan hasil ke database...")

    updated_count = 0
    skipped_count = 0

    # Menggunakan atomic transaction untuk memastikan konsistensi data
    with transaction.atomic():
        for _, row in data.iterrows():
            try:
                # Mencari siswa berdasarkan username
                student = CustomUser.objects.get(username=row["username"])

                # Membuat atau memperbarui profil motivasi
                profile, created = StudentMotivationProfile.objects.get_or_create(
                    student=student,
                    defaults={
                        "attention": float(row["attention"]),
                        "relevance": float(row["relevance"]),
                        "confidence": float(row["confidence"]),
                        "satisfaction": float(row["satisfaction"]),
                        "motivation_level": row["motivation_level"],
                    },
                )

                if not created:
                    # Memperbarui profil yang sudah ada
                    profile.attention = float(row["attention"])
                    profile.relevance = float(row["relevance"])
                    profile.confidence = float(row["confidence"])
                    profile.satisfaction = float(row["satisfaction"])
                    profile.motivation_level = row["motivation_level"]
                    profile.save()

                updated_count += 1
                logger.debug(
                    f"Profil {'dibuat' if created else 'diperbarui'} untuk siswa: {student.username}"
                )

            except CustomUser.DoesNotExist:
                logger.warning(
                    f"Siswa dengan username '{row['username']}' tidak ditemukan"
                )
                skipped_count += 1
                continue
            except (ValueError, KeyError) as e:
                logger.error(
                    f"Error memproses data untuk username '{row['username']}': {str(e)}"
                )
                skipped_count += 1
                continue

    # Menyiapkan statistik hasil
    result_stats = {
        "updated_count": updated_count,
        "skipped_count": skipped_count,
        "total_processed": len(data),
    }

    logger.info(
        f"Database update selesai - Updated: {updated_count}, Skipped: {skipped_count}"
    )
    return result_stats


def validate_sessions_arcs_csv(csv_file):
    """
    Validasi file CSV untuk sessions ARCS upload

    Memvalidasi:
    1. Struktur file CSV
    2. Kolom yang diperlukan
    3. Format data ARCS
    4. Keberadaan data

    Args:
        csv_file (str): Path ke file CSV

    Returns:
        tuple: (is_valid: bool, message: str)
    """
    try:
        logger.info(f"Memvalidasi file CSV: {csv_file}")

        # Membaca file CSV
        data = pd.read_csv(csv_file)

        # Validasi 1: Kolom username
        if "username" not in data.columns:
            return False, "CSV file harus memiliki kolom 'username'"

        # Validasi 2: Format data ARCS
        dimension_columns = [
            f"dim_{dim}_q{i}" for dim in ["A", "R", "C", "S"] for i in range(1, 6)
        ]
        has_dimensions = all(col in data.columns for col in dimension_columns)

        direct_columns = ["attention", "relevance", "confidence", "satisfaction"]
        has_direct_arcs = all(col in data.columns for col in direct_columns)

        if not (has_dimensions or has_direct_arcs):
            return False, (
                "CSV file harus memiliki kolom dimensi ARCS "
                "(dim_A_q1-5, dim_R_q1-5, dim_C_q1-5, dim_S_q1-5) "
                "atau kolom langsung (attention, relevance, confidence, satisfaction)"
            )

        # Validasi 3: Keberadaan data
        if len(data) == 0:
            return False, "File CSV kosong"

        # Validasi 4: Validasi nilai numerik (jika format langsung)
        if has_direct_arcs:
            for col in direct_columns:
                if not pd.api.types.is_numeric_dtype(data[col]):
                    return False, f"Kolom {col} harus berisi nilai numerik"

        # Validasi 5: Cek duplikasi username
        if data["username"].duplicated().any():
            duplicated_usernames = data[data["username"].duplicated()][
                "username"
            ].tolist()
            return False, f"Ditemukan username duplikat: {duplicated_usernames}"

        logger.info(f"File CSV valid - {len(data)} baris data")
        return True, "File CSV valid"

    except FileNotFoundError:
        return False, "File CSV tidak ditemukan"
    except pd.errors.EmptyDataError:
        return False, "File CSV kosong atau format tidak valid"
    except Exception as e:
        logger.error(f"Error validasi CSV: {str(e)}")
        return False, f"Error membaca file: {str(e)}"
