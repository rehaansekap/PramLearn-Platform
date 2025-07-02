from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.colors import HexColor
from django.db.models import Count, Avg
from pramlearnapp.models.user import StudentMotivationProfile, CustomUser
from io import BytesIO
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ARCSClusteringPDFService:
    def __init__(self):
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )

        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        self.story = []

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.title_style = ParagraphStyle(
            "CustomTitle",
            parent=self.styles["Heading1"],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=HexColor("#1677ff"),
            fontName="Helvetica-Bold",
        )

        self.heading_style = ParagraphStyle(
            "CustomHeading",
            parent=self.styles["Heading2"],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=HexColor("#262626"),
            fontName="Helvetica-Bold",
        )

        self.normal_style = ParagraphStyle(
            "CustomNormal",
            parent=self.styles["Normal"],
            fontSize=11,
            spaceAfter=12,
            textColor=HexColor("#595959"),
            alignment=TA_JUSTIFY,
        )

    def generate_clustering_analysis_report(self):
        """Generate comprehensive ARCS clustering analysis PDF"""
        try:
            logger.info("Starting ARCS Clustering PDF generation")

            # 1. Cover Page
            self._add_cover_page()

            # 2. Executive Summary
            self._add_executive_summary()

            # 3. Data Overview
            self._add_data_overview()

            # 4. Clustering Process Analysis
            self._add_clustering_process()

            # 5. Results Analysis
            self._add_results_analysis()

            # 6. Statistical Analysis
            self._add_statistical_analysis()

            # 7. Recommendations
            self._add_recommendations()

            # Build PDF
            self.doc.build(self.story)
            pdf_content = self.buffer.getvalue()
            self.buffer.close()

            logger.info(
                f"ARCS Clustering PDF generated successfully, size: {len(pdf_content)} bytes"
            )
            return pdf_content

        except Exception as e:
            logger.error(f"Error in ARCS Clustering PDF generation: {str(e)}")
            raise Exception(f"PDF generation failed: {str(e)}")

    def _add_cover_page(self):
        """Add cover page"""
        # Title
        title = Paragraph(
            "LAPORAN ANALISIS CLUSTERING<br/>PROFIL MOTIVASI ARCS", self.title_style
        )
        self.story.append(title)
        self.story.append(Spacer(1, 0.5 * inch))

        # Subtitle
        subtitle_style = ParagraphStyle(
            "Subtitle",
            parent=self.styles["Normal"],
            fontSize=14,
            alignment=TA_CENTER,
            textColor=colors.grey,
        )

        subtitle = Paragraph(
            "Analisis Clustering K-Means untuk Pengelompokan<br/>Tingkat Motivasi Belajar Siswa",
            subtitle_style,
        )
        self.story.append(subtitle)
        self.story.append(Spacer(1, 1 * inch))

        # Info box
        info_data = [
            ["Metode Clustering", "K-Means Algorithm"],
            ["Jumlah Cluster", "3 (High, Medium, Low)"],
            ["Tanggal Analisis", datetime.now().strftime("%d %B %Y")],
            ["Sistem", "PramLearn - Platform Pembelajaran Adaptif"],
        ]

        info_table = Table(info_data, colWidths=[2.5 * inch, 3 * inch])
        info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f0f7ff")),
                    ("GRID", (0, 0), (-1, -1), 1, colors.lightgrey),
                    ("FONT", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )

        self.story.append(info_table)
        self.story.append(PageBreak())

    def _add_executive_summary(self):
        """Add executive summary"""
        self.story.append(Paragraph("📋 RINGKASAN EKSEKUTIF", self.heading_style))

        stats = self._get_clustering_statistics()

        summary_text = f"""
        <b>Hasil Analisis Clustering ARCS:</b><br/><br/>
        
        Sistem telah berhasil melakukan analisis clustering terhadap {stats['total_students']} siswa 
        berdasarkan profil motivasi ARCS (Attention, Relevance, Confidence, Satisfaction). 
        Analisis menggunakan algoritma K-Means dengan 3 cluster yang menghasilkan distribusi sebagai berikut:<br/><br/>
        
        <b>📊 DISTRIBUSI MOTIVASI:</b><br/>
        • <b>High Motivation:</b> {stats['high']} siswa ({stats['high_percentage']:.1f}%)<br/>
        • <b>Medium Motivation:</b> {stats['medium']} siswa ({stats['medium_percentage']:.1f}%)<br/>
        • <b>Low Motivation:</b> {stats['low']} siswa ({stats['low_percentage']:.1f}%)<br/><br/>
        
        <b>🎯 IMPLIKASI PEMBELAJARAN:</b><br/>
        Hasil clustering ini memungkinkan personalisasi strategi pembelajaran yang tepat sasaran 
        untuk setiap kelompok motivasi, sehingga dapat meningkatkan efektivitas proses belajar mengajar.
        """

        summary_para = Paragraph(summary_text, self.normal_style)
        self.story.append(summary_para)
        self.story.append(Spacer(1, 0.3 * inch))

    def _add_data_overview(self):
        """Add data overview section"""
        self.story.append(Paragraph("📊 GAMBARAN UMUM DATA", self.heading_style))

        stats = self._get_clustering_statistics()
        arcs_stats = self._get_arcs_dimension_statistics()

        # Data summary table
        data_summary = [
            ["Metrik", "Nilai", "Keterangan"],
            [
                "Total Siswa Dianalisis",
                str(stats["total_students"]),
                "Siswa dengan profil ARCS lengkap",
            ],
            ["Dimensi ARCS", "4", "Attention, Relevance, Confidence, Satisfaction"],
            ["Rentang Skor", "1 - 5", "Skala Likert 5 poin"],
            [
                "Metode Normalisasi",
                "StandardScaler",
                "Standarisasi untuk kesetaraan skala",
            ],
        ]

        summary_table = Table(
            data_summary, colWidths=[2 * inch, 1.5 * inch, 2.5 * inch]
        )
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1677ff")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        self.story.append(summary_table)
        self.story.append(Spacer(1, 0.2 * inch))

        # ARCS Dimensions Statistics
        arcs_text = f"""
        <b>📈 STATISTIK DIMENSI ARCS:</b><br/>
        • <b>Attention (Perhatian):</b> Rata-rata {arcs_stats['attention']['interpretation']} ± {arcs_stats['attention']['std_dev']:.2f}<br/>
        • <b>Relevance (Relevansi):</b> Rata-rata {arcs_stats['relevance']['mean']:.2f} ± {arcs_stats['relevance']['std_dev']:.2f}<br/>
        • <b>Confidence (Kepercayaan Diri):</b> Rata-rata {arcs_stats['confidence']['mean']:.2f} ± {arcs_stats['confidence']['std_dev']:.2f}<br/>
        • <b>Satisfaction (Kepuasan):</b> Rata-rata {arcs_stats['satisfaction']['mean']:.2f} ± {arcs_stats['satisfaction']['std_dev']:.2f}<br/>
        """

        arcs_para = Paragraph(arcs_text, self.normal_style)
        self.story.append(arcs_para)
        self.story.append(Spacer(1, 0.3 * inch))

    def _add_clustering_process(self):
        """Add clustering process explanation"""
        self.story.append(Paragraph("⚙️ PROSES CLUSTERING", self.heading_style))

        process_text = """
        <b>1. PREPROCESSING DATA</b><br/>
        • Ekstraksi data ARCS dari database siswa<br/>
        • Validasi kelengkapan data (4 dimensi ARCS)<br/>
        • Normalisasi menggunakan StandardScaler untuk menyetarakan skala<br/><br/>
        
        <b>2. ALGORITMA K-MEANS</b><br/>
        • Algoritma: K-Means Clustering<br/>
        • Jumlah cluster (k): 3<br/>
        • Random state: 42 (untuk reproducibility)<br/>
        • Initialization: k-means++<br/>
        • Max iterations: 300<br/>
        • N_init: 10 (jumlah inisialisasi berbeda)<br/><br/>
        
        <b>3. PENENTUAN LABEL CLUSTER</b><br/>
        • Hitung centroid rata-rata untuk setiap cluster<br/>
        • Urutkan cluster berdasarkan nilai centroid<br/>
        • Mapping: Centroid terendah = Low, tengah = Medium, tertinggi = High<br/>
        • Ini memastikan label yang konsisten dan bermakna<br/><br/>
        
        <b>4. VALIDASI HASIL</b><br/>
        • Verifikasi distribusi cluster yang reasonable<br/>
        • Analisis silhouette score untuk kualitas clustering<br/>
        • Update database dengan hasil clustering baru<br/>
        """

        process_para = Paragraph(process_text, self.normal_style)
        self.story.append(process_para)
        self.story.append(Spacer(1, 0.3 * inch))

    def _add_results_analysis(self):
        """Add results analysis"""
        self.story.append(Paragraph("📈 ANALISIS HASIL CLUSTERING", self.heading_style))

        stats = self._get_clustering_statistics()

        # Cluster distribution table
        cluster_data = [
            ["Cluster", "Jumlah Siswa", "Persentase", "Karakteristik Utama"],
            [
                "High Motivation",
                str(stats["high"]),
                f"{stats['high_percentage']:.1f}%",
                "Skor ARCS tinggi di semua dimensi",
            ],
            [
                "Medium Motivation",
                str(stats["medium"]),
                f"{stats['medium_percentage']:.1f}%",
                "Skor ARCS sedang, berpotensi ditingkatkan",
            ],
            [
                "Low Motivation",
                str(stats["low"]),
                f"{stats['low_percentage']:.1f}%",
                "Skor ARCS rendah, memerlukan intervensi khusus",
            ],
        ]

        cluster_table = Table(
            cluster_data, colWidths=[1.5 * inch, 1 * inch, 1 * inch, 2.5 * inch]
        )
        cluster_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#52c41a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (0, 1), HexColor("#d4edda")),  # High - Green
                    (
                        "BACKGROUND",
                        (0, 2),
                        (0, 2),
                        HexColor("#fff3cd"),
                    ),  # Medium - Yellow
                    ("BACKGROUND", (0, 3), (0, 3), HexColor("#f8d7da")),  # Low - Red
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        self.story.append(cluster_table)
        self.story.append(Spacer(1, 0.3 * inch))

        # Detailed cluster analysis
        cluster_analysis_text = """
        <b>🔍 ANALISIS DETAIL CLUSTER:</b><br/><br/>
        
        <b>1. HIGH MOTIVATION CLUSTER</b><br/>
        Siswa dalam kelompok ini menunjukkan motivasi tinggi di semua dimensi ARCS. 
        Mereka cenderung fokus dalam pembelajaran, memahami relevansi materi, 
        percaya diri dalam mengerjakan tugas, dan merasa puas dengan pencapaian mereka.<br/><br/>
        
        <b>2. MEDIUM MOTIVATION CLUSTER</b><br/>
        Siswa dengan motivasi sedang yang memiliki potensi untuk ditingkatkan. 
        Mereka mungkin kuat di beberapa dimensi ARCS namun lemah di dimensi lainnya. 
        Memerlukan strategi pembelajaran yang tepat sasaran.<br/><br/>
        
        <b>3. LOW MOTIVATION CLUSTER</b><br/>
        Siswa yang memerlukan perhatian khusus dan intervensi pembelajaran yang intensif. 
        Motivasi rendah di sebagian besar atau semua dimensi ARCS. 
        Membutuhkan pendekatan pembelajaran yang lebih personal dan menarik.<br/>
        """

        analysis_para = Paragraph(cluster_analysis_text, self.normal_style)
        self.story.append(analysis_para)

    def _add_statistical_analysis(self):
        """Add statistical analysis"""
        self.story.append(PageBreak())
        self.story.append(
            Paragraph("📊 ANALISIS STATISTIK LANJUTAN", self.heading_style)
        )

        arcs_stats = self._get_arcs_dimension_statistics()

        # ARCS dimension comparison table
        dimension_data = [
            ["Dimensi ARCS", "Mean", "Std Dev", "Min", "Max", "Interpretasi"],
            [
                "Attention",
                f"{arcs_stats['attention']['mean']:.2f}",
                f"{arcs_stats['attention']['std_dev']:.2f}",
                f"{arcs_stats['attention']['min']:.1f}",
                f"{arcs_stats['attention']['max']:.1f}",
                arcs_stats["attention"]["interpretation"],
            ],
            [
                "Relevance",
                f"{arcs_stats['relevance']['mean']:.2f}",
                f"{arcs_stats['relevance']['std_dev']:.2f}",
                f"{arcs_stats['relevance']['min']:.1f}",
                f"{arcs_stats['relevance']['max']:.1f}",
                arcs_stats["relevance"]["interpretation"],
            ],
            [
                "Confidence",
                f"{arcs_stats['confidence']['mean']:.2f}",
                f"{arcs_stats['confidence']['std_dev']:.2f}",
                f"{arcs_stats['confidence']['min']:.1f}",
                f"{arcs_stats['confidence']['max']:.1f}",
                arcs_stats["confidence"]["interpretation"],
            ],
            [
                "Satisfaction",
                f"{arcs_stats['satisfaction']['mean']:.2f}",
                f"{arcs_stats['satisfaction']['std_dev']:.2f}",
                f"{arcs_stats['satisfaction']['min']:.1f}",
                f"{arcs_stats['satisfaction']['max']:.1f}",
                arcs_stats["satisfaction"]["interpretation"],
            ],
        ]

        dimension_table = Table(
            dimension_data,
            colWidths=[
                1.2 * inch,
                0.8 * inch,
                0.8 * inch,
                0.6 * inch,
                0.6 * inch,
                1.5 * inch,
            ],
        )
        dimension_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#722ed1")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.lavender),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        table = Table(dimension_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#11418b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        self.story.append(table)
        self.story.append(Spacer(1, 20))

    def _add_recommendations(self):
        """Add recommendations section"""
        self.story.append(
            Paragraph("💡 REKOMENDASI STRATEGI PEMBELAJARAN", self.heading_style)
        )

        recommendations_text = """
        <b>🎯 REKOMENDASI BERDASARKAN HASIL CLUSTERING:</b><br/><br/>
        
        <b>1. UNTUK HIGH MOTIVATION CLUSTER:</b><br/>
        • Berikan tantangan pembelajaran yang lebih kompleks<br/>
        • Implementasikan peer tutoring (mentoring siswa lain)<br/>
        • Tawarkan proyek-proyek advanced dan leadership opportunities<br/>
        • Pertahankan motivasi dengan recognition dan rewards<br/><br/>
        
        <b>2. UNTUK MEDIUM MOTIVATION CLUSTER:</b><br/>
        • Identifikasi dimensi ARCS yang lemah untuk intervensi targeted<br/>
        • Implementasikan gamification dan interactive learning<br/>
        • Berikan feedback yang lebih frequent dan konstruktif<br/>
        • Ciptakan collaborative learning environment<br/><br/>
        
        <b>3. UNTUK LOW MOTIVATION CLUSTER:</b><br/>
        • Berikan perhatian individual dan support yang intensif<br/>
        • Implementasikan microlearning dengan step-by-step approach<br/>
        • Gunakan multimedia dan visual aids untuk meningkatkan attention<br/>
        • Buat learning path yang lebih personal dan adaptive<br/>
        • Berikan positive reinforcement secara konsisten<br/><br/>
        
        <b>🔄 MONITORING DAN EVALUASI:</b><br/>
        • Lakukan re-clustering secara berkala (setiap semester)<br/>
        • Monitor perubahan motivasi siswa<br/>
        • Evaluasi efektivitas strategi pembelajaran yang diterapkan<br/>
        • Adjust strategi berdasarkan feedback dan hasil pembelajaran<br/><br/>
        
        <b>📈 IMPLEMENTASI SISTEM ADAPTIF:</b><br/>
        • Integrasikan hasil clustering ke dalam LMS<br/>
        • Automatic content recommendation based on cluster<br/>
        • Personalized learning path generation<br/>
        • Real-time motivation tracking dan early warning system<br/>
        """

        recommendations_para = Paragraph(recommendations_text, self.normal_style)
        self.story.append(recommendations_para)

    def _get_clustering_statistics(self):
        """Get clustering statistics"""
        try:
            # Get all students with motivation profiles
            profiles = StudentMotivationProfile.objects.all()
            total = profiles.count()

            if total == 0:
                return {
                    "total_students": 0,
                    "high": 0,
                    "medium": 0,
                    "low": 0,
                    "high_percentage": 0,
                    "medium_percentage": 0,
                    "low_percentage": 0,
                }

            # Count by motivation level
            high_count = profiles.filter(motivation_level="High").count()
            medium_count = profiles.filter(motivation_level="Medium").count()
            low_count = profiles.filter(motivation_level="Low").count()

            return {
                "total_students": total,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
                "high_percentage": (high_count / total) * 100,
                "medium_percentage": (medium_count / total) * 100,
                "low_percentage": (low_count / total) * 100,
            }
        except Exception as e:
            logger.error(f"Error getting clustering statistics: {e}")
            return {
                "total_students": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "high_percentage": 0,
                "medium_percentage": 0,
                "low_percentage": 0,
            }

    def _get_arcs_dimension_statistics(self):
        """Get ARCS dimension statistics from StudentMotivationProfile"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile
            from django.db.models import Avg, Count, Min, Max, StdDev

            # Get profiles with valid ARCS data
            profiles = StudentMotivationProfile.objects.filter(
                attention__isnull=False,
                relevance__isnull=False,
                confidence__isnull=False,
                satisfaction__isnull=False,
            ).exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)

            if not profiles.exists():
                logger.warning("No valid ARCS profiles found")
                return self._get_empty_arcs_statistics()

            # Calculate statistics for each dimension
            stats = profiles.aggregate(
                # Attention statistics
                attention_avg=Avg("attention"),
                attention_min=Min("attention"),
                attention_max=Max("attention"),
                attention_std=StdDev("attention"),
                # Relevance statistics
                relevance_avg=Avg("relevance"),
                relevance_min=Min("relevance"),
                relevance_max=Max("relevance"),
                relevance_std=StdDev("relevance"),
                # Confidence statistics
                confidence_avg=Avg("confidence"),
                confidence_min=Min("confidence"),
                confidence_max=Max("confidence"),
                confidence_std=StdDev("confidence"),
                # Satisfaction statistics
                satisfaction_avg=Avg("satisfaction"),
                satisfaction_min=Min("satisfaction"),
                satisfaction_max=Max("satisfaction"),
                satisfaction_std=StdDev("satisfaction"),
                # Total count
                total_count=Count("id"),
            )

            # Format results
            dimensions = {
                'attention': {
                    'mean': round(stats['attention_avg'] or 0, 2),
                    'std_dev': round(stats['attention_std'] or 0, 2),
                    'min': round(stats['attention_min'] or 0, 2),
                    'max': round(stats['attention_max'] or 0, 2),
                    'interpretation': self._get_interpretation(stats['attention_avg'] or 0)  
                },
                'relevance': {
                    'mean': round(stats['relevance_avg'] or 0, 2),
                    'std_dev': round(stats['relevance_std'] or 0, 2),
                    'min': round(stats['relevance_min'] or 0, 2),
                    'max': round(stats['relevance_max'] or 0, 2),
                    'interpretation': self._get_interpretation(stats['relevance_avg'] or 0)   
                },
                'confidence': {
                    'mean': round(stats['confidence_avg'] or 0, 2),
                    'std_dev': round(stats['confidence_std'] or 0, 2),
                    'min': round(stats['confidence_min'] or 0, 2),
                    'max': round(stats['confidence_max'] or 0, 2),
                    'interpretation': self._get_interpretation(stats['confidence_avg'] or 0) 
                },
                'satisfaction': {
                    'mean': round(stats['satisfaction_avg'] or 0, 2),
                    'std_dev': round(stats['satisfaction_std'] or 0, 2),
                    'min': round(stats['satisfaction_min'] or 0, 2),
                    'max': round(stats['satisfaction_max'] or 0, 2),
                    'interpretation': self._get_interpretation(stats['satisfaction_avg'] or 0) 
                }
            }
            
            logger.info(f"ARCS statistics calculated for {stats['total_count']} profiles")
            return dimensions
            
        except Exception as e:
            logger.error(f"Error getting ARCS dimension statistics: {e}")
            return self._get_empty_arcs_statistics()

    def _get_empty_arcs_statistics(self):
        """Return empty statistics when no data available"""
        empty_stat = {
            "mean": 0.00,
            "std_dev": 0.00,
            "min": 0.00,
            "max": 0.00,
            "interpretation": "Tidak Ada Data",
        }
        return {
            "attention": empty_stat.copy(),
            "relevance": empty_stat.copy(),
            "confidence": empty_stat.copy(),
            "satisfaction": empty_stat.copy(),
        }

    def _get_interpretation(self, score):
        """Get interpretation for ARCS score"""
        if score >= 4.0:
            return "Sangat Tinggi"
        elif score >= 3.0:
            return "Tinggi"
        elif score >= 2.0:
            return "Sedang"
        elif score >= 1.0:
            return "Rendah"
        else:
            return "Perlu Perbaikan"

    def _interpret_score(self, score):
        """Interpret ARCS score"""
        if score >= 4.0:
            return "Sangat Baik"
        elif score >= 3.5:
            return "Baik"
        elif score >= 3.0:
            return "Sedang"
        elif score >= 2.5:
            return "Cukup"
        else:
            return "Perlu Perbaikan"
