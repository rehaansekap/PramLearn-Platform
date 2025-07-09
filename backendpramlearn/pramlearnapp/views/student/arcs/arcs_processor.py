import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from django.db import transaction
from pramlearnapp.models.user import StudentMotivationProfile
import logging

logger = logging.getLogger(__name__)


class ARCSProcessor:
    """
    Class untuk memproses data ARCS dan melakukan clustering dengan KMeans
    """

    def __init__(self, n_clusters=3):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()

    def update_all_motivation_levels(self):
        """
        Update motivation levels untuk semua student menggunakan KMeans clustering
        """
        try:
            # Get all profiles with complete ARCS data
            profiles = StudentMotivationProfile.objects.filter(
                attention__isnull=False,
                relevance__isnull=False,
                confidence__isnull=False,
                satisfaction__isnull=False,
            ).exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)

            if profiles.count() < self.n_clusters:
                logger.warning(
                    f"Not enough profiles ({profiles.count()}) for clustering"
                )
                return

            # Prepare data for clustering
            features = []
            profile_ids = []

            for profile in profiles:
                features.append(
                    [
                        profile.attention,
                        profile.relevance,
                        profile.confidence,
                        profile.satisfaction,
                    ]
                )
                profile_ids.append(profile.id)

            features = np.array(features)

            # Normalize features
            features_scaled = self.scaler.fit_transform(features)

            # Perform KMeans clustering
            kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(features_scaled)

            # Map clusters to motivation levels based on centroids
            centroids = kmeans.cluster_centers_
            centroid_means = np.mean(centroids, axis=1)

            # Sort clusters by centroid means
            sorted_indices = np.argsort(centroid_means)

            # Map clusters to levels
            level_mapping = {
                sorted_indices[0]: "Low",
                sorted_indices[1]: "Medium",
                sorted_indices[2]: "High",
            }

            # Update profiles with new motivation levels
            with transaction.atomic():
                for i, profile_id in enumerate(profile_ids):
                    cluster_label = cluster_labels[i]
                    motivation_level = level_mapping[cluster_label]

                    StudentMotivationProfile.objects.filter(id=profile_id).update(
                        motivation_level=motivation_level
                    )

            logger.info(
                f"Successfully updated motivation levels for {len(profile_ids)} profiles"
            )

            # Return clustering results for debugging
            return {
                "total_profiles": len(profile_ids),
                "clusters": {
                    "Low": np.sum(cluster_labels == sorted_indices[0]),
                    "Medium": np.sum(cluster_labels == sorted_indices[1]),
                    "High": np.sum(cluster_labels == sorted_indices[2]),
                },
            }

        except Exception as e:
            logger.error(f"Error in KMeans clustering: {str(e)}")
            raise

    def get_cluster_statistics(self):
        """
        Get statistics about current motivation level distribution
        """
        profiles = StudentMotivationProfile.objects.exclude(
            motivation_level__isnull=True
        )

        stats = {
            "total": profiles.count(),
            "high": profiles.filter(motivation_level="High").count(),
            "medium": profiles.filter(motivation_level="Medium").count(),
            "low": profiles.filter(motivation_level="Low").count(),
            "unanalyzed": StudentMotivationProfile.objects.filter(
                motivation_level__isnull=True
            ).count(),
        }

        return stats
