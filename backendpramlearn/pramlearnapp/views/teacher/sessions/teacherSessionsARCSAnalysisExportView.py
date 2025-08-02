from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from pramlearnapp.permissions import IsTeacherUser
from pramlearnapp.services.arcs_clustering_pdf_service import ARCSClusteringPDFService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class TeacherSessionsARCSAnalysisExportView(APIView):
    """
    API untuk export analisis clustering ARCS dalam format PDF

    Endpoint ini menyediakan:
    1. Export laporan clustering dalam format PDF
    2. Statistik distribusi level motivasi
    3. Detail profil siswa per cluster
    4. Visualisasi hasil clustering
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        """
        Export ARCS clustering analysis sebagai file PDF

        Query Parameters:
        - format: Format export (default: pdf)

        Returns:
            HttpResponse: File PDF laporan clustering
        """
        logger.info(
            f"=== ARCS Analysis Export Request Started by {request.user.username} ==="
        )

        try:
            # Langkah 1: Validasi parameter request
            export_format = self._validate_export_parameters(request)

            # Langkah 2: Generate konten PDF
            pdf_content = self._generate_pdf_report()

            # Langkah 3: Prepare HTTP response dengan PDF
            response = self._create_pdf_response(pdf_content)

            logger.info("=== ARCS Analysis Export Request Completed Successfully ===")
            return response

        except ValueError as ve:
            # Error validasi parameter
            logger.warning(f"Invalid export parameters: {str(ve)}")
            return Response(
                {"error": str(ve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # Error sistem
            logger.error("=== ARCS Analysis Export Request Failed ===")
            logger.error(f"Error: {str(e)}")

            return Response(
                {"error": f"Terjadi kesalahan saat membuat laporan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _validate_export_parameters(self, request):
        """
        Memvalidasi parameter export dari request

        Args:
            request: Django request object

        Returns:
            str: Format export yang valid

        Raises:
            ValueError: Jika parameter tidak valid
        """
        # Parameter format opsional, default ke PDF
        export_format = request.GET.get("format", "pdf").lower()
        logger.info(f"Requested export format: {export_format}")

        # Validasi format yang didukung
        supported_formats = ["pdf", ""]
        if export_format not in supported_formats:
            raise ValueError(
                "Format tidak didukung. Gunakan format=pdf atau kosongkan parameter format"
            )

        return export_format

    def _generate_pdf_report(self):
        """
        Generate konten PDF laporan clustering

        Returns:
            bytes: Konten PDF yang sudah di-generate

        Raises:
            Exception: Jika terjadi error saat generate PDF
        """
        logger.info("Initializing PDF service...")

        # Inisialisasi service untuk generate PDF
        pdf_service = ARCSClusteringPDFService()

        logger.info("Generating PDF content...")

        # Generate laporan clustering yang komprehensif
        pdf_content = pdf_service.generate_clustering_analysis_report()

        logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")
        return pdf_content

    def _create_pdf_response(self, pdf_content):
        """
        Membuat HTTP response untuk download PDF

        Args:
            pdf_content (bytes): Konten PDF

        Returns:
            HttpResponse: Response untuk download PDF
        """
        # Membuat filename dengan timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"analisis_clustering_arcs_{timestamp}.pdf"

        # Membuat HTTP response dengan konten PDF
        response = HttpResponse(pdf_content, content_type="application/pdf")

        # Set headers untuk download
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Content-Length"] = len(pdf_content)

        # Headers untuk mencegah caching
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"

        logger.info(f"PDF response prepared - filename: {filename}")
        return response


class TeacherSessionsARCSAnalysisStatisticsView(APIView):
    """
    API untuk mendapatkan statistik analisis clustering ARCS

    Endpoint ini menyediakan:
    1. Distribusi level motivasi siswa
    2. Statistik per dimensi ARCS
    3. Informasi clustering model
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        """
        Mendapatkan statistik clustering ARCS untuk dashboard

        Returns:
            Response: Statistik lengkap hasil clustering
        """
        logger.info(f"Teacher {request.user.username} mengakses statistik clustering")

        try:
            # Import processor untuk mendapatkan statistik
            from pramlearnapp.views.student.arcs.arcs_processor import ARCSProcessor

            processor = ARCSProcessor()

            # Mendapatkan statistik distribusi level motivasi
            distribution_stats = processor.get_cluster_statistics()

            # Mendapatkan informasi model clustering
            model_info = processor.get_clustering_model_info()

            # Menyiapkan response data
            response_data = {
                "distribution": distribution_stats,
                "model_info": model_info,
                "summary": {
                    "total_analyzed": distribution_stats["total"],
                    "needs_analysis": distribution_stats["unanalyzed"],
                    "analysis_completion": (
                        round(
                            (
                                distribution_stats["total"]
                                / (
                                    distribution_stats["total"]
                                    + distribution_stats["unanalyzed"]
                                )
                            )
                            * 100,
                            1,
                        )
                        if distribution_stats["total"]
                        + distribution_stats["unanalyzed"]
                        > 0
                        else 0
                    ),
                },
                "recommendations": self._generate_recommendations(distribution_stats),
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error getting clustering statistics: {str(e)}")
            return Response(
                {"error": f"Gagal mengambil statistik: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _generate_recommendations(self, stats):
        """
        Generate rekomendasi berdasarkan distribusi clustering

        Args:
            stats (dict): Statistik distribusi

        Returns:
            list: Daftar rekomendasi
        """
        recommendations = []

        if stats["total"] == 0:
            recommendations.append(
                "Belum ada data clustering. Upload file CSV ARCS untuk memulai analisis."
            )
            return recommendations

        # Analisis distribusi
        high_percentage = (stats["high"] / stats["total"]) * 100
        low_percentage = (stats["low"] / stats["total"]) * 100

        if low_percentage > 40:
            recommendations.append(
                "Persentase siswa dengan motivasi rendah cukup tinggi. "
                "Pertimbangkan strategi peningkatan motivasi."
            )

        if high_percentage > 50:
            recommendations.append(
                "Sebagian besar siswa memiliki motivasi tinggi. "
                "Manfaatkan untuk peer learning dan mentoring."
            )

        if stats["unanalyzed"] > 0:
            recommendations.append(
                f"Masih ada {stats['unanalyzed']} siswa yang belum dianalisis. "
                "Pastikan semua siswa mengisi kuesioner ARCS."
            )

        recommendations.append(
            "Gunakan hasil clustering untuk pembentukan kelompok yang optimal."
        )

        return recommendations
