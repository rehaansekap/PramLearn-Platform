from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import pandas as pd
import os
import tempfile
import logging

from pramlearnapp.permissions import IsTeacherUser
from pramlearnapp.views.teacher.sessions.sessions_assign_motivation_profile import (
    sessions_assign_motivation_profiles,
    validate_sessions_arcs_csv,
)

logger = logging.getLogger(__name__)


class TeacherSessionsARCSUploadView(APIView):
    """
    API untuk upload file CSV ARCS khusus untuk sessions

    Endpoint ini menangani:
    1. Upload dan validasi file CSV
    2. Pemrosesan data ARCS dengan clustering
    3. Penyimpanan hasil ke database
    4. Pengembalian statistik hasil pemrosesan
    """

    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated, IsTeacherUser]

    def post(self, request, *args, **kwargs):
        """
        Menangani upload file CSV ARCS dan memproses clustering

        Expected file format:
        - CSV dengan kolom 'username' (wajib)
        - Format 1: Kolom dimensi (dim_A_q1-5, dim_R_q1-5, dim_C_q1-5, dim_S_q1-5)
        - Format 2: Kolom langsung (attention, relevance, confidence, satisfaction)

        Returns:
            Response: Hasil pemrosesan dengan statistik
        """
        logger.info(f"Teacher {request.user.username} melakukan upload CSV ARCS")

        try:
            # Langkah 1: Validasi dan ekstrak file dari request
            file_path = self._extract_and_validate_file(request)

            # Langkah 2: Validasi format dan isi file CSV
            self._validate_csv_format(file_path)

            # Langkah 3: Proses file untuk update motivation profiles
            processing_result = self._process_arcs_data(file_path)

            # Langkah 4: Menyiapkan response dengan statistik
            response_data = self._prepare_success_response(processing_result)

            logger.info(
                f"Upload CSV berhasil - {processing_result['updated_count']} profil diperbarui"
            )
            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError as ve:
            # Error validasi (400 Bad Request)
            logger.warning(f"Validasi gagal: {str(ve)}")
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Error sistem (500 Internal Server Error)
            logger.error(f"Error sistem saat upload CSV: {str(e)}")
            return Response(
                {"error": f"Terjadi kesalahan sistem: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            # Pastikan file temporary dihapus
            if "file_path" in locals() and os.path.exists(file_path):
                os.unlink(file_path)
                logger.debug("File temporary berhasil dihapus")

    def _extract_and_validate_file(self, request):
        """
        Mengekstrak dan memvalidasi file dari request

        Args:
            request: Django request object

        Returns:
            str: Path ke file temporary

        Raises:
            ValueError: Jika file tidak valid
        """
        # Cek keberadaan file dalam request
        file = request.FILES.get("file")
        if not file:
            raise ValueError("Tidak ada file yang diupload")

        # Validasi ekstensi file
        if not file.name.lower().endswith(".csv"):
            raise ValueError("File harus berformat .csv")

        # Validasi ukuran file (maksimal 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if file.size > max_size:
            raise ValueError("Ukuran file terlalu besar. Maksimal 5MB")

        # Simpan file ke temporary location
        temp_file_path = self._save_to_temporary_file(file)

        logger.info(f"File '{file.name}' berhasil diupload ({file.size} bytes)")
        return temp_file_path

    def _save_to_temporary_file(self, uploaded_file):
        """
        Menyimpan uploaded file ke temporary location

        Args:
            uploaded_file: File yang diupload

        Returns:
            str: Path ke file temporary
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_file:
            # Menyimpan file dalam chunks untuk menghindari memory issues
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            return temp_file.name

    def _validate_csv_format(self, file_path):
        """
        Memvalidasi format dan isi file CSV

        Args:
            file_path (str): Path ke file CSV

        Raises:
            ValueError: Jika format tidak valid
        """
        is_valid, message = validate_sessions_arcs_csv(file_path)
        if not is_valid:
            raise ValueError(message)

        logger.info("Validasi format CSV berhasil")

    def _process_arcs_data(self, file_path):
        """
        Memproses data ARCS dengan clustering dan menyimpan ke database

        Args:
            file_path (str): Path ke file CSV

        Returns:
            dict: Hasil pemrosesan
        """
        logger.info("Memulai pemrosesan data ARCS...")

        result = sessions_assign_motivation_profiles(file_path)

        logger.info(f"Pemrosesan selesai: {result}")
        return result

    def _prepare_success_response(self, processing_result):
        """
        Menyiapkan response sukses dengan statistik lengkap

        Args:
            processing_result (dict): Hasil pemrosesan

        Returns:
            dict: Data response
        """
        # Menyiapkan pesan response
        response_message = (
            f"Berhasil memperbarui {processing_result['updated_count']} profil motivasi siswa. "
            f"Total diproses: {processing_result['total_processed']}"
        )

        if processing_result["skipped_count"] > 0:
            response_message += (
                f" ({processing_result['skipped_count']} siswa dilewati "
                "karena username tidak ditemukan atau data tidak valid)"
            )

        # Menghitung persentase keberhasilan
        success_rate = (
            (processing_result["updated_count"] / processing_result["total_processed"])
            * 100
            if processing_result["total_processed"] > 0
            else 0
        )

        return {
            "message": response_message,
            "details": {
                "updated": processing_result["updated_count"],
                "skipped": processing_result["skipped_count"],
                "total": processing_result["total_processed"],
                "success_rate": round(success_rate, 1),
            },
            "next_steps": {
                "export_report": "Anda dapat mengexport laporan clustering",
                "view_analysis": "Lihat hasil analisis pada dashboard",
                "group_formation": "Lanjutkan ke pembentukan kelompok",
            },
        }


class TeacherSessionsARCSSampleView(APIView):
    """
    API untuk mendapatkan contoh format file CSV ARCS untuk sessions

    Endpoint ini menyediakan:
    1. Template format file CSV
    2. Contoh data untuk setiap format
    3. Panduan penggunaan
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, *args, **kwargs):
        """
        Mengembalikan contoh format file CSV ARCS

        Returns:
            Response: Template dan contoh format CSV
        """
        logger.info(f"Teacher {request.user.username} mengakses sample format CSV")

        sample_data = {
            "format_1": {
                "description": "Format dengan dimensi ARCS (20 pertanyaan)",
                "explanation": "Setiap dimensi ARCS memiliki 5 pertanyaan dengan skala 1-5",
                "columns": [
                    "username",
                    "dim_A_q1",
                    "dim_A_q2",
                    "dim_A_q3",
                    "dim_A_q4",
                    "dim_A_q5",
                    "dim_R_q1",
                    "dim_R_q2",
                    "dim_R_q3",
                    "dim_R_q4",
                    "dim_R_q5",
                    "dim_C_q1",
                    "dim_C_q2",
                    "dim_C_q3",
                    "dim_C_q4",
                    "dim_C_q5",
                    "dim_S_q1",
                    "dim_S_q2",
                    "dim_S_q3",
                    "dim_S_q4",
                    "dim_S_q5",
                ],
                "example": [
                    {
                        "username": "student001",
                        "dim_A_q1": 4,
                        "dim_A_q2": 5,
                        "dim_A_q3": 4,
                        "dim_A_q4": 5,
                        "dim_A_q5": 4,
                        "dim_R_q1": 3,
                        "dim_R_q2": 4,
                        "dim_R_q3": 4,
                        "dim_R_q4": 3,
                        "dim_R_q5": 4,
                        "dim_C_q1": 5,
                        "dim_C_q2": 4,
                        "dim_C_q3": 5,
                        "dim_C_q4": 4,
                        "dim_C_q5": 5,
                        "dim_S_q1": 4,
                        "dim_S_q2": 5,
                        "dim_S_q3": 4,
                        "dim_S_q4": 4,
                        "dim_S_q5": 5,
                    },
                    {
                        "username": "student002",
                        "dim_A_q1": 3,
                        "dim_A_q2": 3,
                        "dim_A_q3": 2,
                        "dim_A_q4": 3,
                        "dim_A_q5": 3,
                        "dim_R_q1": 4,
                        "dim_R_q2": 5,
                        "dim_R_q3": 4,
                        "dim_R_q4": 4,
                        "dim_R_q5": 5,
                        "dim_C_q1": 3,
                        "dim_C_q2": 2,
                        "dim_C_q3": 3,
                        "dim_C_q4": 2,
                        "dim_C_q5": 3,
                        "dim_S_q1": 4,
                        "dim_S_q2": 4,
                        "dim_S_q3": 3,
                        "dim_S_q4": 4,
                        "dim_S_q5": 4,
                    },
                ],
            },
            "format_2": {
                "description": "Format langsung dengan nilai ARCS",
                "explanation": "Rata-rata nilai untuk setiap dimensi ARCS (skala 1.0-5.0)",
                "columns": [
                    "username",
                    "attention",
                    "relevance",
                    "confidence",
                    "satisfaction",
                ],
                "example": [
                    {
                        "username": "student001",
                        "attention": 4.2,
                        "relevance": 3.6,
                        "confidence": 4.6,
                        "satisfaction": 4.4,
                    },
                    {
                        "username": "student002",
                        "attention": 3.8,
                        "relevance": 4.0,
                        "confidence": 3.2,
                        "satisfaction": 3.9,
                    },
                ],
            },
            "guidelines": {
                "file_requirements": [
                    "File harus berformat .csv",
                    "Maksimal ukuran file 5MB",
                    "Kolom 'username' wajib ada",
                    "Username harus sesuai dengan data siswa di sistem",
                ],
                "data_requirements": [
                    "Semua nilai harus berupa angka",
                    "Skala nilai 1-5 atau 1-7",
                    "Tidak boleh ada username duplikat",
                    "Minimal 3 siswa untuk clustering",
                ],
                "process_info": [
                    "Sistem akan otomatis mendeteksi format yang digunakan",
                    "Clustering menggunakan K-Means dengan 3 level: Low, Medium, High",
                    "Level ditentukan berdasarkan rata-rata skor ARCS",
                    "Hasil akan tersimpan di profil motivasi siswa",
                ],
            },
        }

        return Response(sample_data, status=status.HTTP_200_OK)
