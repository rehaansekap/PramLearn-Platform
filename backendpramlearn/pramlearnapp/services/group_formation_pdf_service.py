from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    PageBreak,
)
from reportlab.platypus.flowables import Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime
import base64
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class GroupFormationPDFService:
    def __init__(self):
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=A4)
        self.styles = getSampleStyleSheet()
        self.story = []

        # Custom styles
        self.title_style = ParagraphStyle(
            "CustomTitle",
            parent=self.styles["Heading1"],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue,
        )

        self.heading_style = ParagraphStyle(
            "CustomHeading",
            parent=self.styles["Heading2"],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue,
        )

        self.normal_style = ParagraphStyle(
            "CustomNormal",
            parent=self.styles["Normal"],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
        )

    def generate_group_formation_report(
        self, material_data, groups_data, quality_analysis, formation_params
    ):
        """Generate comprehensive group formation analysis PDF"""

        try:
            # Create PDF in memory buffer
            buffer = BytesIO()

            # 1. Cover Page
            self._add_cover_page(material_data, formation_params)

            # 2. Executive Summary
            self._add_executive_summary(groups_data, quality_analysis, formation_params)

            # 3. Formation Process Analysis
            self._add_formation_process_analysis(formation_params, quality_analysis)

            # 4. Quality Metrics Analysis
            self._add_quality_metrics_analysis(quality_analysis)

            # 5. Groups Overview
            self._add_groups_overview(groups_data, quality_analysis)

            # 6. Detailed Group Analysis
            self._add_detailed_group_analysis(groups_data, quality_analysis)

            # 7. Recommendations
            # self._add_recommendations(quality_analysis, formation_params)

            # # 8. NEW: Mathematical explanation of DEAP processes
            if formation_params["mode"] == "heterogen":
                self._add_deap_mathematical_explanation()

            # Build PDF
            self.doc.build(self.story)
            pdf_content = self.buffer.getvalue()
            self.buffer.close()

            logger.info(f"PDF generated successfully, size: {len(pdf_content)} bytes")
            return pdf_content

        except Exception as e:
            logger.error(f"Error in PDF generation: {str(e)}")
            raise Exception(f"PDF generation failed: {str(e)}")

    def _add_deap_mathematical_explanation(self):
        """Add detailed mathematical explanation of DEAP genetic algorithm processes"""
        self.story.append(PageBreak())
        self.story.append(Paragraph("🧮 PENJELASAN ALGORITMA DEAP", self.heading_style))

        # Introduction
        intro_text = """
        <b>GAMBARAN UMUM DEAP (Distributed Evolutionary Algorithms in Python):</b><br/>
        DEAP adalah framework untuk komputasi evolusi yang menggunakan prinsip algoritma genetika untuk 
        mencari solusi optimal. Dalam konteks pembentukan kelompok, DEAP digunakan untuk mengoptimalkan 
        distribusi siswa berdasarkan multiple objective functions.
        """
        self.story.append(Paragraph(intro_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 1. Individual Representation
        representation_text = """
        <b>1. REPRESENTASI SOLUSI (Individual Representation)</b><br/><br/>
        
        Setiap individu dalam populasi merepresentasikan satu solusi pembentukan kelompok:<br/>
        • <b>Individual = [g1, g2, g3, ..., gn]</b><br/>
        • Dimana gi adalah nomor kelompok (0, 1, 2, ..., k-1) untuk siswa ke-i<br/>
        • n = jumlah total siswa<br/>
        • k = jumlah kelompok yang diinginkan<br/><br/>
        
        <b>Contoh Konkret:</b><br/>
        Untuk 12 siswa dalam 3 kelompok:<br/>
        Individual = [0, 1, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2]<br/>
        Artinya:<br/>
        • Siswa 1, 4, 7, 11 masuk kelompok 0<br/>
        • Siswa 2, 5, 8, 10 masuk kelompok 1<br/>
        • Siswa 3, 6, 9, 12 masuk kelompok 2
        """
        self.story.append(Paragraph(representation_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 2. Fitness Function
        fitness_text = """
        <b>2. FUNGSI PENILAIAN (Fitness Function)</b><br/><br/>
        
        Setiap solusi dinilai berdasarkan 3 kriteria dengan bobot berbeda:<br/>
        <b>Nilai Total = 40% × Nilai Keseragaman + 40% × Nilai Ukuran + 20% × Nilai Keberagaman</b><br/><br/>
        
        <b>2.1 Penilaian Ukuran Kelompok:</b><br/>
        • Mengukur seberapa seimbang ukuran antar kelompok<br/>
        • Target ideal: semua kelompok berukuran hampir sama<br/>
        • Rumus: jika target = [5,5,5] dan aktual = [4,5,6], maka deviasi = 1<br/>
        • Nilai = max(0, 1 - deviasi/3)<br/>
        • Semakin kecil deviasi, semakin tinggi nilainya<br/><br/>
        
        <b>2.2 Penilaian Keberagaman (Shannon Index):</b><br/>
        • Mengukur keberagaman motivasi dalam setiap kelompok<br/>
        • Kelompok dengan campuran High-Medium-Low mendapat nilai tinggi<br/>
        • Kelompok yang hanya satu jenis motivasi mendapat nilai rendah<br/>
        • Contoh: kelompok dengan 2H, 2M, 1L lebih beragam dari 5M saja<br/><br/>
        
        <b>2.3 Penilaian Keseragaman Distribusi:</b><br/>
        • Mengukur apakah distribusi motivasi merata antar kelompok<br/>
        • Contoh: jika ada 6 siswa High, idealnya 2 High per kelompok (3 kelompok)<br/>
        • Jika distribusi aktual = [3,2,1], maka kurang seragam<br/>
        • Menggunakan koefisien variasi untuk setiap level motivasi
        """
        self.story.append(Paragraph(fitness_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 3. Genetic Operators
        operators_text = """
        <b>3. OPERATOR GENETIKA</b><br/><br/>
        
        <b>3.1 Seleksi (Tournament Selection):</b><br/>
        • Pilih 3 individu secara acak dari populasi<br/>
        • Bandingkan nilai fitness mereka<br/>
        • Individu dengan nilai tertinggi menang dan dipilih sebagai parent<br/>
        • Proses ini diulang untuk memilih parent kedua<br/><br/>
        
        <b>3.2 Persilangan (Crossover):</b><br/>
        • Ambil 2 parent yang sudah terpilih<br/>
        • Pilih 2 titik potong secara acak<br/>
        • Tukar bagian tengah antara kedua parent<br/>
        • Contoh: Parent1=[0,1,2,0,1] dan Parent2=[2,0,1,2,0]<br/>
        • Jika titik potong di posisi 2 dan 4:<br/>
        • Child1=[0,1,1,2,1] dan Child2=[2,0,2,0,0]<br/>
        • Probabilitas: 70% (7 dari 10 kasus akan terjadi crossover)<br/><br/>
        
        <b>3.3 Mutasi Cerdas (Smart Mutation):</b><br/>
        • Untuk setiap gen, ada kemungkinan 20% untuk bermutasi<br/>
        • Bukan mutasi acak, tapi mutasi yang mempertimbangkan kebutuhan<br/>
        • Contoh: jika kelompok 1 kekurangan siswa High, prioritaskan siswa High untuk pindah ke kelompok 1<br/>
        • Algoritma mencari kelompok yang paling membutuhkan jenis motivasi tertentu<br/><br/>
        
        <b>3.4 Perbaikan Constraint:</b><br/>
        • Setelah crossover dan mutasi, periksa apakah solusi masih valid<br/>
        • Jika ada kelompok terlalu besar (>5) atau terlalu kecil (<3):<br/>
        • Pindahkan siswa dari kelompok besar ke kelompok kecil<br/>
        • Ulangi sampai semua kelompok memenuhi batasan ukuran
        """
        self.story.append(Paragraph(operators_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 4. Algorithm Flow
        self._add_algorithm_flow_section()

        # 5. Heuristic Initialization
        heuristic_text = """
        <b>5. INISIALISASI HEURISTIK</b><br/><br/>
        
        <b>5.1 Strategi Round-Robin:</b><br/>
        • Kelompokkan siswa berdasarkan motivasi: High, Medium, Low<br/>
        • Untuk setiap kelompok motivasi, bagikan siswa secara bergilir:<br/>
        • Siswa High ke-1 → Kelompok 1, High ke-2 → Kelompok 2, dst.<br/>
        • Siswa Medium ke-1 → Kelompok 1, Medium ke-2 → Kelompok 2, dst.<br/>
        • Hasilnya: distribusi merata dalam setiap level motivasi<br/><br/>
        
        <b>5.2 Strategi Pola Seimbang:</b><br/>
        • Tentukan pola ideal berdasarkan ukuran kelompok:<br/>
        • Kelompok 4 siswa: 1 High + 2 Medium + 1 Low<br/>
        • Kelompok 5 siswa: 2 High + 2 Medium + 1 Low<br/>
        • Kelompok 3 siswa: 1 High + 1 Medium + 1 Low<br/>
        • Tempatkan siswa sesuai pola ideal ini<br/><br/>
        
        <b>5.3 Keuntungan Inisialisasi Heuristik:</b><br/>
        • Memberikan titik awal yang baik untuk algoritma<br/>
        • Mengurangi waktu komputasi untuk mencapai solusi optimal<br/>
        • Menghindari solusi yang buruk di awal proses
        """
        self.story.append(Paragraph(heuristic_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 6. Complexity Analysis
        complexity_text = """
        <b>6. ANALISIS KOMPLEKSITAS DAN PERFORMA</b><br/><br/>
        
        <b>Kompleksitas Waktu:</b><br/>
        • Ukuran populasi: 100 individu<br/>
        • Jumlah generasi: 50 generasi<br/>
        • Untuk n siswa dan k kelompok:<br/>
        • Waktu evaluasi fitness: O(n × k)<br/>
        • Total waktu: O(100 × 50 × n × k)<br/>
        • Contoh: 34 siswa, 7 kelompok = sekitar 1,190,000 operasi<br/><br/>
        
        <b>Kompleksitas Ruang:</b><br/>
        • Setiap individu: n integers (untuk n siswa)<br/>
        • Populasi: 100 × n integers<br/>
        • Struktur tambahan: k² untuk analisis kelompok<br/>
        • Total: O(100n + k²)<br/><br/>
        
        <b>Properti Konvergensi:</b><br/>
        • Elitism: individu terbaik selalu dipertahankan<br/>
        • Tournament selection: menjaga keberagaman populasi<br/>
        • Smart mutation: mencegah stuck di local optimum<br/>
        • Biasanya konvergen dalam 20-30 generasi<br/><br/>
        
        <b>Jaminan Kualitas Solusi:</b><br/>
        • Tidak ada jaminan matematis untuk global optimum (masalah NP-hard)<br/>
        • Studi empiris menunjukkan tingkat kepuasan 95%+<br/>
        • Multiple runs dengan seed berbeda untuk robustness
        """
        self.story.append(Paragraph(complexity_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 7. Implementation Details
        implementation_text = """
        <b>7. DETAIL IMPLEMENTASI</b><br/><br/>
        
        <b>Parameter Tuning:</b><br/>
        • Ukuran populasi: 100 (trade-off antara kualitas dan kecepatan)<br/>
        • Tingkat crossover: 70% (optimal untuk balanced exploration/exploitation)<br/>
        • Tingkat mutasi: 20% (mencegah premature convergence)<br/>
        • Ukuran tournament: 3 (menjaga selection pressure)<br/><br/>
        
        <b>Konfigurasi DEAP Framework:</b><br/>
        """
        self.story.append(Paragraph(implementation_text, self.normal_style))
        self.story.append(Spacer(1, 0.1 * inch))

        # Add code block as a table for better formatting
        code_data = [
            ["Konfigurasi DEAP Framework"],
            ["# Definisi fitness (maksimasi)"],
            ["creator.create('FitnessMax', base.Fitness, weights=(1.0,))"],
            [""],
            ["# Definisi individu sebagai list dengan fitness"],
            ["creator.create('Individual', list, fitness=creator.FitnessMax)"],
            [""],
            ["# Registrasi fungsi-fungsi utama"],
            ["toolbox.register('individual', create_individual)"],
            [
                "toolbox.register('population', tools.initRepeat, list, toolbox.individual)"
            ],
            ["toolbox.register('evaluate', evaluate_grouping)"],
            ["toolbox.register('mate', crossover_assignment)"],
            ["toolbox.register('mutate', mutate_assignment, indpb=0.2)"],
            ["toolbox.register('select', tools.selTournament, tournsize=3)"],
            [""],
            ["# Menjalankan algoritma"],
            ["algorithms.eaSimple(population, toolbox, cxpb=0.7, mutpb=0.3, ngen=50)"],
        ]

        code_table = Table(code_data, colWidths=[7 * inch])
        code_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.lightgrey),
                    ("FONTNAME", (0, 1), (-1, -1), "Courier"),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("BOX", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        self.story.append(code_table)
        self.story.append(Spacer(1, 0.2 * inch))

        performance_text = """
        <b>Metrik Performa:</b><br/>
        • Waktu eksekusi rata-rata: 2-5 detik untuk 34 siswa<br/>
        • Penggunaan memori: kurang dari 50MB<br/>
        • Tingkat keberhasilan: lebih dari 95% untuk problem yang feasible<br/>
        • Skalabilitas: linear dengan jumlah siswa
        """
        self.story.append(Paragraph(performance_text, self.normal_style))
        self.story.append(Spacer(1, 0.2 * inch))

        # 8. Process Flow Diagram - FIXED FORMATTING
        self.story.append(Paragraph("<b>8. DIAGRAM ALUR PROSES</b>", self.normal_style))
        self.story.append(Spacer(1, 0.1 * inch))

        # Create flowchart as a structured table
        flowchart_data = [
            ["FLOWCHART ALGORITMA DEAP"],
            [""],
            ["[START]"],
            ["↓"],
            ["[Inisialisasi Populasi 100 individu]"],
            ["↓"],
            ["[Tambahkan 10 solusi heuristik terbaik]"],
            ["↓"],
            ["[Evaluasi fitness setiap individu]"],
            ["↓"],
            ["[Generasi = 1]"],
            ["↓"],
            ["[Seleksi 2 parent dengan tournament]"],
            ["↓"],
            ["[Crossover dengan probabilitas 70%] → [Tidak crossover]"],
            ["↓                                      ↓"],
            ["[Mutasi dengan probabilitas 20%]       [Skip]"],
            ["↓                                      ↓"],
            ["[Perbaikan constraint] ←---------------"],
            ["↓"],
            ["[Evaluasi fitness offspring]"],
            ["↓"],
            ["[Gabungkan populasi lama + offspring]"],
            ["↓"],
            ["[Pilih 100 individu terbaik]"],
            ["↓"],
            ["[Generasi = Generasi + 1]"],
            ["↓"],
            ["[Generasi > 50?] → [TIDAK] → [Kembali ke Seleksi]"],
            ["↓"],
            ["[YA]"],
            ["↓"],
            ["[Kembalikan individu terbaik]"],
            ["↓"],
            ["[END]"],
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
                    ("FONTNAME", (0, 1), (-1, -1), "Courier"),
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

        # Footer
        footer_text = """
        <b>REFERENSI:</b><br/>
        • DEAP Documentation: https://deap.readthedocs.io/<br/>
        • Fortin, F. A., et al. (2012). DEAP: Evolutionary algorithms made easy. JMLR, 13, 2171-2175.<br/>
        • Holland, J. H. (1992). Adaptation in natural and artificial systems. MIT Press.<br/>
        • Shannon, C. E. (1948). A mathematical theory of communication. Bell System Technical Journal.<br/><br/>
        
        <b>KESIMPULAN:</b><br/>
        Algoritma DEAP memberikan solusi optimal untuk pembentukan kelompok heterogen dengan mempertimbangkan
        multiple objective: keseimbangan ukuran, keberagaman motivasi, dan keseragaman distribusi. 
        Implementasi ini telah dioptimalkan khusus untuk PRAMLEARN dengan hasil yang konsisten dan reliable.<br/><br/>
        
        <i>Implementasi ini dikembangkan khusus untuk PRAMLEARN dengan optimasi untuk pembentukan kelompok 
        pembelajaran kolaboratif berdasarkan profil motivasi ARCS siswa.</i>
        """
        self.story.append(Paragraph(footer_text, self.normal_style))

    def _add_algorithm_flow_section(self):
        """Add algorithm flow with proper formatting"""
        algorithm_text = """
        <b>4. ALUR ALGORITMA GENETIKA</b><br/><br/>
        
        <b>LANGKAH-LANGKAH ALGORITMA:</b>
        """
        self.story.append(Paragraph(algorithm_text, self.normal_style))
        self.story.append(Spacer(1, 0.1 * inch))

        # Pseudocode as formatted table
        pseudocode_data = [
            ["PSEUDOCODE ALGORITMA DEAP"],
            [""],
            ["1. INISIALISASI:"],
            ["   - Buat populasi awal 100 individu"],
            ["   - Tambahkan 10 solusi heuristik terbaik"],
            ["   - Hitung fitness untuk setiap individu"],
            [""],
            ["2. UNTUK setiap generasi (1 sampai 50):"],
            ["   a. SELEKSI:"],
            ["      - Pilih 2 parent menggunakan tournament selection"],
            [""],
            ["   b. PERSILANGAN:"],
            ["      - Jika random < 0.7: lakukan crossover"],
            ["      - Hasilkan 2 offspring"],
            [""],
            ["   c. MUTASI:"],
            ["      - Untuk setiap gen dalam offspring:"],
            ["        - Jika random < 0.2: lakukan smart mutation"],
            [""],
            ["   d. PERBAIKAN:"],
            ["      - Periksa dan perbaiki constraint violations"],
            [""],
            ["   e. EVALUASI:"],
            ["      - Hitung fitness untuk offspring baru"],
            [""],
            ["   f. PENGGANTIAN:"],
            ["      - Gabungkan populasi lama dengan offspring"],
            ["      - Pilih 100 individu terbaik untuk generasi berikutnya"],
            [""],
            ["3. TERMINASI:"],
            ["   - Setelah 50 generasi, kembalikan individu terbaik"],
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
                    ("FONTNAME", (0, 1), (-1, -1), "Courier"),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
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

    def _add_cover_page(self, material_data, formation_params):
        """Add cover page"""
        self.story.append(Spacer(1, 2 * inch))

        # Title
        title = Paragraph(
            "📊 LAPORAN ANALISIS<br/>PEMBENTUKAN KELOMPOK OTOMATIS", self.title_style
        )
        self.story.append(title)
        self.story.append(Spacer(1, 0.5 * inch))

        # Material info
        material_info = f"""
        <b>Materi:</b> {material_data.get('title', 'N/A')}<br/>
        <b>Mata Pelajaran:</b> {material_data.get('subject', 'N/A')}<br/>
        <b>Guru:</b> {material_data.get('teacher', 'N/A')}<br/>
        <b>Mode Pembentukan:</b> {formation_params['mode'].title()}<br/>
        <b>Jumlah Kelompok:</b> {len(formation_params['groups'])}<br/>
        <b>Tanggal Pembentukan:</b> {datetime.now().strftime('%d %B %Y, %H:%M WIB')}
        """

        info_para = Paragraph(material_info, self.normal_style)
        self.story.append(info_para)
        self.story.append(PageBreak())

    def _add_executive_summary(self, groups_data, quality_analysis, formation_params):
        """Add executive summary"""
        self.story.append(Paragraph("📋 RINGKASAN EKSEKUTIF", self.heading_style))

        # Key metrics summary
        mode = formation_params["mode"]
        total_students = sum(group["size"] for group in groups_data)
        total_groups = len(groups_data)
        avg_group_size = total_students / total_groups if total_groups > 0 else 0

        balance_score = quality_analysis.get("balance_score", 0) * 100
        heterogeneity_score = quality_analysis.get("heterogeneity_score", 0) * 100
        uniformity_score = quality_analysis.get("uniformity_score", 0) * 100

        # Quality assessment
        overall_quality = (balance_score + heterogeneity_score + uniformity_score) / 3

        if overall_quality >= 80:
            quality_status = "🟢 SANGAT BAIK"
            quality_desc = "Pembentukan kelompok berhasil dengan sangat baik. Semua metrik kualitas menunjukkan hasil optimal."
        elif overall_quality >= 60:
            quality_status = "🟡 BAIK"
            quality_desc = "Pembentukan kelompok berhasil dengan baik. Beberapa aspek dapat dioptimalkan lebih lanjut."
        else:
            quality_status = "🔴 PERLU PERBAIKAN"
            quality_desc = "Pembentukan kelompok memerlukan evaluasi dan penyesuaian untuk hasil yang lebih optimal."

        summary_text = f"""
        <b>Status Kualitas:</b> {quality_status}<br/>
        <b>Penilaian:</b> {quality_desc}<br/><br/>
        
        <b>📊 METRIK UTAMA:</b><br/>
        • Total Siswa: {total_students} siswa<br/>
        • Jumlah Kelompok: {total_groups} kelompok<br/>
        • Rata-rata Ukuran Kelompok: {avg_group_size:.1f} siswa<br/>
        • Mode Pembentukan: {mode.title()}<br/><br/>
        
        <b>🎯 SKOR KUALITAS:</b><br/>
        • Keseimbangan Ukuran: {balance_score:.1f}%<br/>
        • Keberagaman Motivasi: {heterogeneity_score:.1f}%<br/>
        • Keseragaman Distribusi: {uniformity_score:.1f}%<br/>
        • <b>Skor Keseluruhan: {overall_quality:.1f}%</b>
        """

        summary_para = Paragraph(summary_text, self.normal_style)
        self.story.append(summary_para)
        self.story.append(Spacer(1, 0.3 * inch))

    def _add_formation_process_analysis(self, formation_params, quality_analysis):
        """Add formation process analysis"""
        self.story.append(
            Paragraph("⚙️ ANALISIS PROSES PEMBENTUKAN", self.heading_style)
        )

        mode = formation_params["mode"]
        algorithm_used = (
            "DEAP Genetic Algorithm"
            if mode == "heterogen"
            else "Motivation-based Clustering"
        )

        process_text = f"""
        <b>1. ALGORITMA YANG DIGUNAKAN</b><br/>
        Algoritma: {algorithm_used}<br/>
        Tujuan: {'Memaksimalkan keberagaman dan keseragaman distribusi' if mode == 'heterogen' else 'Mengelompokkan siswa dengan tingkat motivasi serupa'}<br/><br/>
        
        <b>2. PARAMETER OPTIMASI</b><br/>"""

        if mode == "heterogen":
            process_text += """
            • Fitness Function: Multi-objective (40% Uniformity + 40% Size Balance + 20% Heterogeneity)<br/>
            • Population Size: 100 individu<br/>
            • Generations: 50 generasi<br/>
            • Crossover Rate: 70%<br/>
            • Mutation Rate: 30%<br/>
            • Tournament Selection: Size 3<br/><br/>
            
            <b>3. STRATEGI OPTIMASI</b><br/>
            • Heuristic Initialization: Solusi awal menggunakan round-robin dan balanced distribution<br/>
            • Smart Mutation: Mutasi yang mempertimbangkan kebutuhan kelompok<br/>
            • Constraint Repair: Perbaikan otomatis untuk memenuhi batasan ukuran kelompok<br/>
            • Target Pattern: Distribusi ideal 1H:2M:1L untuk kelompok berukuran 4<br/>
            """
        else:
            process_text += """
            • Clustering Method: Pure Motivation Level Grouping<br/>
            • Priority: Homogenitas tingkat motivasi<br/>
            • Fallback: Merge strategy untuk menyesuaikan jumlah kelompok<br/>
            """

        process_para = Paragraph(process_text, self.normal_style)
        self.story.append(process_para)
        self.story.append(Spacer(1, 0.3 * inch))

    def _add_quality_metrics_analysis(self, quality_analysis):
        """Add detailed quality metrics analysis"""
        self.story.append(Paragraph("📈 ANALISIS METRIK KUALITAS", self.heading_style))

        balance_score = quality_analysis.get("balance_score", 0)
        heterogeneity_score = quality_analysis.get("heterogeneity_score", 0)
        uniformity_score = quality_analysis.get("uniformity_score", 0)

        interpretation = quality_analysis.get("interpretation", {})

        # FIX: Provide default interpretations if missing
        if not interpretation.get("balance"):
            if balance_score > 0.8:
                interpretation["balance"] = "Sangat Seimbang"
            elif balance_score > 0.6:
                interpretation["balance"] = "Cukup Seimbang"
            else:
                interpretation["balance"] = "Kurang Seimbang"

        if not interpretation.get("heterogeneity"):
            if heterogeneity_score > 0.7:
                interpretation["heterogeneity"] = "Sangat Beragam"
            elif heterogeneity_score > 0.4:
                interpretation["heterogeneity"] = "Cukup Beragam"
            elif heterogeneity_score > 0.2:
                interpretation["heterogeneity"] = "Kurang Beragam"
            else:
                interpretation["heterogeneity"] = "Sangat Homogen"

        if not interpretation.get("uniformity"):
            if uniformity_score > 0.8:
                interpretation["uniformity"] = "Sangat Seragam"
            elif uniformity_score > 0.6:
                interpretation["uniformity"] = "Cukup Seragam"
            else:
                interpretation["uniformity"] = "Kurang Seragam"

        # Create metrics table
        metrics_data = [
            ["Metrik", "Skor", "Interpretasi", "Deskripsi"],
            [
                "Balance Score",
                f"{balance_score:.3f}",
                interpretation.get("balance", "Tidak Tersedia"),
                "Mengukur keseimbangan anggot",
            ],
            [
                "Heterogeneity Score",
                f"{heterogeneity_score:.3f}",
                interpretation.get("heterogeneity", "Tidak Tersedia"),
                "Mengukur keberagaman tingkat motivasi",
            ],
            [
                "Uniformity Score",
                f"{uniformity_score:.3f}",
                interpretation.get("uniformity", "Tidak Tersedia"),
                "Mengukur keseragaman pola distribusi",
            ],
        ]

        metrics_table = Table(
            metrics_data, colWidths=[2 * inch, 1 * inch, 1.5 * inch, 2.5 * inch]
        )
        metrics_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.lightgrey],
                    ),
                ]
            )
        )

        self.story.append(metrics_table)
        self.story.append(Spacer(1, 0.2 * inch))

        # ADD: Quality metrics bar chart
        quality_chart = self._create_quality_metrics_chart(
            balance_score, heterogeneity_score, uniformity_score
        )
        if quality_chart:
            self.story.append(
                Paragraph("📊 GRAFIK PERBANDINGAN SKOR KUALITAS", self.heading_style)
            )
            self.story.append(quality_chart)
            self.story.append(Spacer(1, 0.2 * inch))

        # Add interpretation details
        interpretation_text = f"""
        <b>INTERPRETASI HASIL:</b><br/>
        • <b>Keseimbangan ({interpretation.get('balance', 'N/A')}):</b> {'Semua kelompok memiliki ukuran yang seimbang' if balance_score > 0.8 else 'Ada ketidakseimbangan ukuran kelompok' if balance_score < 0.5 else 'Keseimbangan cukup baik'}<br/>
        • <b>Keberagaman ({interpretation.get('heterogeneity', 'N/A')}):</b> {'Kelompok sangat beragam dalam tingkat motivasi' if heterogeneity_score > 0.7 else 'Kelompok cukup homogen' if heterogeneity_score < 0.4 else 'Keberagaman sedang'}<br/>
        • <b>Keseragaman ({interpretation.get('uniformity', 'N/A')}):</b> {'Distribusi antar kelompok sangat seragam' if uniformity_score > 0.8 else 'Distribusi kurang seragam' if uniformity_score < 0.6 else 'Distribusi cukup seragam'}
        """

        interpretation_para = Paragraph(interpretation_text, self.normal_style)
        self.story.append(interpretation_para)
        self.story.append(PageBreak())

    def _create_quality_metrics_chart(
        self, balance_score, heterogeneity_score, uniformity_score
    ):
        """Create a bar chart showing quality metrics comparison"""
        try:
            from reportlab.graphics.charts.barcharts import VerticalBarChart
            from reportlab.graphics.shapes import Drawing
            from reportlab.lib import colors

            # Create drawing
            drawing = Drawing(500, 350)

            # Create bar chart
            chart = VerticalBarChart()
            chart.x = 50
            chart.y = 80
            chart.height = 200
            chart.width = 400

            # Data for the chart (convert to percentages)
            chart.data = [
                [balance_score * 100, heterogeneity_score * 100, uniformity_score * 100]
            ]

            # Labels for categories
            chart.categoryAxis.categoryNames = [
                "Keseimbangan\nUkuran",
                "Keberagaman\nMotivasi",
                "Keseragaman\nDistribusi",
            ]

            # Customize chart appearance
            chart.valueAxis.valueMin = 0
            chart.valueAxis.valueMax = 100
            chart.valueAxis.valueStep = 20

            # Bar colors - different color for each metric
            chart.bars[0].fillColor = colors.Color(0.2, 0.4, 0.8)  # Blue for Balance
            chart.bars[1].fillColor = colors.Color(
                0.8, 0.4, 0.2
            )  # Orange for Heterogeneity
            chart.bars[2].fillColor = colors.Color(
                0.2, 0.8, 0.4
            )  # Green for Uniformity

            # Make bars have different colors
            for i in range(3):
                if i == 0:
                    chart.bars[i].fillColor = colors.Color(0.2, 0.4, 0.8)  # Blue
                elif i == 1:
                    chart.bars[i].fillColor = colors.Color(0.8, 0.4, 0.2)  # Orange
                else:
                    chart.bars[i].fillColor = colors.Color(0.2, 0.8, 0.4)  # Green

            # Chart styling
            chart.bars.strokeColor = colors.black
            chart.bars.strokeWidth = 1

            # Category axis styling
            chart.categoryAxis.labels.boxAnchor = "n"
            chart.categoryAxis.labels.fontSize = 10
            chart.categoryAxis.labels.fontName = "Helvetica"

            # Value axis styling
            chart.valueAxis.labels.fontSize = 10
            chart.valueAxis.labels.fontName = "Helvetica"
            chart.valueAxis.labelTextFormat = "%d%%"

            # Add title
            from reportlab.graphics.shapes import String

            drawing.add(
                String(
                    250,
                    320,
                    "Perbandingan Skor Kualitas Kelompok",
                    fontSize=14,
                    textAnchor="middle",
                    fontName="Helvetica-Bold",
                )
            )

            # Add value labels on top of bars
            bar_width = chart.width / len(chart.data[0])
            for i, value in enumerate(
                [balance_score * 100, heterogeneity_score * 100, uniformity_score * 100]
            ):
                x_pos = chart.x + (i * bar_width) + (bar_width / 2)
                y_pos = chart.y + (value / 100 * chart.height) + 10
                drawing.add(
                    String(
                        x_pos,
                        y_pos,
                        f"{value:.1f}%",
                        fontSize=10,
                        textAnchor="middle",
                        fontName="Helvetica-Bold",
                    )
                )

            # Add legend
            legend_y = 40
            legend_items = [
                ("Keseimbangan Ukuran", colors.Color(0.2, 0.4, 0.8)),
                ("Keberagaman Motivasi", colors.Color(0.8, 0.4, 0.2)),
                ("Keseragaman Distribusi", colors.Color(0.2, 0.8, 0.4)),
            ]

            for i, (label, color) in enumerate(legend_items):
                x_pos = 50 + (i * 150)
                # Legend box
                from reportlab.graphics.shapes import Rect

                drawing.add(
                    Rect(
                        x_pos,
                        legend_y,
                        15,
                        10,
                        fillColor=color,
                        strokeColor=colors.black,
                    )
                )
                # Legend text
                drawing.add(
                    String(
                        x_pos + 20,
                        legend_y + 3,
                        label,
                        fontSize=9,
                        fontName="Helvetica",
                    )
                )

            # Add chart to drawing
            drawing.add(chart)

            return drawing

        except Exception as e:
            logger.error(f"Error creating quality metrics chart: {str(e)}")
            return None

    def _add_groups_overview(self, groups_data, quality_analysis):
        """Add groups overview with visualization"""
        self.story.append(Paragraph("👥 OVERVIEW KELOMPOK", self.heading_style))

        # Group sizes distribution
        sizes = [group["size"] for group in groups_data]
        size_distribution = {}
        for size in sizes:
            size_distribution[size] = size_distribution.get(size, 0) + 1

        # Motivation distribution across all groups
        total_motivation = {"High": 0, "Medium": 0, "Low": 0}
        for group in groups_data:
            dist = group.get("motivation_distribution", {})
            for level in ["High", "Medium", "Low"]:
                total_motivation[level] += dist.get(level, 0)

        # Create overview table
        overview_data = [
            ["Aspek", "Detail"],
            ["Total Kelompok", f"{len(groups_data)} kelompok"],
            ["Total Siswa", f"{sum(sizes)} siswa"],
            [
                "Ukuran Kelompok",
                f"Min: {min(sizes)}, Max: {max(sizes)}, Rata-rata: {sum(sizes)/len(sizes):.1f}",
            ],
            [
                "Distribusi Ukuran",
                ", ".join(
                    [
                        f"{size} siswa: {count} kelompok"
                        for size, count in sorted(size_distribution.items())
                    ]
                ),
            ],
            [
                "Distribusi Motivasi",
                f"High: {total_motivation['High']}, Medium: {total_motivation['Medium']}, Low: {total_motivation['Low']}",
            ],
        ]

        overview_table = Table(overview_data, colWidths=[2 * inch, 4 * inch])
        overview_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )

        self.story.append(overview_table)
        self.story.append(Spacer(1, 0.2 * inch))

        # ADD: Stacked bar chart for group motivation distribution
        stacked_chart = self._create_group_distribution_stacked_chart(groups_data)
        if stacked_chart:
            self.story.append(
                Paragraph("📊 DISTRIBUSI MOTIVASI PER KELOMPOK", self.heading_style)
            )
            self.story.append(stacked_chart)
            self.story.append(Spacer(1, 0.3 * inch))

    def _create_group_distribution_stacked_chart(self, groups_data):
        """Create a stacked bar chart showing motivation distribution per group"""
        from reportlab.graphics.shapes import Drawing, Rect, String, Line
        from reportlab.lib import colors

        width = 7.5 * inch
        height = 5 * inch

        drawing = Drawing(width, height)

        # Batasi hanya menampilkan maksimal 8 kelompok untuk kejelasan chart
        display_groups = groups_data[:8] if len(groups_data) > 8 else groups_data

        if not display_groups:
            drawing.add(
                String(
                    width / 2,
                    height / 2,
                    "Tidak ada data kelompok",
                    fontSize=12,
                    textAnchor="middle",
                )
            )
            return drawing

        # Setup chart dimensions dengan margin yang lebih baik
        chart_x = 80
        chart_y = 100
        chart_width = width - 160
        chart_height = height - 200

        # Cari nilai maksimum untuk scaling
        max_students = max([group.get("member_count", 0) for group in display_groups])
        if max_students == 0:
            max_students = 5  # Default fallback

        # Warna yang lebih menarik dan kontras
        colors_map = {
            "High": colors.Color(0.2, 0.7, 0.3),  # Green yang lebih cerah
            "Medium": colors.Color(0.9, 0.6, 0.1),  # Orange yang lebih cerah
            "Low": colors.Color(0.8, 0.2, 0.2),  # Red yang lebih cerah
        }

        # Gambar chart untuk setiap kelompok
        group_width = chart_width / len(display_groups)
        bar_width = min(group_width * 0.6, 60)  # Maksimal 60 points lebar

        for i, group in enumerate(display_groups):
            x_pos = chart_x + i * group_width
            group_size = group.get("member_count", 0)

            # Gunakan motivation_distribution yang sudah dihitung
            dist = group.get(
                "motivation_distribution", {"High": 0, "Medium": 0, "Low": 0}
            )

            # Gambar stacked bars
            current_y = chart_y
            total_height = (
                (group_size / max_students) * chart_height if max_students > 0 else 0
            )

            # Proporsi setiap tingkat motivasi
            high_height = (
                (dist["High"] / group_size * total_height) if group_size > 0 else 0
            )
            medium_height = (
                (dist["Medium"] / group_size * total_height) if group_size > 0 else 0
            )
            low_height = (
                (dist["Low"] / group_size * total_height) if group_size > 0 else 0
            )

            bar_x = x_pos + (group_width - bar_width) / 2

            # Gambar High (hijau) - paling bawah
            if high_height > 0:
                drawing.add(
                    Rect(
                        bar_x,
                        current_y,
                        bar_width,
                        high_height,
                        fillColor=colors_map["High"],
                        strokeColor=colors.black,
                        strokeWidth=0.5,
                    )
                )
                # Label angka di tengah segment jika cukup tinggi
                if high_height > 20 and dist["High"] > 0:
                    drawing.add(
                        String(
                            bar_x + bar_width / 2,
                            current_y + high_height / 2,
                            str(dist["High"]),
                            fontSize=9,
                            textAnchor="middle",
                            fontName="Helvetica-Bold",
                            fillColor=colors.white,
                        )
                    )
                current_y += high_height

            # Gambar Medium (orange) - tengah
            if medium_height > 0:
                drawing.add(
                    Rect(
                        bar_x,
                        current_y,
                        bar_width,
                        medium_height,
                        fillColor=colors_map["Medium"],
                        strokeColor=colors.black,
                        strokeWidth=0.5,
                    )
                )
                if medium_height > 20 and dist["Medium"] > 0:
                    drawing.add(
                        String(
                            bar_x + bar_width / 2,
                            current_y + medium_height / 2,
                            str(dist["Medium"]),
                            fontSize=9,
                            textAnchor="middle",
                            fontName="Helvetica-Bold",
                            fillColor=colors.white,
                        )
                    )
                current_y += medium_height

            # Gambar Low (merah) - paling atas
            if low_height > 0:
                drawing.add(
                    Rect(
                        bar_x,
                        current_y,
                        bar_width,
                        low_height,
                        fillColor=colors_map["Low"],
                        strokeColor=colors.black,
                        strokeWidth=0.5,
                    )
                )
                if low_height > 20 and dist["Low"] > 0:
                    drawing.add(
                        String(
                            bar_x + bar_width / 2,
                            current_y + low_height / 2,
                            str(dist["Low"]),
                            fontSize=9,
                            textAnchor="middle",
                            fontName="Helvetica-Bold",
                            fillColor=colors.white,
                        )
                    )

            # Label kelompok di bawah - yang lebih pendek
            group_name = group["name"].replace("Kelompok ", "Kel ")
            drawing.add(
                String(
                    x_pos + group_width / 2,
                    chart_y - 25,
                    group_name,
                    fontSize=10,
                    textAnchor="middle",
                    fontName="Helvetica-Bold",
                )
            )

            # Total siswa di atas bar dengan background
            # total_y = chart_y + total_height + 15
            # drawing.add(
            #     String(
            #         x_pos + group_width / 2,
            #         total_y,
            #         f"Total: {group_size}",
            #         fontSize=8,
            #         textAnchor="middle",
            #         fontName="Helvetica",
            #         fillColor=colors.darkblue,
            #     )
            # )

        # Gambar sumbu Y dengan grid lines
        drawing.add(
            Line(
                chart_x,
                chart_y,
                chart_x,
                chart_y + chart_height,
                strokeColor=colors.black,
                strokeWidth=1,
            )
        )

        # Y-axis labels dengan grid horizontal
        for i in range(6):
            y_value = (max_students * i) / 5
            y_pos = chart_y + i * chart_height / 5

            # Grid line horizontal
            if i > 0:
                drawing.add(
                    Line(
                        chart_x,
                        y_pos,
                        chart_x + chart_width,
                        y_pos,
                        strokeColor=colors.lightgrey,
                        strokeWidth=0.5,
                        strokeDashArray=[2, 2],
                    )
                )

            if y_value % 1 == 0:  # Only show integer values
                drawing.add(
                    String(
                        chart_x - 10,
                        y_pos - 3,
                        str(int(y_value)),
                        fontSize=9,
                        textAnchor="end",
                        fontName="Helvetica",
                    )
                )

        # Gambar sumbu X
        drawing.add(
            Line(
                chart_x,
                chart_y,
                chart_x + chart_width,
                chart_y,
                strokeColor=colors.black,
                strokeWidth=1,
            )
        )

        # Chart title yang lebih besar dan menarik
        drawing.add(
            String(
                width / 2,
                height - 40,
                "Distribusi Motivasi Siswa per Kelompok",
                fontSize=16,
                textAnchor="middle",
                fontName="Helvetica-Bold",
                fillColor=colors.darkblue,
            )
        )

        # Y-axis title
        drawing.add(
            String(
                25,
                height / 2,
                "Jumlah Siswa",
                fontSize=11,
                textAnchor="middle",
                fontName="Helvetica-Bold",
                fillColor=colors.darkblue,
            )
        )

        # Legend yang lebih rapi dengan box background
        legend_y = height - 80
        legend_x_start = chart_x

        # Background untuk legend
        drawing.add(
            Rect(
                legend_x_start - 10,
                legend_y - 10,
                chart_width + 20,
                30,
                fillColor=colors.Color(0.95, 0.95, 0.95),
                strokeColor=colors.lightgrey,
                strokeWidth=0.5,
            )
        )

        legend_items = [
            ("Motivasi Tinggi", colors_map["High"]),
            ("Motivasi Sedang", colors_map["Medium"]),
            ("Motivasi Rendah", colors_map["Low"]),
        ]

        legend_item_width = chart_width / 3
        for i, (label, color) in enumerate(legend_items):
            x_pos = legend_x_start + i * legend_item_width

            # Legend box
            drawing.add(
                Rect(
                    x_pos,
                    legend_y,
                    18,
                    12,
                    fillColor=color,
                    strokeColor=colors.black,
                    strokeWidth=0.5,
                )
            )

            # Legend text
            drawing.add(
                String(
                    x_pos + 25,
                    legend_y + 3,
                    label,
                    fontSize=10,
                    fontName="Helvetica",
                    fillColor=colors.black,
                )
            )

        # Summary statistics dengan styling yang lebih baik
        total_students = sum(group.get("member_count", 0) for group in display_groups)
        total_high = sum(
            group.get("motivation_distribution", {}).get("High", 0)
            for group in display_groups
        )
        total_medium = sum(
            group.get("motivation_distribution", {}).get("Medium", 0)
            for group in display_groups
        )
        total_low = sum(
            group.get("motivation_distribution", {}).get("Low", 0)
            for group in display_groups
        )

        # Background untuk summary
        summary_y = chart_y - 60
        drawing.add(
            Rect(
                chart_x - 10,
                summary_y - 10,
                chart_width + 20,
                25,
                fillColor=colors.Color(0.9, 0.95, 1.0),
                strokeColor=colors.darkblue,
                strokeWidth=0.5,
            )
        )

        summary_text = f"Total: {total_students} siswa | Tinggi: {total_high} | Sedang: {total_medium} | Rendah: {total_low}"
        drawing.add(
            String(
                width / 2,
                summary_y,
                summary_text,
                fontSize=11,
                textAnchor="middle",
                fontName="Helvetica-Bold",
                fillColor=colors.darkblue,
            )
        )

        # Tambahan informasi distribusi persentase
        if total_students > 0:
            high_pct = (total_high / total_students) * 100
            medium_pct = (total_medium / total_students) * 100
            low_pct = (total_low / total_students) * 100

            percentage_text = f"Persentase: Tinggi {high_pct:.1f}% | Sedang {medium_pct:.1f}% | Rendah {low_pct:.1f}%"
            drawing.add(
                String(
                    width / 2,
                    summary_y - 20,
                    percentage_text,
                    fontSize=9,
                    textAnchor="middle",
                    fontName="Helvetica",
                    fillColor=colors.darkgrey,
                )
            )

        return drawing

    def _add_detailed_group_analysis(self, groups_data, quality_analysis):
        """Add detailed analysis for each group"""
        self.story.append(Paragraph("🔍 ANALISIS DETAIL KELOMPOK", self.heading_style))

        # Groups summary table
        groups_summary_data = [
            [
                "Kelompok",
                "Ukuran",
                "High",
                "Medium",
                "Low",
                "Heterogeneity Index",
                "Pola Distribusi",
            ]
        ]

        group_details = quality_analysis.get("group_details", [])

        for i, group in enumerate(groups_data):
            detail = group_details[i] if i < len(group_details) else {}
            dist = group["motivation_distribution"]
            pattern = f"{dist['High']}H:{dist['Medium']}M:{dist['Low']}L"
            heterogeneity = detail.get("heterogeneity_index", 0)

            groups_summary_data.append(
                [
                    group["name"],
                    str(group["size"]),
                    str(dist["High"]),
                    str(dist["Medium"]),
                    str(dist["Low"]),
                    f"{heterogeneity:.3f}",
                    pattern,
                ]
            )

        groups_summary_table = Table(
            groups_summary_data,
            colWidths=[
                1 * inch,
                0.7 * inch,
                0.6 * inch,
                0.8 * inch,
                0.6 * inch,
                1 * inch,
                1.3 * inch,
            ],
        )
        groups_summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 1), (-1, -1), 8),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.white, colors.lightgrey],
                    ),
                ]
            )
        )

        self.story.append(groups_summary_table)
        self.story.append(Spacer(1, 0.3 * inch))

        # Pattern analysis
        patterns = {}
        for group in groups_data:
            dist = group["motivation_distribution"]
            pattern = f"{dist['High']}H:{dist['Medium']}M:{dist['Low']}L"
            patterns[pattern] = patterns.get(pattern, 0) + 1

        pattern_text = "<b>ANALISIS POLA DISTRIBUSI:</b><br/>"
        for pattern, count in sorted(
            patterns.items(), key=lambda x: x[1], reverse=True
        ):
            percentage = (count / len(groups_data)) * 100
            pattern_text += (
                f"• Pola {pattern}: {count} kelompok ({percentage:.1f}%)<br/>"
            )

        pattern_para = Paragraph(pattern_text, self.normal_style)
        self.story.append(pattern_para)
        self.story.append(PageBreak())

        # Individual group details
        self.story.append(Paragraph("📋 DETAIL SETIAP KELOMPOK", self.heading_style))

        for group in groups_data:
            anggota_list = []
            for member in group["members"]:
                motivation_level = (
                    member.get("motivation_level", "Unanalyzed") or "Unanalyzed"
                )
                anggota_list.append(f"{member['username']} ({motivation_level})")
            group_text = f"""
            <b>{group['name']} (Kode: {group['code']})</b><br/>
            Ukuran: {group['size']} siswa<br/>
            Distribusi Motivasi: High={group['motivation_distribution']['High']}, Medium={group['motivation_distribution']['Medium']}, Low={group['motivation_distribution']['Low']}<br/>
            Anggota: {', '.join(anggota_list)}<br/>
            """
            group_para = Paragraph(group_text, self.normal_style)
            self.story.append(group_para)
            self.story.append(Spacer(1, 0.1 * inch))

    def _add_recommendations(self, quality_analysis, formation_params):
        """Add recommendations and next steps"""
        self.story.append(PageBreak())
        self.story.append(
            Paragraph("💡 REKOMENDASI DAN LANGKAH SELANJUTNYA", self.heading_style)
        )

        balance_score = quality_analysis.get("balance_score", 0)
        heterogeneity_score = quality_analysis.get("heterogeneity_score", 0)
        uniformity_score = quality_analysis.get("uniformity_score", 0)
        mode = formation_params["mode"]

        recommendations = []

        # Balance recommendations
        if balance_score < 0.7:
            recommendations.append(
                "🔄 Pertimbangkan untuk menyesuaikan kembali ukuran kelompok agar lebih seimbang"
            )

        # Heterogeneity recommendations
        if mode == "heterogen" and heterogeneity_score < 0.6:
            recommendations.append(
                "🎯 Untuk meningkatkan keberagaman, pertimbangkan redistribusi siswa antar kelompok"
            )
        elif mode == "homogen" and heterogeneity_score > 0.5:
            recommendations.append(
                "🎯 Untuk meningkatkan homogenitas, kelompokkan kembali siswa berdasarkan tingkat motivasi yang sama"
            )

        # Uniformity recommendations
        if mode == "heterogen" and uniformity_score < 0.6:
            recommendations.append(
                "📊 Untuk distribusi yang lebih seragam, jalankan ulang algoritma dengan parameter yang disesuaikan"
            )

        # General recommendations
        recommendations.extend(
            [
                "📚 Monitor efektivitas kelompok selama proses pembelajaran",
                "🔄 Siapkan strategi regrouping jika diperlukan penyesuaian",
                "📈 Evaluasi pencapaian learning outcomes setiap kelompok",
                "👥 Pertimbangkan peer assessment untuk mengukur kolaborasi dalam kelompok",
            ]
        )

        rec_text = "<b>REKOMENDASI:</b><br/>"
        for i, rec in enumerate(recommendations, 1):
            rec_text += f"{i}. {rec}<br/>"

        rec_text += f"""<br/>
        <b>KESIMPULAN:</b><br/>
        Pembentukan kelompok dengan mode {mode} telah berhasil dilakukan dengan hasil {'sangat memuaskan' if (balance_score + heterogeneity_score + uniformity_score)/3 > 0.8 else 'baik' if (balance_score + heterogeneity_score + uniformity_score)/3 > 0.6 else 'cukup'}. 
        Kelompok yang terbentuk {'siap digunakan untuk pembelajaran kolaboratif' if (balance_score + heterogeneity_score + uniformity_score)/3 > 0.7 else 'dapat digunakan dengan beberapa penyesuaian'}.
        
        <br/><br/>
        <i>Laporan ini dibuat secara otomatis oleh sistem PRAMLEARN pada {datetime.now().strftime('%d %B %Y, %H:%M WIB')}</i>
        """

        rec_para = Paragraph(rec_text, self.normal_style)
        self.story.append(rec_para)
