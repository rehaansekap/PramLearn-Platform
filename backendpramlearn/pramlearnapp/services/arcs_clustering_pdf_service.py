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

            # 7. NEW: Mathematical Process Analysis
            self._add_mathematical_process_analysis()

            # # 8. Recommendations
            # self._add_recommendations()

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
        
        <b>Contoh Data 3 Siswa Pertama:</b><br/>
        Mari kita lihat bagaimana data siswa diproses dengan contoh nyata dari database:<br/>
        """
        self.story.append(Paragraph(representation_text, self.normal_style))

        # Get actual sample data from database
        sample_profiles = self._get_sample_student_data(3)

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
            # Fallback example if no data
            sample_data = [
                [
                    "Siswa",
                    "Attention",
                    "Relevance",
                    "Confidence",
                    "Satisfaction",
                    "Hasil Clustering",
                ],
                ["Siswa 1", "4.2", "3.8", "3.5", "4.0", "High"],
                ["Siswa 2", "3.0", "3.2", "2.8", "3.1", "Medium"],
                ["Siswa 3", "2.1", "2.3", "2.0", "2.2", "Low"],
            ]

        sample_table = Table(
            sample_data,
            colWidths=[
                1 * inch,
                0.8 * inch,
                0.8 * inch,
                0.8 * inch,
                0.8 * inch,
                1.2 * inch,
            ],
        )
        sample_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.lightcyan),
                    ("FONTNAME", (0, 1), (-1, -1), "Courier"),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
                    ("BOX", (0, 0), (-1, -1), 1, colors.black),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        self.story.append(sample_table)

        explanation_text = f"""
        <b>Penjelasan Sederhana:</b><br/>
        • Setiap siswa punya 4 angka yang menunjukkan tingkat motivasi mereka<br/>
        • Angka berkisar dari 1 (sangat rendah) sampai 5 (sangat tinggi)<br/>
        • Komputer akan mengelompokkan siswa berdasarkan pola angka-angka ini<br/>
        • Siswa dengan angka tinggi masuk kelompok "High Motivation"<br/>
        • Siswa dengan angka rendah masuk kelompok "Low Motivation"<br/>
        • Siswa dengan angka sedang masuk kelompok "Medium Motivation"<br/><br/>
        
        <b>Statistik Data Aktual:</b><br/>
        • Rata-rata Attention: {arcs_stats['attention']['mean']:.2f} (interpretasi: {arcs_stats['attention']['interpretation']})<br/>
        • Rata-rata Relevance: {arcs_stats['relevance']['mean']:.2f} (interpretasi: {arcs_stats['relevance']['interpretation']})<br/>
        • Rata-rata Confidence: {arcs_stats['confidence']['mean']:.2f} (interpretasi: {arcs_stats['confidence']['interpretation']})<br/>
        • Rata-rata Satisfaction: {arcs_stats['satisfaction']['mean']:.2f} (interpretasi: {arcs_stats['satisfaction']['interpretation']})<br/>
        """
        self.story.append(Paragraph(explanation_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

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
            # Fallback to example data if no actual data available
            math_text = f"""
            <b>3. CONTOH PERHITUNGAN MATEMATIKA SEDERHANA</b><br/><br/>
            
            <b>Cara Komputer Menghitung Jarak Antar Siswa:</b><br/>
            <i>Catatan: Tidak ada data siswa yang cukup di database untuk contoh real. Berikut contoh dengan data hipotetis:</i><br/>
            Bayangkan ada 2 siswa dengan nilai ARCS:<br/>
            • Siswa A: Attention=4.0, Relevance=3.5, Confidence=3.8, Satisfaction=4.2<br/>
            • Siswa B: Attention=2.1, Relevance=2.3, Confidence=2.0, Satisfaction=2.5<br/><br/>
            
            <b>Perhitungan Jarak:</b><br/>
            • Selisih Attention: 4.0 - 2.1 = 1.9<br/>
            • Selisih Relevance: 3.5 - 2.3 = 1.2<br/>
            • Selisih Confidence: 3.8 - 2.0 = 1.8<br/>
            • Selisih Satisfaction: 4.2 - 2.5 = 1.7<br/><br/>
            
            • Kuadratkan selisih: 1.9² + 1.2² + 1.8² + 1.7² = 3.61 + 1.44 + 3.24 + 2.89 = 11.18<br/>
            • Akar kuadrat: √11.18 = 3.34<br/><br/>
            
            <b>Artinya:</b> Siswa A dan B sangat berbeda (jarak = 3.34), jadi masuk kelompok berbeda.<br/><br/>
            """

        self.story.append(Paragraph(math_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

    def _get_actual_cluster_centers(self):
        """Get actual cluster centers from database"""
        try:
            from pramlearnapp.models.user import StudentMotivationProfile
            from django.db.models import Avg

            centers = {}

            for level in ["High", "Medium", "Low"]:
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
                    center = profiles.aggregate(
                        attention=Avg("attention"),
                        relevance=Avg("relevance"),
                        confidence=Avg("confidence"),
                        satisfaction=Avg("satisfaction"),
                    )
                    centers[level] = center
                else:
                    centers[level] = None

            return centers
        except Exception as e:
            logger.error(f"Error getting actual cluster centers: {e}")
            return {}

    def _get_sample_student_data(self, limit=3):
        """Get sample student data from database with more details"""
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
                .order_by("?")[:limit]
            )  # Random order

            sample_data = []
            for profile in profiles:
                sample_data.append(
                    {
                        "attention": float(profile.attention),
                        "relevance": float(profile.relevance),
                        "confidence": float(profile.confidence),
                        "satisfaction": float(profile.satisfaction),
                        "motivation_level": profile.motivation_level
                        or "Belum dianalisis",
                    }
                )

            return sample_data
        except Exception as e:
            logger.error(f"Error getting sample student data: {e}")
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
                "attention": {
                    "mean": round(stats["attention_avg"] or 0, 2),
                    "std_dev": round(stats["attention_std"] or 0, 2),
                    "min": round(stats["attention_min"] or 0, 2),
                    "max": round(stats["attention_max"] or 0, 2),
                    "interpretation": self._get_interpretation(
                        stats["attention_avg"] or 0
                    ),
                },
                "relevance": {
                    "mean": round(stats["relevance_avg"] or 0, 2),
                    "std_dev": round(stats["relevance_std"] or 0, 2),
                    "min": round(stats["relevance_min"] or 0, 2),
                    "max": round(stats["relevance_max"] or 0, 2),
                    "interpretation": self._get_interpretation(
                        stats["relevance_avg"] or 0
                    ),
                },
                "confidence": {
                    "mean": round(stats["confidence_avg"] or 0, 2),
                    "std_dev": round(stats["confidence_std"] or 0, 2),
                    "min": round(stats["confidence_min"] or 0, 2),
                    "max": round(stats["confidence_max"] or 0, 2),
                    "interpretation": self._get_interpretation(
                        stats["confidence_avg"] or 0
                    ),
                },
                "satisfaction": {
                    "mean": round(stats["satisfaction_avg"] or 0, 2),
                    "std_dev": round(stats["satisfaction_std"] or 0, 2),
                    "min": round(stats["satisfaction_min"] or 0, 2),
                    "max": round(stats["satisfaction_max"] or 0, 2),
                    "interpretation": self._get_interpretation(
                        stats["satisfaction_avg"] or 0
                    ),
                },
            }

            logger.info(
                f"ARCS statistics calculated for {stats['total_count']} profiles"
            )
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
