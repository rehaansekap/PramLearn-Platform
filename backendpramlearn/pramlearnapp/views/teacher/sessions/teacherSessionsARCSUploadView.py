from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import pandas as pd
import os
import tempfile
from pramlearnapp.permissions import IsTeacherUser
from pramlearnapp.views.teacher.sessions.sessions_assign_motivation_profile import (
    sessions_assign_motivation_profiles,
    validate_sessions_arcs_csv
)


class TeacherSessionsARCSUploadView(APIView):
    """
    API untuk upload file CSV ARCS khusus untuk sessions
    """
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def post(self, request, *args, **kwargs):

        print("TeacherSessionsARCSUploadView POST called")
        try:
            file = request.FILES.get('file')
            if not file:
                return Response(
                    {"error": "Tidak ada file yang diupload"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validasi tipe file
            if not file.name.lower().endswith('.csv'):
                return Response(
                    {"error": "File harus berformat .csv"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Simpan file sementara
            with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            try:
                # Validasi file CSV
                is_valid, message = validate_sessions_arcs_csv(temp_file_path)
                if not is_valid:
                    return Response(
                        {"error": message},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Proses file untuk update motivation profiles
                result = sessions_assign_motivation_profiles(temp_file_path)

                response_message = (
                    f"Berhasil memperbarui {result['updated_count']} profil motivasi siswa. "
                    f"Total diproses: {result['total_processed']}"
                )

                if result['skipped_count'] > 0:
                    response_message += f" ({result['skipped_count']} siswa dilewati karena username tidak ditemukan)"

                return Response({
                    "message": response_message,
                    "details": {
                        "updated": result['updated_count'],
                        "skipped": result['skipped_count'],
                        "total": result['total_processed']
                    }
                }, status=status.HTTP_200_OK)

            finally:
                # Hapus file sementara
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

        except pd.errors.EmptyDataError:
            return Response(
                {"error": "File CSV kosong atau format tidak valid"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherSessionsARCSSampleView(APIView):
    """
    API untuk mendapatkan contoh format file CSV ARCS untuk sessions
    """
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, *args, **kwargs):
        sample_data = {
            "format_1": {
                "description": "Format dengan dimensi ARCS (20 pertanyaan)",
                "columns": [
                    "username",
                    "dim_A_q1", "dim_A_q2", "dim_A_q3", "dim_A_q4", "dim_A_q5",
                    "dim_R_q1", "dim_R_q2", "dim_R_q3", "dim_R_q4", "dim_R_q5",
                    "dim_C_q1", "dim_C_q2", "dim_C_q3", "dim_C_q4", "dim_C_q5",
                    "dim_S_q1", "dim_S_q2", "dim_S_q3", "dim_S_q4", "dim_S_q5"
                ],
                "example": [
                    {
                        "username": "student001",
                        "dim_A_q1": 4, "dim_A_q2": 5, "dim_A_q3": 4, "dim_A_q4": 5, "dim_A_q5": 4,
                        "dim_R_q1": 3, "dim_R_q2": 4, "dim_R_q3": 4, "dim_R_q4": 3, "dim_R_q5": 4,
                        "dim_C_q1": 5, "dim_C_q2": 4, "dim_C_q3": 5, "dim_C_q4": 4, "dim_C_q5": 5,
                        "dim_S_q1": 4, "dim_S_q2": 5, "dim_S_q3": 4, "dim_S_q4": 4, "dim_S_q5": 5
                    }
                ]
            },
            "format_2": {
                "description": "Format langsung dengan nilai ARCS",
                "columns": ["username", "attention", "relevance", "confidence", "satisfaction"],
                "example": [
                    {"username": "student001", "attention": 4.2,
                        "relevance": 3.6, "confidence": 4.6, "satisfaction": 4.4},
                    {"username": "student002", "attention": 3.8,
                        "relevance": 4.0, "confidence": 3.2, "satisfaction": 3.9}
                ]
            }
        }

        return Response(sample_data, status=status.HTTP_200_OK)
