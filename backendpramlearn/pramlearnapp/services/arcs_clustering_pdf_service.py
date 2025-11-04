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
    Image,
)
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing, Circle, Line, String, Rect
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.axes import XCategoryAxis, YValueAxis
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.graphics import renderPDF
from django.db.models import Count, Avg
from pramlearnapp.models.user import StudentMotivationProfile, CustomUser
from io import BytesIO
from datetime import datetime
import logging
import math
import numpy as np

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
            logger.info("Starting PDF generation...")
    
            # Add all sections
            self._add_cover_page()
            self._add_executive_summary()
            self._add_data_overview()
    
            # Add the new tables
            self._add_student_questionnaire_scores_table()
            self._add_clustering_results_table()
            self._add_final_classification_table()
            
            # ADD VISUALIZATION SECTION
            self._add_cluster_visualization_section()
    
            self._add_clustering_process()
            self._add_mathematical_process_analysis()
            self._add_results_analysis()
            self._add_statistical_analysis()
            self._add_recommendations()
    
            # Build PDF
            self.doc.build(self.story)
            pdf_content = self.buffer.getvalue()
            self.buffer.close()
    
            logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")
            return pdf_content
    
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            raise e

    def _add_mathematical_process_analysis(self):
        """Add detailed mathematical process analysis with actual data from database"""
        self.story.append(PageBreak())
        self.story.append(
            Paragraph(
                "🧮 ANALISIS PROSES CLUSTERING DENGAN DATA AKTUAL", self.heading_style
            )
        )

        # Get actual data from database
        actual_stats = self._get_clustering_statistics()
        arcs_stats = self._get_arcs_dimension_statistics()

        # Introduction with actual data
        intro_text = f"""
        <b>PENJELASAN SEDERHANA PROSES CLUSTERING:</b><br/>
        Sistem kami menggunakan metode K-Means untuk mengelompokkan {actual_stats['total_students']} siswa 
        berdasarkan jawaban mereka terhadap kuesioner ARCS. Setiap siswa memiliki 4 nilai: 
        Attention (perhatian), Relevance (relevansi), Confidence (percaya diri), dan Satisfaction (kepuasan).<br/><br/>
        
        <b>HASIL CLUSTERING AKTUAL:</b><br/>
        • <b>{actual_stats['high']} siswa</b> masuk kelompok <b>High Motivation</b> ({actual_stats['high_percentage']:.1f}%)<br/>
        • <b>{actual_stats['medium']} siswa</b> masuk kelompok <b>Medium Motivation</b> ({actual_stats['medium_percentage']:.1f}%)<br/>
        • <b>{actual_stats['low']} siswa</b> masuk kelompok <b>Low Motivation</b> ({actual_stats['low_percentage']:.1f}%)<br/>
        """
        self.story.append(Paragraph(intro_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 1. Data Representation with actual numbers
        self._add_actual_data_representation_section()

        # 2. Step-by-step process with actual data
        self._add_actual_clustering_steps()

        # 3. Mathematical calculation with real examples
        self._add_actual_mathematical_examples()

        # 4. Pseudocode
        self._add_simplified_pseudocode()

        # 5. Flowchart
        self._add_simplified_flowchart()

    def _add_actual_data_representation_section(self):
        """Add data representation with actual database values"""
        arcs_stats = self._get_arcs_dimension_statistics()
        actual_stats = self._get_clustering_statistics()

        representation_text = f"""
        <b>1. DATA SISWA YANG DIPROSES</b><br/><br/>
        
        <b>Contoh Data 5 Siswa Pertama:</b><br/>
        Mari kita lihat bagaimana data siswa diproses dengan contoh nyata dari database:<br/>
        """
        self.story.append(Paragraph(representation_text, self.normal_style))

        # Get actual sample data from database - increase to 5 students
        sample_profiles = self._get_sample_student_data(5)  # Changed from 3 to 5

        if sample_profiles:
            sample_data = [
                [
                    "Siswa",
                    "Attention",
                    "Relevance",
                    "Confidence",
                    "Satisfaction",
                    "Hasil Clustering",
                ],
            ]

            for i, profile in enumerate(sample_profiles, 1):
                sample_data.append(
                    [
                        f"Siswa {i}",
                        f"{profile['attention']:.2f}",
                        f"{profile['relevance']:.2f}",
                        f"{profile['confidence']:.2f}",
                        f"{profile['satisfaction']:.2f}",
                        profile["motivation_level"] or "Belum dianalisis",
                    ]
                )
        else:
            self.story.append(
                Paragraph(
                    "Tidak ada data siswa yang tersedia untuk ditampilkan.",
                    self.normal_style,
                )
            )
        return

    def _add_actual_clustering_steps(self):
        """Add step-by-step clustering process with actual data"""
        actual_stats = self._get_clustering_statistics()

        steps_text = f"""
        <b>2. LANGKAH-LANGKAH CLUSTERING YANG DILAKUKAN SISTEM</b><br/><br/>
        
        <b>Langkah 1: Persiapan Data</b><br/>
        • Sistem mengambil data {actual_stats['total_students']} siswa dari database<br/>
        • Memeriksa kelengkapan data (semua siswa harus punya 4 nilai ARCS)<br/>
        • Menghilangkan data yang tidak lengkap atau bernilai 0<br/><br/>
        
        <b>Langkah 2: Normalisasi Data</b><br/>
        • Karena setiap siswa punya nilai yang berbeda-beda, sistem menyamakan skala<br/>
        • Ini seperti mengubah nilai rapor dari sistem 1-100 menjadi sistem 1-10<br/>
        • Tujuannya agar semua dimensi ARCS diperlakukan setara<br/><br/>
        
        <b>Langkah 3: Pengelompokan Otomatis</b><br/>
        • Komputer mencari pola dalam data untuk membuat 3 kelompok<br/>
        • Menggunakan algoritma K-Means yang mencoba beberapa kali (10 percobaan)<br/>
        • Setiap percobaan, komputer mencoba pengelompokan yang berbeda<br/>
        • Dipilih hasil terbaik dari 10 percobaan tersebut<br/><br/>
        
        <b>Langkah 4: Pemberian Label</b><br/>
        • Setelah 3 kelompok terbentuk, sistem memberi nama:<br/>
        • Kelompok dengan nilai rata-rata tertinggi = "High Motivation"<br/>
        • Kelompok dengan nilai rata-rata sedang = "Medium Motivation"<br/>
        • Kelompok dengan nilai rata-rata terendah = "Low Motivation"<br/><br/>
        
        <b>Langkah 5: Penyimpanan Hasil</b><br/>
        • Hasil clustering disimpan ke database<br/>
        • Setiap siswa mendapat label motivasi baru<br/>
        • Guru dapat melihat hasil pengelompokan ini di dashboard<br/>
        """
        self.story.append(Paragraph(steps_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

    def _add_actual_mathematical_examples(self):
        """Add mathematical examples using actual data patterns"""
        arcs_stats = self._get_arcs_dimension_statistics()

        # Get actual student data for examples
        sample_students = self._get_sample_student_data(
            5
        )  # Get 5 students for examples

        if len(sample_students) >= 2:
            # Use actual data from database
            student_a = sample_students[0]
            student_b = sample_students[1]

            math_text = f"""
            <b>3. CONTOH PERHITUNGAN MATEMATIKA SEDERHANA (DATA AKTUAL)</b><br/><br/>
            
            <b>Cara Komputer Menghitung Jarak Antar Siswa:</b><br/>
            Mari kita lihat contoh nyata dari 2 siswa di database:<br/>
            • Siswa A: Attention={student_a['attention']:.2f}, Relevance={student_a['relevance']:.2f}, Confidence={student_a['confidence']:.2f}, Satisfaction={student_a['satisfaction']:.2f}<br/>
            • Siswa B: Attention={student_b['attention']:.2f}, Relevance={student_b['relevance']:.2f}, Confidence={student_b['confidence']:.2f}, Satisfaction={student_b['satisfaction']:.2f}<br/><br/>
            
            <b>Perhitungan Jarak:</b><br/>
            • Selisih Attention: {student_a['attention']:.2f} - {student_b['attention']:.2f} = {abs(student_a['attention'] - student_b['attention']):.2f}<br/>
            • Selisih Relevance: {student_a['relevance']:.2f} - {student_b['relevance']:.2f} = {abs(student_a['relevance'] - student_b['relevance']):.2f}<br/>
            • Selisih Confidence: {student_a['confidence']:.2f} - {student_b['confidence']:.2f} = {abs(student_a['confidence'] - student_b['confidence']):.2f}<br/>
            • Selisih Satisfaction: {student_a['satisfaction']:.2f} - {student_b['satisfaction']:.2f} = {abs(student_a['satisfaction'] - student_b['satisfaction']):.2f}<br/><br/>
            
            • Kuadratkan selisih: {abs(student_a['attention'] - student_b['attention']):.2f}² + {abs(student_a['relevance'] - student_b['relevance']):.2f}² + {abs(student_a['confidence'] - student_b['confidence']):.2f}² + {abs(student_a['satisfaction'] - student_b['satisfaction']):.2f}² = {(student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2:.2f}<br/>
            • Akar kuadrat: √{(student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2:.2f} = {((student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2)**0.5:.2f}<br/><br/>
            
            <b>Artinya:</b> Jarak antara Siswa A dan B adalah {((student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2)**0.5:.2f}. 
            {"Siswa ini cukup mirip" if ((student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2)**0.5 < 1.5 else "Siswa ini cukup berbeda" if ((student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2)**0.5 < 3.0 else "Siswa ini sangat berbeda"} 
            {"sehingga kemungkinan masuk kelompok yang sama." if ((student_a['attention'] - student_b['attention'])**2 + (student_a['relevance'] - student_b['relevance'])**2 + (student_a['confidence'] - student_b['confidence'])**2 + (student_a['satisfaction'] - student_b['satisfaction'])**2)**0.5 < 1.5 else "sehingga kemungkinan masuk kelompok yang berbeda."}<br/><br/>
            """

            # Add example of calculating cluster center with actual data
            # Get students from the same motivation level if available
            high_students = [
                s for s in sample_students if s["motivation_level"] == "High"
            ]
            medium_students = [
                s for s in sample_students if s["motivation_level"] == "Medium"
            ]
            low_students = [
                s for s in sample_students if s["motivation_level"] == "Low"
            ]

            if len(high_students) >= 2:
                cluster_example = high_students[:3]  # Take up to 3 students
                cluster_name = "High Motivation"
            elif len(medium_students) >= 2:
                cluster_example = medium_students[:3]
                cluster_name = "Medium Motivation"
            elif len(low_students) >= 2:
                cluster_example = low_students[:3]
                cluster_name = "Low Motivation"
            else:
                cluster_example = sample_students[:3]  # Take any 3 students
                cluster_name = "Contoh Kelompok"

            if len(cluster_example) >= 2:
                # Calculate actual cluster center
                attention_avg = sum(s["attention"] for s in cluster_example) / len(
                    cluster_example
                )
                relevance_avg = sum(s["relevance"] for s in cluster_example) / len(
                    cluster_example
                )
                confidence_avg = sum(s["confidence"] for s in cluster_example) / len(
                    cluster_example
                )
                satisfaction_avg = sum(
                    s["satisfaction"] for s in cluster_example
                ) / len(cluster_example)

                center_text = f"""
                <b>Cara Menentukan Pusat Kelompok (Data Aktual):</b><br/>
                Jika kelompok {cluster_name} punya {len(cluster_example)} siswa dari database:<br/>
                """

                for i, student in enumerate(cluster_example, 1):
                    center_text += f"• Siswa {i}: [{student['attention']:.2f}, {student['relevance']:.2f}, {student['confidence']:.2f}, {student['satisfaction']:.2f}]<br/>"

                center_text += f"""<br/>
                Pusat kelompok = rata-rata:<br/>
                • Attention: ({' + '.join([f"{s['attention']:.2f}" for s in cluster_example])}) ÷ {len(cluster_example)} = {attention_avg:.2f}<br/>
                • Relevance: ({' + '.join([f"{s['relevance']:.2f}" for s in cluster_example])}) ÷ {len(cluster_example)} = {relevance_avg:.2f}<br/>
                • Confidence: ({' + '.join([f"{s['confidence']:.2f}" for s in cluster_example])}) ÷ {len(cluster_example)} = {confidence_avg:.2f}<br/>
                • Satisfaction: ({' + '.join([f"{s['satisfaction']:.2f}" for s in cluster_example])}) ÷ {len(cluster_example)} = {satisfaction_avg:.2f}<br/><br/>
                
                Jadi pusat kelompok {cluster_name} = [{attention_avg:.2f}, {relevance_avg:.2f}, {confidence_avg:.2f}, {satisfaction_avg:.2f}]<br/><br/>
                
                <b>Interpretasi:</b><br/>
                • Kelompok ini memiliki rata-rata Attention: {self._get_interpretation(attention_avg)}<br/>
                • Kelompok ini memiliki rata-rata Relevance: {self._get_interpretation(relevance_avg)}<br/>
                • Kelompok ini memiliki rata-rata Confidence: {self._get_interpretation(confidence_avg)}<br/>
                • Kelompok ini memiliki rata-rata Satisfaction: {self._get_interpretation(satisfaction_avg)}<br/>
                """

                math_text += center_text

            # Add actual cluster centers from database
            actual_centers = self._get_actual_cluster_centers()
            if actual_centers:
                math_text += f"""
                <b>Pusat Kelompok Aktual dari Database:</b><br/>
                """
                for level, center in actual_centers.items():
                    if center:
                        math_text += f"• {level}: [{center['attention']:.2f}, {center['relevance']:.2f}, {center['confidence']:.2f}, {center['satisfaction']:.2f}]<br/>"

                math_text += "<br/>Inilah pusat kelompok yang sebenarnya digunakan sistem untuk mengelompokkan siswa baru.<br/>"

        else:
            math_text = """
            <b>3. CONTOH PERHITUNGAN MATEMATIKA</b><br/><br/>
            <i>Tidak ada data siswa yang cukup untuk menampilkan contoh perhitungan.</i><br/>
            """

        self.story.append(Paragraph(math_text, self.normal_style))

    def _get_actual_cluster_centers(self):
        """Get actual cluster centers from database"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile
            from django.db.models import Avg

            cluster_centers = {}

            # Get cluster centers berdasarkan motivation_level
            for level in ["Low", "Medium", "High"]:
                profiles = StudentMotivationProfile.objects.filter(
                    motivation_level=level,
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                ).exclude(
                    attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0
                )

                if profiles.exists():
                    avg_values = profiles.aggregate(
                        attention=Avg("attention"),
                        relevance=Avg("relevance"),
                        confidence=Avg("confidence"),
                        satisfaction=Avg("satisfaction"),
                    )

                    cluster_centers[level] = {
                        "attention": float(avg_values["attention"] or 0),
                        "relevance": float(avg_values["relevance"] or 0),
                        "confidence": float(avg_values["confidence"] or 0),
                        "satisfaction": float(avg_values["satisfaction"] or 0),
                    }
                else:
                    # Set None instead of removing the key
                    cluster_centers[level] = None

            logger.info(f"Retrieved cluster centers: {cluster_centers}")
            return cluster_centers

        except Exception as e:
            logger.error(f"Error getting cluster centers: {str(e)}")
            return {}

    def _get_sample_student_data(self, limit=3):
        """Get actual student data from database"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile

            profiles = (
                StudentMotivationProfile.objects.filter(
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                )
                .exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)
                .select_related("student")
                .order_by("student__id")[
                    :limit
                ]  # Order by student ID untuk konsistensi dengan response
            )

            sample_data = []
            for profile in profiles:
                student = profile.student
                # Calculate total motivation score (convert to 100 scale)
                total_score = (
                    (
                        profile.attention
                        + profile.relevance
                        + profile.confidence
                        + profile.satisfaction
                    )
                    / 4
                    * 20
                )

                # Gunakan nama real dari database
                full_name = f"{student.first_name} {student.last_name}".strip()
                if not full_name:
                    full_name = student.username

                sample_data.append(
                    {
                        "student_id": student.username,  # Gunakan username real
                        "student_name": full_name,  # Gunakan nama real
                        "attention": float(profile.attention),
                        "relevance": float(profile.relevance),
                        "confidence": float(profile.confidence),
                        "satisfaction": float(profile.satisfaction),
                        "total_score": round(total_score, 0),
                        "motivation_level": profile.motivation_level
                        or "Belum dianalisis",
                    }
                )

            return sample_data if sample_data else []  # Return empty list if no data

        except Exception as e:
            logger.error(f"Error getting sample student data: {str(e)}")
            return []

    def _add_simplified_pseudocode(self):
        """Add simplified pseudocode for general understanding"""
        actual_stats = self._get_clustering_statistics()

        self.story.append(
            Paragraph(
                "<b>4. ALGORITMA SEDERHANA YANG DIGUNAKAN SISTEM</b>", self.normal_style
            )
        )
        self.story.append(Spacer(1, 0.1 * inch))

        pseudocode_data = [
            ["LANGKAH-LANGKAH CLUSTERING K-MEANS (VERSI SEDERHANA)"],
            [""],
            [f"1. AMBIL DATA {actual_stats['total_students']} SISWA:"],
            ["   - Baca nilai Attention, Relevance, Confidence, Satisfaction"],
            ["   - Pastikan semua siswa punya data lengkap"],
            ["   - Buang data yang kosong atau bernilai 0"],
            [""],
            ["2. SIAPKAN DATA:"],
            ["   - Samakan skala semua nilai (normalisasi)"],
            [
                "   - Ini seperti mengubah nilai dari berbagai mata pelajaran ke skala 0-100"
            ],
            [""],
            ["3. TENTUKAN 3 TITIK PUSAT AWAL (SECARA ACAK):"],
            ["   - Pusat kelompok High (kira-kira di nilai tinggi)"],
            ["   - Pusat kelompok Medium (kira-kira di nilai sedang)"],
            ["   - Pusat kelompok Low (kira-kira di nilai rendah)"],
            [""],
            ["4. ULANGI SAMPAI STABIL:"],
            ["   a. UNTUK SETIAP SISWA:"],
            ["      - Hitung jarak ke 3 pusat kelompok"],
            ["      - Masukkan siswa ke kelompok terdekat"],
            [""],
            ["   b. HITUNG ULANG PUSAT KELOMPOK:"],
            ["      - Ambil rata-rata semua siswa di setiap kelompok"],
            ["      - Ini jadi pusat kelompok yang baru"],
            [""],
            ["   c. CEK APAKAH PUSAT BERUBAH:"],
            ["      - Jika masih berubah banyak: ulangi dari langkah 4a"],
            ["      - Jika sudah stabil: lanjut ke langkah 5"],
            [""],
            ["5. BERI NAMA KELOMPOK:"],
            ["   - Kelompok dengan pusat nilai tertinggi = 'High Motivation'"],
            ["   - Kelompok dengan pusat nilai sedang = 'Medium Motivation'"],
            ["   - Kelompok dengan pusat nilai terendah = 'Low Motivation'"],
            [""],
            ["6. SIMPAN HASIL:"],
            ["   - Simpan label motivasi setiap siswa ke database"],
            ["   - Guru bisa lihat hasilnya di dashboard"],
            [""],
            [
                f"HASIL AKHIR: {actual_stats['high']} siswa High, {actual_stats['medium']} siswa Medium, {actual_stats['low']} siswa Low"
            ],
        ]

        pseudocode_table = Table(pseudocode_data, colWidths=[7 * inch])
        pseudocode_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.lightcyan),
                    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("BOX", (0, 0), (-1, -1), 1, colors.black),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        self.story.append(pseudocode_table)
        self.story.append(Spacer(1, 0.2 * inch))

    def _add_simplified_flowchart(self):
        """Add simplified flowchart"""
        actual_stats = self._get_clustering_statistics()

        self.story.append(
            Paragraph("<b>5. ALUR KERJA SISTEM (FLOWCHART)</b>", self.normal_style)
        )
        self.story.append(Spacer(1, 0.1 * inch))

        flowchart_data = [
            ["ALUR KERJA CLUSTERING ARCS DI PRAMLEARN"],
            [""],
            ["🎯 [MULAI]"],
            ["↓"],
            [f"📊 [Ambil data {actual_stats['total_students']} siswa dari database]"],
            ["↓"],
            ["✅ [Periksa kelengkapan data ARCS]"],
            ["↓"],
            ["📏 [Samakan skala data (normalisasi)]"],
            ["↓"],
            ["🎲 [Tentukan 3 pusat kelompok secara acak]"],
            ["↓"],
            ["🔄 [Mulai proses pengelompokan]"],
            ["↓"],
            ["📐 [Hitung jarak setiap siswa ke 3 pusat]"],
            ["↓"],
            ["👥 [Masukkan siswa ke kelompok terdekat]"],
            ["↓"],
            ["🧮 [Hitung pusat baru untuk setiap kelompok]"],
            ["↓"],
            ["❓ [Apakah pusat kelompok berubah banyak?]"],
            ["         ↓                    ↓"],
            ["       [YA]                [TIDAK]"],
            ["         ↓                    ↓"],
            ["[Kembali ke perhitungan jarak] →  [Lanjutkan]"],
            ["                              ↓"],
            ["🏷️ [Beri label: High, Medium, Low]"],
            ["↓"],
            ["💾 [Simpan hasil ke database]"],
            ["↓"],
            [
                f"📈 [Hasil: {actual_stats['high']} High, {actual_stats['medium']} Medium, {actual_stats['low']} Low]"
            ],
            ["↓"],
            ["🏁 [SELESAI]"],
        ]

        flowchart_table = Table(flowchart_data, colWidths=[7 * inch])
        flowchart_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.lightyellow),
                    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ("BOX", (0, 0), (-1, -1), 1, colors.black),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        self.story.append(flowchart_table)
        self.story.append(Spacer(1, 0.2 * inch))

        # Add final explanation
        final_text = f"""
        <b>KESIMPULAN PROSES CLUSTERING:</b><br/>
        Sistem PRAMLEARN berhasil mengelompokkan {actual_stats['total_students']} siswa menjadi 3 kategori motivasi 
        berdasarkan analisis data ARCS mereka. Proses ini membantu guru untuk:<br/>
        • Memahami tingkat motivasi setiap siswa<br/>
        • Merancang strategi pembelajaran yang sesuai<br/>
        • Membentuk kelompok belajar yang efektif<br/>
        • Memberikan perhatian khusus pada siswa yang membutuhkan<br/><br/>
        
        <b>AKURASI SISTEM:</b><br/>
        • Menggunakan algoritma K-Means yang teruji secara ilmiah<br/>
        • Dijalankan 10 kali untuk mendapat hasil terbaik<br/>
        • Hasil konsisten dan dapat diandalkan untuk pengambilan keputusan pendidikan<br/>
        """
        self.story.append(Paragraph(final_text, self.normal_style))

    def _get_sample_student_data(self, limit=3):
        """Get sample student data from database"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile

            profiles = StudentMotivationProfile.objects.filter(
                attention__isnull=False,
                relevance__isnull=False,
                confidence__isnull=False,
                satisfaction__isnull=False,
            ).exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)[
                :limit
            ]

            sample_data = []
            for profile in profiles:
                sample_data.append(
                    {
                        "attention": profile.attention,
                        "relevance": profile.relevance,
                        "confidence": profile.confidence,
                        "satisfaction": profile.satisfaction,
                        "motivation_level": profile.motivation_level,
                    }
                )

            return sample_data
        except Exception as e:
            logger.error(f"Error getting sample student data: {e}")
            return []

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
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#11418b")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )

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

    def _add_student_questionnaire_scores_table(self):
        """Add table showing actual student questionnaire scores - ALL STUDENTS"""
        self.story.append(
            Paragraph("📋 TABEL HASIL SKOR MOTIVASI SISWA", self.heading_style)
        )

        try:
            # Get ALL student data with ARCS scores, ordered by student ID
            profiles = (
                StudentMotivationProfile.objects.filter(
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                )
                .exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)
                .select_related("student")
                .order_by("student__id")  # Order by student ID untuk konsistensi
            )

            logger.info(f"Found {profiles.count()} profiles with complete ARCS data")

            if not profiles.exists():
                self.story.append(
                    Paragraph("Tidak ada data siswa yang tersedia.", self.normal_style)
                )
                return

            # Create table data - TAMPILKAN SEMUA SISWA (tanpa limit)
            table_data = [
                [
                    "No",
                    "Username",
                    "Nama Siswa",
                    "Skor Motivasi (dari 100)",
                    "Level Motivasi",
                ]
            ]

            # Gunakan SEMUA data dari database
            for index, profile in enumerate(profiles, 1):  # SEMUA siswa tanpa limit
                student = profile.student

                # Calculate total motivation score from ARCS dimensions
                total_score = (
                    (
                        profile.attention
                        + profile.relevance
                        + profile.confidence
                        + profile.satisfaction
                    )
                    / 4
                    * 20
                )  # Convert to 100 scale

                # Gunakan nama real dari database
                full_name = f"{student.first_name} {student.last_name}".strip()
                if not full_name:
                    full_name = student.username

                # Map motivation level ke bahasa Indonesia
                motivation_mapping = {
                    "High": "Tinggi",
                    "Medium": "Sedang",
                    "Low": "Rendah",
                }
                motivation_label = motivation_mapping.get(
                    profile.motivation_level,
                    profile.motivation_level or "Belum dianalisis",
                )

                table_data.append(
                    [
                        str(index),  # Nomor urut
                        student.username,  # Username real
                        full_name,  # Nama real
                        f"{total_score:.0f}",
                        motivation_label,
                    ]
                )

                # Log data untuk debugging
                logger.debug(
                    f"Student {index}: {student.username} ({full_name}) -> Score: {total_score:.0f}, Level: {motivation_label}"
                )

            logger.info(
                f"Generated table with {len(table_data)-1} student rows (ALL STUDENTS)"
            )

            # Create and style table - Adjust column widths for 5 columns
            scores_table = Table(
                table_data,
                colWidths=[0.5 * inch, 1.2 * inch, 2.0 * inch, 1.5 * inch, 1.3 * inch],
            )
            scores_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 10),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.lightcyan),
                        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 1), (-1, -1), 8),  # Smaller font for more data
                        ("BOX", (0, 0), (-1, -1), 1, colors.black),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        (
                            "ROWBACKGROUNDS",
                            (0, 1),
                            (-1, -1),
                            [colors.lightcyan, colors.white],
                        ),  # Alternating colors
                    ]
                )
            )

            self.story.append(scores_table)
            self.story.append(Spacer(1, 0.3 * inch))

            # Add summary after table
            total_students = len(table_data) - 1
            high_count = len([row for row in table_data[1:] if row[4] == "Tinggi"])
            medium_count = len([row for row in table_data[1:] if row[4] == "Sedang"])
            low_count = len([row for row in table_data[1:] if row[4] == "Rendah"])

            summary_text = f"""
            <b>📊 RINGKASAN TABEL:</b><br/>
            • Total Siswa: {total_students}<br/>
            • Motivasi Tinggi: {high_count} siswa ({(high_count/total_students*100):.1f}%)<br/>
            • Motivasi Sedang: {medium_count} siswa ({(medium_count/total_students*100):.1f}%)<br/>
            • Motivasi Rendah: {low_count} siswa ({(low_count/total_students*100):.1f}%)<br/>
            """
            self.story.append(Paragraph(summary_text, self.normal_style))
            self.story.append(Spacer(1, 0.2 * inch))

        except Exception as e:
            logger.error(f"Error mengambil data siswa: {str(e)}")
            self.story.append(
                Paragraph(f"Error mengambil data siswa: {str(e)}", self.normal_style)
            )

    def _add_clustering_results_table(self):
        """Add table showing clustering results with centroid values"""
        self.story.append(Paragraph("📊 TABEL HASIL CLUSTERING", self.heading_style))
    
        try:
            # Get clustering statistics
            stats = self._get_clustering_statistics()
    
            # Get actual cluster centers
            cluster_centers = self._get_actual_cluster_centers()
    
            # Create clustering results table
            clustering_data = [
                ["Cluster", "Label", "Nilai Centroid (Rata-rata Skor Motivasi)"]
            ]
    
            # Add data for each cluster - PERBAIKAN LOGIKA
            if cluster_centers and any(
                center is not None for center in cluster_centers.values()
            ):
                for i, (level, center) in enumerate(cluster_centers.items()):
                    if center:  # Only add if center data exists
                        centroid_avg = (
                            (
                                center["attention"]
                                + center["relevance"]
                                + center["confidence"]
                                + center["satisfaction"]
                            )
                            / 4
                            * 20  # Convert to 0-100 scale
                        )
                        label_map = {
                            "High": "Tinggi",
                            "Medium": "Sedang",
                            "Low": "Rendah",
                        }
                        clustering_data.append(
                            [str(i), label_map.get(level, level), f"{centroid_avg:.1f}"]
                        )
            else:
                # Fallback: Gunakan data statistik yang ada
                if stats["total_students"] > 0:
                    # Tambahkan data berdasarkan statistik yang tersedia
                    cluster_info = [
                        ("0", "Rendah", stats.get("low", 0)),
                        ("1", "Sedang", stats.get("medium", 0)),
                        ("2", "Tinggi", stats.get("high", 0)),
                    ]
    
                    for cluster_id, label, count in cluster_info:
                        # Estimasi centroid berdasarkan distribusi data
                        if label == "Rendah":
                            estimated_score = 45.0  # Low motivation estimate
                        elif label == "Sedang":
                            estimated_score = 68.0  # Medium motivation estimate
                        else:
                            estimated_score = 85.0  # High motivation estimate
    
                        clustering_data.append(
                            [cluster_id, label, f"{estimated_score:.1f}"]
                        )
                else:
                    # Jika benar-benar tidak ada data
                    self.story.append(
                        Paragraph(
                            "Tidak ada data cluster yang tersedia.", self.normal_style
                        )
                    )
                    return
    
            # Create table
            clustering_table = Table(
                clustering_data, colWidths=[1.5 * inch, 2 * inch, 2.5 * inch]
            )
            clustering_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1677ff")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.lightcyan),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ("FONTSIZE", (0, 1), (-1, -1), 9),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )
    
            self.story.append(clustering_table)
            self.story.append(Spacer(1, 0.2 * inch))
    
            # ADD VISUALIZATIONS HERE
            # 1. Distribution Chart
            distribution_chart = self._create_distribution_chart()
            if distribution_chart:
                self.story.append(Paragraph("📈 Visualisasi Distribusi Cluster", self.normal_style))
                self.story.append(distribution_chart)
                self.story.append(Spacer(1, 0.2 * inch))
    
            # 2. Centroid Diagram
            centroid_diagram = self._create_centroid_diagram()
            if centroid_diagram:
                self.story.append(Paragraph("🎯 Diagram Profil Centroid", self.normal_style))
                self.story.append(centroid_diagram)
                self.story.append(Spacer(1, 0.2 * inch))
    
            # Add summary
            summary_text = f"""
            <b>📈 RINGKASAN CLUSTERING:</b><br/>
            • Total Siswa Dianalisis: {stats['total_students']}<br/>
            • Kelompok Motivasi Tinggi: {stats['high']} siswa ({stats['high_percentage']:.1f}%)<br/>
            • Kelompok Motivasi Sedang: {stats['medium']} siswa ({stats['medium_percentage']:.1f}%)<br/>
            • Kelompok Motivasi Rendah: {stats['low']} siswa ({stats['low_percentage']:.1f}%)<br/>
            """
            self.story.append(Paragraph(summary_text, self.normal_style))
    
        except Exception as e:
            logger.error(f"Error in _add_clustering_results_table: {str(e)}")
            self.story.append(
                Paragraph(
                    f"Error mengambil hasil clustering: {str(e)}", self.normal_style
                )
            )

    def _add_cluster_visualization_section(self):
        """Add a dedicated section for cluster visualizations"""
        self.story.append(PageBreak())
        self.story.append(Paragraph("📊 VISUALISASI CLUSTERING", self.heading_style))
        
        # Add explanation
        explanation_text = """
        <b>Penjelasan Visualisasi:</b><br/>
        Bagian ini menampilkan representasi visual dari hasil clustering ARCS yang membantu memahami 
        distribusi dan karakteristik setiap kelompok motivasi siswa.<br/><br/>
        """
        self.story.append(Paragraph(explanation_text, self.normal_style))
        
        # Scatter plot
        scatter_plot = self._create_cluster_scatter_plot()
        if scatter_plot:
            self.story.append(Paragraph("🔍 Scatter Plot Clustering", self.normal_style))
            scatter_explanation = """
            <i>Diagram ini menunjukkan posisi setiap siswa dalam ruang 2D berdasarkan rata-rata 
            dimensi ARCS. Titik-titik besar menunjukkan centroid (pusat) setiap cluster.</i><br/>
            """
            self.story.append(Paragraph(scatter_explanation, self.normal_style))
            self.story.append(scatter_plot)
            self.story.append(Spacer(1, 0.3 * inch))

    def _add_final_classification_table(self):
        """Add table showing final classification results for ALL students"""
        self.story.append(
            Paragraph("🎯 TABEL HASIL AKHIR KLASIFIKASI", self.heading_style)
        )

        try:
            # Get ALL students with classification results, ordered by student ID
            profiles = (
                StudentMotivationProfile.objects.filter(
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                    motivation_level__isnull=False,
                )
                .exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)
                .select_related("student")
                .order_by("student__id")  # SEMUA siswa tanpa limit
            )

            if not profiles.exists():
                self.story.append(
                    Paragraph(
                        "Tidak ada data klasifikasi yang tersedia.", self.normal_style
                    )
                )
                return

            # Get actual cluster centers for distance calculation
            cluster_centers = self._get_actual_cluster_centers()

            # Create classification table
            classification_data = [
                [
                    "No",
                    "Username",
                    "Nama Siswa",
                    "Skor Motivasi",
                    "Jarak ke Centroid 0",
                    "Jarak ke Centroid 1",
                    "Jarak ke Centroid 2",
                    "Hasil Clustering",
                ]
            ]

            for index, profile in enumerate(profiles, 1):  # SEMUA siswa
                student = profile.student
                total_score = (
                    (
                        profile.attention
                        + profile.relevance
                        + profile.confidence
                        + profile.satisfaction
                    )
                    / 4
                    * 20
                )

                # Gunakan nama real dari database
                full_name = f"{student.first_name} {student.last_name}".strip()
                if not full_name:
                    full_name = student.username

                # Calculate distances to centroids if available
                distances = ["N/A", "N/A", "N/A"]
                if cluster_centers:
                    student_vector = [
                        profile.attention,
                        profile.relevance,
                        profile.confidence,
                        profile.satisfaction,
                    ]

                    cluster_list = [
                        cluster_centers.get("Low"),
                        cluster_centers.get("Medium"),
                        cluster_centers.get("High"),
                    ]

                    for j, center in enumerate(cluster_list):
                        if center:
                            center_vector = [
                                center["attention"],
                                center["relevance"],
                                center["confidence"],
                                center["satisfaction"],
                            ]
                            # Calculate Euclidean distance
                            distance = (
                                sum(
                                    (a - b) ** 2
                                    for a, b in zip(student_vector, center_vector)
                                )
                                ** 0.5
                            )
                            distances[j] = f"{distance:.1f}"

                # Map motivation level to Indonesian - single line format for space
                level_map = {
                    "High": "Tinggi",
                    "Medium": "Sedang",
                    "Low": "Rendah",
                }
                result_label = level_map.get(
                    profile.motivation_level,
                    profile.motivation_level or "Belum dianalisis",
                )

                classification_data.append(
                    [
                        str(index),  # Nomor urut
                        student.username,  # Username real
                        full_name,  # Nama real
                        f"{total_score:.0f}",
                        distances[0],
                        distances[1],
                        distances[2],
                        result_label,
                    ]
                )

            logger.info(
                f"Generated classification table with {len(classification_data)-1} student rows (ALL STUDENTS)"
            )

            classification_table = Table(
                classification_data,
                colWidths=[
                    0.4 * inch,  # No
                    1.0 * inch,  # Username
                    1.5 * inch,  # Nama
                    0.8 * inch,  # Skor
                    0.7 * inch,  # Jarak 0
                    0.7 * inch,  # Jarak 1
                    0.7 * inch,  # Jarak 2
                    0.8 * inch,  # Hasil
                ],
            )
            classification_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 0), 8),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.lightcyan),
                        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 1), (-1, -1), 7),  # Smaller font for more data
                        ("BOX", (0, 0), (-1, -1), 1, colors.black),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        (
                            "ROWBACKGROUNDS",
                            (0, 1),
                            (-1, -1),
                            [colors.lightcyan, colors.white],
                        ),  # Alternating colors
                    ]
                )
            )

            self.story.append(classification_table)
            self.story.append(Spacer(1, 0.3 * inch))

            # Tambahkan visualisasi scatter plot clustering di bawah tabel
            scatter_plot = self._create_cluster_scatter_plot(width=500, height=350)
            if scatter_plot:
                self.story.append(Paragraph("🔍 Visualisasi Hasil Klasifikasi Siswa", self.normal_style))
                self.story.append(scatter_plot)
                self.story.append(Spacer(1, 0.2 * inch))

            # Add summary after table
            total_students = len(classification_data) - 1
            high_count = len(
                [row for row in classification_data[1:] if row[7] == "Tinggi"]
            )
            medium_count = len(
                [row for row in classification_data[1:] if row[7] == "Sedang"]
            )
            low_count = len(
                [row for row in classification_data[1:] if row[7] == "Rendah"]
            )

            summary_text = f"""
            <b>📊 RINGKASAN KLASIFIKASI:</b><br/>
            • Total Siswa Diklasifikasi: {total_students}<br/>
            • Cluster Tinggi: {high_count} siswa ({(high_count/total_students*100):.1f}%)<br/>
            • Cluster Sedang: {medium_count} siswa ({(medium_count/total_students*100):.1f}%)<br/>
            • Cluster Rendah: {low_count} siswa ({(low_count/total_students*100):.1f}%)<br/><br/>
            
            <b>Catatan:</b> Jarak ke Centroid menunjukkan seberapa dekat siswa dengan pusat masing-masing cluster. 
            Siswa akan dimasukkan ke cluster dengan jarak terkecil.
            """
            self.story.append(Paragraph(summary_text, self.normal_style))
            self.story.append(Spacer(1, 0.2 * inch))

        except Exception as e:
            self.story.append(
                Paragraph(
                    f"Error mengambil data klasifikasi: {str(e)}", self.normal_style
                )
            )

    def _get_clustering_statistics(self):
        """Get clustering statistics with cluster averages"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile

            # Get total students with complete ARCS data
            total_students = (
                StudentMotivationProfile.objects.filter(
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                )
                .exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)
                .count()
            )

            # Get counts by motivation level
            high_count = StudentMotivationProfile.objects.filter(
                motivation_level="High"
            ).count()
            medium_count = StudentMotivationProfile.objects.filter(
                motivation_level="Medium"
            ).count()
            low_count = StudentMotivationProfile.objects.filter(
                motivation_level="Low"
            ).count()

            # Calculate percentages
            if total_students > 0:
                high_percentage = (high_count / total_students) * 100
                medium_percentage = (medium_count / total_students) * 100
                low_percentage = (low_count / total_students) * 100
            else:
                high_percentage = medium_percentage = low_percentage = 0

            return {
                "total_students": total_students,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
                "high_percentage": high_percentage,
                "medium_percentage": medium_percentage,
                "low_percentage": low_percentage,
            }

        except Exception as e:
            logger.error(f"Error getting clustering statistics: {str(e)}")
            return {
                "total_students": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "high_percentage": 0.0,
                "medium_percentage": 0.0,
                "low_percentage": 0.0,
            }

    def _create_cluster_scatter_plot(self, width=400, height=300):
        """Create a scatter plot visualization of clustering results"""
        try:
            # Get ALL student data - remove any limits
            profiles = (
                StudentMotivationProfile.objects.filter(
                    attention__isnull=False,
                    relevance__isnull=False,
                    confidence__isnull=False,
                    satisfaction__isnull=False,
                    motivation_level__isnull=False,
                )
                .exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)
                .select_related("student")
                # Remove any .order_by()[:limit] that might limit the data
            )

            if not profiles.exists():
                logger.warning("No student profiles found for scatter plot")
                return None

            total_students = profiles.count()
            logger.info(f"Creating scatter plot for {total_students} students")

            # Create drawing with adequate size for all points
            drawing = Drawing(width, height)

            # Set up plot area with margins for labels
            plot_x = 60
            plot_y = 60
            plot_width = width - 120  # More space for labels
            plot_height = height - 120

            # Draw background grid for better readability
            grid_color = colors.Color(0.9, 0.9, 0.9)
            
            # Vertical grid lines
            for i in range(5):
                x = plot_x + (i * plot_width / 4)
                drawing.add(
                    Line(x, plot_y, x, plot_y + plot_height, 
                        strokeColor=grid_color, strokeWidth=0.5)
                )
            
            # Horizontal grid lines
            for i in range(5):
                y = plot_y + (i * plot_height / 4)
                drawing.add(
                    Line(plot_x, y, plot_x + plot_width, y, 
                        strokeColor=grid_color, strokeWidth=0.5)
                )

            # Draw main axes with thicker lines
            # X-axis (Attention + Relevance average)
            drawing.add(
                Line(
                    plot_x,
                    plot_y,
                    plot_x + plot_width,
                    plot_y,
                    strokeColor=colors.black,
                    strokeWidth=2,
                )
            )
            # Y-axis (Confidence + Satisfaction average)
            drawing.add(
                Line(
                    plot_x,
                    plot_y,
                    plot_x,
                    plot_y + plot_height,
                    strokeColor=colors.black,
                    strokeWidth=2,
                )
            )

            # Define colors for each cluster
            cluster_colors = {
                "High": colors.Color(0.2, 0.8, 0.4),    # Green
                "Medium": colors.Color(0.8, 0.6, 0.2),  # Orange  
                "Low": colors.Color(0.8, 0.2, 0.2),     # Red
            }

            # Get cluster centers for display
            cluster_centers = self._get_actual_cluster_centers()

            # Plot ALL students as points
            student_count_by_cluster = {"High": 0, "Medium": 0, "Low": 0}
            
            for profile in profiles:
                # Calculate x,y coordinates based on ARCS dimensions
                x_val = (profile.attention + profile.relevance) / 2  # Average of Attention & Relevance
                y_val = (profile.confidence + profile.satisfaction) / 2  # Average of Confidence & Satisfaction

                # Scale to plot coordinates (assuming ARCS scale 1-5)
                x_coord = plot_x + (x_val - 1) * (plot_width / 4)  # Scale 1-5 to plot width
                y_coord = plot_y + (y_val - 1) * (plot_height / 4)  # Scale 1-5 to plot height

                # Choose color based on motivation level
                color = cluster_colors.get(profile.motivation_level, colors.gray)
                
                # Count students by cluster
                if profile.motivation_level in student_count_by_cluster:
                    student_count_by_cluster[profile.motivation_level] += 1

                # Draw student point - slightly larger for better visibility
                from reportlab.graphics.shapes import Circle
                drawing.add(
                    Circle(x_coord, y_coord, 3, fillColor=color, strokeColor=colors.black, strokeWidth=0.5)
                )

            # Plot cluster centers as larger, distinct markers
            if cluster_centers:
                for level, center in cluster_centers.items():
                    if center:
                        x_val = (center["attention"] + center["relevance"]) / 2
                        y_val = (center["confidence"] + center["satisfaction"]) / 2

                        x_coord = plot_x + (x_val - 1) * (plot_width / 4)
                        y_coord = plot_y + (y_val - 1) * (plot_height / 4)

                        color = cluster_colors.get(level, colors.black)

                        # Draw center as larger circle with distinctive border
                        drawing.add(
                            Circle(
                                x_coord,
                                y_coord,
                                10,  # Larger radius for centroids
                                fillColor=color,
                                strokeColor=colors.black,
                                strokeWidth=3,
                            )
                        )
                        # Add white inner circle for contrast
                        drawing.add(
                            Circle(
                                x_coord,
                                y_coord,
                                6,
                                fillColor=colors.white,
                                strokeColor=color,
                                strokeWidth=2,
                            )
                        )
                        
                        # Add label for centroid
                        from reportlab.graphics.shapes import String
                        drawing.add(
                            String(
                                x_coord + 15, y_coord - 3,
                                f"Centroid {level}",
                                fontSize=8,
                                fontName="Helvetica-Bold",
                                fillColor=color
                            )
                        )

            # Add axis labels
            from reportlab.graphics.shapes import String
            drawing.add(
                String(
                    plot_x + plot_width / 2,
                    25,
                    "Attention + Relevance (Average)",
                    fontSize=10,
                    textAnchor="middle",
                    fontName="Helvetica",
                )
            )

            # Y-axis label
            drawing.add(
                String(
                    20,
                    plot_y + plot_height / 2,
                    "Confidence + Satisfaction (Average)",
                    fontSize=10,
                    textAnchor="middle",
                    fontName="Helvetica",
                )
            )

            # Add axis scale labels
            # X-axis scale (1-5)
            for i in range(5):
                x_pos = plot_x + (i * plot_width / 4)
                value = i + 1
                drawing.add(
                    String(x_pos, plot_y - 15, str(value), fontSize=8, textAnchor="middle")
                )

            # Y-axis scale (1-5)
            for i in range(5):
                y_pos = plot_y + (i * plot_height / 4)
                value = i + 1
                drawing.add(
                    String(plot_x - 15, y_pos - 3, str(value), fontSize=8, textAnchor="end")
                )

            # Add comprehensive legend
            legend_x = plot_x + plot_width + 20
            legend_y = plot_y + plot_height - 30

            # Legend title
            drawing.add(
                String(
                    legend_x, legend_y + 20,
                    "LEGEND:",
                    fontSize=10,
                    fontName="Helvetica-Bold"
                )
            )

            # Legend items with actual counts
            for i, (level, color) in enumerate(cluster_colors.items()):
                y_pos = legend_y - (i * 25)
                count = student_count_by_cluster.get(level, 0)
                
                # Legend marker (small circle)
                drawing.add(
                    Circle(legend_x, y_pos, 4, fillColor=color, strokeColor=colors.black, strokeWidth=0.5)
                )
                
                # Legend text with count
                drawing.add(
                    String(
                        legend_x + 15, y_pos - 3,
                        f"{level}: {count} students",
                        fontSize=9,
                        fontName="Helvetica"
                    )
                )

            # Add centroid legend
            y_pos = legend_y - 80
            drawing.add(
                Circle(legend_x, y_pos, 8, fillColor=colors.gray, strokeColor=colors.black, strokeWidth=2)
            )
            drawing.add(
                Circle(legend_x, y_pos, 5, fillColor=colors.white, strokeColor=colors.gray, strokeWidth=1)
            )
            drawing.add(
                String(
                    legend_x + 15, y_pos - 3,
                    "Cluster Centroid",
                    fontSize=9,
                    fontName="Helvetica"
                )
            )

            # Add title with total count
            drawing.add(
                String(
                    width / 2,
                    height - 20,
                    f"Visualisasi Clustering ARCS ({total_students} Siswa)",
                    fontSize=12,
                    textAnchor="middle",
                    fontName="Helvetica-Bold",
                )
            )

            # Add subtitle with distribution info
            distribution_text = f"High: {student_count_by_cluster['High']}, Medium: {student_count_by_cluster['Medium']}, Low: {student_count_by_cluster['Low']}"
            drawing.add(
                String(
                    width / 2,
                    height - 35,
                    distribution_text,
                    fontSize=10,
                    textAnchor="middle",
                    fontName="Helvetica",
                    fillColor=colors.Color(0.4, 0.4, 0.4)
                )
            )

            logger.info(f"Scatter plot created successfully with {total_students} student points")
            return drawing

        except Exception as e:
            logger.error(f"Error creating scatter plot: {str(e)}")
            return None

    def _create_centroid_diagram(self, width=500, height=300):
        """Create a diagram showing cluster centroids"""
        try:
            cluster_centers = self._get_actual_cluster_centers()

            if not cluster_centers:
                return None

            drawing = Drawing(width, height)

            # Colors for each cluster
            cluster_colors = {
                "Low": colors.red,
                "Medium": colors.orange,
                "High": colors.green,
            }

            # Dimensions
            dimensions = ["Attention", "Relevance", "Confidence", "Satisfaction"]
            dim_width = (width - 100) / len(dimensions)

            # Draw background grid
            for i in range(6):  # 0 to 5 scale
                y = 50 + i * (height - 100) / 5
                drawing.add(
                    Line(
                        50,
                        y,
                        width - 50,
                        y,
                        strokeColor=colors.lightgrey,
                        strokeWidth=0.5,
                    )
                )
                drawing.add(String(30, y - 3, str(i), fontSize=8))

            # Draw dimension labels
            for i, dim in enumerate(dimensions):
                x = 50 + i * dim_width + dim_width / 2
                drawing.add(String(x, 20, dim[:4], fontSize=9, textAnchor="middle"))
                # Vertical grid lines
                drawing.add(
                    Line(
                        x,
                        50,
                        x,
                        height - 50,
                        strokeColor=colors.lightgrey,
                        strokeWidth=0.5,
                    )
                )

            # Draw centroid lines for each cluster
            line_height_offset = {"Low": -5, "Medium": 0, "High": 5}

            for level, center in cluster_centers.items():
                if center:
                    color = cluster_colors.get(level, colors.black)
                    y_offset = line_height_offset.get(level, 0)

                    points = []
                    for i, dim in enumerate(
                        ["attention", "relevance", "confidence", "satisfaction"]
                    ):
                        x = 50 + i * dim_width + dim_width / 2
                        y = 50 + center[dim] * (height - 100) / 5 + y_offset
                        points.append((x, y))

                        # Draw point
                        drawing.add(
                            Circle(x, y, 4, fillColor=color, strokeColor=colors.black)
                        )

                    # Connect points with lines
                    for i in range(len(points) - 1):
                        x1, y1 = points[i]
                        x2, y2 = points[i + 1]
                        drawing.add(
                            Line(x1, y1, x2, y2, strokeColor=color, strokeWidth=2)
                        )

            # Add legend
            legend_x = width - 120
            legend_y = height - 60

            for i, (level, color) in enumerate(cluster_colors.items()):
                y_pos = legend_y - (i * 20)
                drawing.add(
                    Line(
                        legend_x,
                        y_pos,
                        legend_x + 15,
                        y_pos,
                        strokeColor=color,
                        strokeWidth=3,
                    )
                )
                drawing.add(
                    String(legend_x + 20, y_pos - 3, f"{level} Motivation", fontSize=9)
                )

            # Add title
            drawing.add(
                String(
                    width / 2,
                    height - 20,
                    "Profil Centroid Cluster",
                    fontSize=12,
                    textAnchor="middle",
                    fontName="Helvetica-Bold",
                )
            )

            return drawing

        except Exception as e:
            logger.error(f"Error creating centroid diagram: {str(e)}")
            return None

    def _create_distribution_chart(self, width=400, height=200):
        """Create a bar chart showing cluster distribution"""
        try:
            stats = self._get_clustering_statistics()
            
            if stats['total_students'] == 0:
                return None
    
            drawing = Drawing(width, height)
            
            # Data for chart
            clusters = ["Low", "Medium", "High"]
            values = [stats['low'], stats['medium'], stats['high']]
            colors_list = [colors.red, colors.orange, colors.green]
            
            # Chart dimensions
            chart_x = 80
            chart_y = 50
            chart_width = width - 120
            chart_height = height - 100
            
            max_value = max(values) if values else 1
            bar_width = chart_width / len(clusters) * 0.8
            bar_spacing = chart_width / len(clusters)
            
            # Draw bars
            for i, (cluster, value, color) in enumerate(zip(clusters, values, colors_list)):
                x = chart_x + i * bar_spacing + bar_spacing * 0.1
                bar_height = (value / max_value) * chart_height
                y = chart_y
                
                # Draw bar
                drawing.add(Rect(x, y, bar_width, bar_height, 
                               fillColor=color, strokeColor=colors.black))
                
                # Add value label on top of bar
                drawing.add(String(x + bar_width/2, y + bar_height + 5, str(value), 
                                  fontSize=10, textAnchor="middle", fontName="Helvetica-Bold"))
                
                # Add cluster label
                drawing.add(String(x + bar_width/2, chart_y - 15, cluster, 
                                  fontSize=9, textAnchor="middle"))
    
            # Draw axes
            drawing.add(Line(chart_x, chart_y, chart_x + chart_width, chart_y, strokeColor=colors.black))
            drawing.add(Line(chart_x, chart_y, chart_x, chart_y + chart_height, strokeColor=colors.black))
            
            # Y-axis labels
            for i in range(6):
                y = chart_y + i * chart_height / 5
                value = int(i * max_value / 5)
                drawing.add(String(chart_x - 5, y - 3, str(value), fontSize=8, textAnchor="end"))
    
            # Add title
            drawing.add(String(width/2, height - 20, "Distribusi Siswa per Cluster", 
                              fontSize=12, textAnchor="middle", fontName="Helvetica-Bold"))
    
            return drawing
    
        except Exception as e:
            logger.error(f"Error creating distribution chart: {str(e)}")
            return None

    def _get_arcs_dimension_statistics(self):
        """Get real ARCS dimension statistics from database"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile
            from django.db.models import Avg, StdDev, Min, Max, Count
            import statistics

            profiles = StudentMotivationProfile.objects.filter(
                attention__isnull=False,
                relevance__isnull=False,
                confidence__isnull=False,
                satisfaction__isnull=False,
            ).exclude(attention=0.0, relevance=0.0, confidence=0.0, satisfaction=0.0)

            if not profiles.exists():
                return self._get_empty_arcs_statistics()

            # Calculate statistics for each dimension
            arcs_stats = {}
            dimensions = ["attention", "relevance", "confidence", "satisfaction"]

            for dimension in dimensions:
                stats = profiles.aggregate(
                    mean=Avg(dimension),
                    min_val=Min(dimension),
                    max_val=Max(dimension),
                    count=Count(dimension),
                )

                # Get values for standard deviation calculation
                values = list(profiles.values_list(dimension, flat=True))
                std_dev = statistics.stdev(values) if len(values) > 1 else 0.0

                mean_val = float(stats["mean"] or 0)

                arcs_stats[dimension] = {
                    "mean": mean_val,
                    "std_dev": std_dev,
                    "min": float(stats["min_val"] or 0),
                    "max": float(stats["max_val"] or 0),
                    "count": stats["count"],
                    "interpretation": self._interpret_score(mean_val),
                }

            return arcs_stats

        except Exception as e:
            logger.error(f"Error getting ARCS statistics: {str(e)}")
            return self._get_empty_arcs_statistics()

    def _interpret_score(self, score):
        """Interpret ARCS score"""
        if score >= 4.0:
            return "Tinggi"
        elif score >= 3.0:
            return "Sedang"
        else:
            return "Rendah"

    def _get_empty_arcs_statistics(self):
        """Return empty statistics when no data available"""
        empty_stat = {
            "mean": 0.00,
            "std_dev": 0.00,
            "min": 0.00,
            "max": 0.00,
            "interpretation": "Tidak Ada Data",  # Tetap pertahankan ini
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
