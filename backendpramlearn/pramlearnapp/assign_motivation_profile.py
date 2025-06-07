import pandas as pd
from sklearn.cluster import KMeans
from django.db import transaction
from pramlearnapp.models import CustomUser, StudentMotivationProfile


def assign_motivation_profiles(csv_file):
    # Load ARCS data
    data = pd.read_csv(csv_file)

    # Hitung rata-rata untuk setiap dimensi
    data['attention'] = data[[f'dim_A_q{i}' for i in range(1, 6)]].mean(axis=1)
    data['relevance'] = data[[f'dim_R_q{i}' for i in range(1, 6)]].mean(axis=1)
    data['confidence'] = data[[
        f'dim_C_q{i}' for i in range(1, 6)]].mean(axis=1)
    data['satisfaction'] = data[[
        f'dim_S_q{i}' for i in range(1, 6)]].mean(axis=1)

    # Fitur untuk clustering
    features = data[['attention', 'relevance', 'confidence', 'satisfaction']]

    # Clustering K-Means
    kmeans = KMeans(n_clusters=3, random_state=42)
    data['motivation_level'] = kmeans.fit_predict(features)

    # Mapping cluster ke label
    motivation_mapping = {0: 'Low', 1: 'Medium', 2: 'High'}
    # Agar label konsisten, urutkan centroid dan mapping manual
    centroids = kmeans.cluster_centers_.mean(axis=1)
    sorted_labels = pd.Series(centroids).sort_values().index.tolist()
    label_map = {sorted_labels[0]: 'Low', sorted_labels[1]
        : 'Medium', sorted_labels[2]: 'High'}
    data['motivation_level'] = data['motivation_level'].map(label_map)

    # Update database
    with transaction.atomic():
        for _, row in data.iterrows():
            try:
                student = CustomUser.objects.get(username=row['username'])
                profile, _ = StudentMotivationProfile.objects.get_or_create(
                    student=student)
                profile.attention = row['attention']
                profile.relevance = row['relevance']
                profile.confidence = row['confidence']
                profile.satisfaction = row['satisfaction']
                profile.motivation_level = row['motivation_level']
                profile.save()
            except CustomUser.DoesNotExist:
                continue
