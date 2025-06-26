import pandas as pd
from sklearn.cluster import KMeans
from django.db import transaction
from pramlearnapp.models import CustomUser, StudentMotivationProfile


def sessions_assign_motivation_profiles(csv_file):
    """
    Fungsi khusus untuk sessions - assign motivation profiles dari CSV file
    """
    # Load ARCS data
    data = pd.read_csv(csv_file)

    # Validasi kolom yang diperlukan
    required_columns = ['username']

    # Cek apakah menggunakan format dimensi atau langsung ARCS
    if all(f'dim_A_q{i}' in data.columns for i in range(1, 6)):
        # Format dengan dimensi (dim_A_q1, dim_A_q2, etc.)
        data['attention'] = data[[
            f'dim_A_q{i}' for i in range(1, 6)]].mean(axis=1)
        data['relevance'] = data[[
            f'dim_R_q{i}' for i in range(1, 6)]].mean(axis=1)
        data['confidence'] = data[[
            f'dim_C_q{i}' for i in range(1, 6)]].mean(axis=1)
        data['satisfaction'] = data[[
            f'dim_S_q{i}' for i in range(1, 6)]].mean(axis=1)
    elif all(col in data.columns for col in ['attention', 'relevance', 'confidence', 'satisfaction']):
        # Format langsung dengan kolom ARCS
        pass
    else:
        raise ValueError(
            "CSV file harus memiliki kolom dimensi (dim_A_q1-5, dim_R_q1-5, dll) atau langsung ARCS (attention, relevance, confidence, satisfaction)")

    # Fitur untuk clustering
    features = data[['attention', 'relevance', 'confidence', 'satisfaction']]

    # Clustering K-Means dengan 3 cluster
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(features)

    # Mapping cluster ke motivation level berdasarkan centroid
    centroids = kmeans.cluster_centers_
    centroid_means = centroids.mean(axis=1)

    # Urutkan cluster berdasarkan nilai rata-rata centroid
    sorted_indices = centroid_means.argsort()

    # Mapping: cluster dengan centroid terendah = Low, tertinggi = High
    label_mapping = {
        sorted_indices[0]: 'Low',
        sorted_indices[1]: 'Medium',
        sorted_indices[2]: 'High'
    }

    data['motivation_level'] = [label_mapping[label]
                                for label in cluster_labels]

    # Update database dengan transaction
    updated_count = 0
    skipped_count = 0

    with transaction.atomic():
        for _, row in data.iterrows():
            try:
                student = CustomUser.objects.get(username=row['username'])
                profile, created = StudentMotivationProfile.objects.get_or_create(
                    student=student
                )

                # Update profil motivasi (tidak ada default, langsung dari hasil clustering)
                profile.attention = float(row['attention'])
                profile.relevance = float(row['relevance'])
                profile.confidence = float(row['confidence'])
                profile.satisfaction = float(row['satisfaction'])
                # Hasil clustering
                profile.motivation_level = row['motivation_level']
                profile.save()

                updated_count += 1

            except CustomUser.DoesNotExist:
                skipped_count += 1
                continue
            except (ValueError, KeyError) as e:
                skipped_count += 1
                continue

    return {
        'updated_count': updated_count,
        'skipped_count': skipped_count,
        'total_processed': len(data)
    }


def validate_sessions_arcs_csv(csv_file):
    """
    Validasi file CSV untuk sessions ARCS upload
    """
    try:
        data = pd.read_csv(csv_file)

        # Cek kolom username
        if 'username' not in data.columns:
            return False, "CSV file harus memiliki kolom 'username'"

        # Cek format data ARCS
        has_dimensions = all(
            f'dim_A_q{i}' in data.columns for i in range(1, 6))
        has_direct_arcs = all(col in data.columns for col in [
                              'attention', 'relevance', 'confidence', 'satisfaction'])

        if not (has_dimensions or has_direct_arcs):
            return False, "CSV file harus memiliki kolom dimensi ARCS atau kolom langsung (attention, relevance, confidence, satisfaction)"

        # Cek apakah ada data
        if len(data) == 0:
            return False, "File CSV kosong"

        return True, "File CSV valid"

    except Exception as e:
        return False, f"Error membaca file: {str(e)}"
