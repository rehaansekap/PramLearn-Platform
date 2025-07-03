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
            # if formation_params["mode"] == "heterogen":
            #     self._add_deap_mathematical_explanation()

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
            dist = group["motivation_distribution"]
            for level, count in dist.items():
                if level in total_motivation:
                    total_motivation[level] += count

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
        self.story.append(Spacer(1, 0.3 * inch))

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
            group_text = f"""
            <b>{group['name']} (Kode: {group['code']})</b><br/>
            Ukuran: {group['size']} siswa<br/>
            Distribusi Motivasi: High={group['motivation_distribution']['High']}, Medium={group['motivation_distribution']['Medium']}, Low={group['motivation_distribution']['Low']}<br/>
            Anggota: {', '.join([member['username'] + f" ({member['motivation_level']})" for member in group['members']])}<br/>
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
