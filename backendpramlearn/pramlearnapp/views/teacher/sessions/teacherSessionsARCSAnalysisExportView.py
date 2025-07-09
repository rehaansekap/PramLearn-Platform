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
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request):
        """Export ARCS clustering analysis as PDF"""
        logger.info("=== ARCS Analysis Export Request Started ===")

        # Parameter format opsional, default ke PDF
        export_format = request.GET.get("format", "pdf").lower()
        logger.info(f"Requested format: {export_format}")

        # Hanya mendukung PDF untuk saat ini
        if export_format not in ["pdf", ""]:
            logger.warning(f"Invalid format requested: {export_format}")
            return Response(
                {"error": "Format tidak didukung. Gunakan format=pdf atau kosongkan"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # ... rest of the code remains the same
            logger.info("Initializing PDF service...")
            pdf_service = ARCSClusteringPDFService()

            logger.info("Generating PDF content...")
            pdf_content = pdf_service.generate_clustering_analysis_report()

            logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")

            # Create response
            response = HttpResponse(pdf_content, content_type="application/pdf")
            filename = (
                f"analisis_clustering_arcs_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
            )

            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            response["Content-Length"] = len(pdf_content)
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            logger.info(f"Response headers set, filename: {filename}")
            logger.info("=== ARCS Analysis Export Request Completed Successfully ===")

            return HttpResponse(pdf_content, content_type="application/pdf")

        except Exception as e:
            logger.error("=== ARCS Analysis Export Request Failed ===")
            logger.error(f"Error: {str(e)}")

            return Response(
                {"error": f"Terjadi kesalahan saat membuat PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
