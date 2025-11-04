from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import pandas as pd
from pramlearnapp.models import StudentMotivationProfile
from pramlearnapp.serializers import StudentMotivationProfileSerializer
from pramlearnapp.assign_motivation_profile import assign_motivation_profiles


class StudentMotivationProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint untuk mendapatkan dan memperbarui profil motivasi siswa.
    """
    queryset = StudentMotivationProfile.objects.all()
    serializer_class = StudentMotivationProfileSerializer
    lookup_field = 'student__id'


class UploadARCSCSVView(APIView):
    """
    Endpoint untuk mengunggah file CSV ARCS dan memperbarui profil motivasi siswa.
    """
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=400)

        # Simpan file sementara
        file_path = 'uploaded_arcs_data.csv'
        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Validasi file CSV
        try:
            data = pd.read_csv(file_path)
            if 'username' not in data.columns:
                return Response({"error": "CSV file must contain a 'username' column."}, status=400)
        except Exception as e:
            return Response({"error": f"Invalid CSV file: {str(e)}"}, status=400)

        # Proses file untuk memperbarui profil motivasi siswa
        try:
            assign_motivation_profiles(file_path)
            return Response({"message": "Motivation profiles updated successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
