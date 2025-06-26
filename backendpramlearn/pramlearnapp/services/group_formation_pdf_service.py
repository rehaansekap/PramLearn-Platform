from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
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


class GroupFormationPDFService:
    def __init__(self):
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=A4)
        self.styles = getSampleStyleSheet()
        self.story = []

        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )

        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        )

        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        )

    def generate_group_formation_report(self, material_data, groups_data, quality_analysis, formation_params):
        """Generate comprehensive group formation analysis PDF"""

        # 1. Cover Page
        self._add_cover_page(material_data, formation_params)

        # 2. Executive Summary
        self._add_executive_summary(
            groups_data, quality_analysis, formation_params)

        # 3. Formation Process Analysis
        self._add_formation_process_analysis(
            formation_params, quality_analysis)

        # 4. Quality Metrics Analysis
        self._add_quality_metrics_analysis(quality_analysis)

        # 5. Groups Overview
        self._add_groups_overview(groups_data, quality_analysis)

        # 6. Detailed Group Analysis
        self._add_detailed_group_analysis(groups_data, quality_analysis)

        # 7. Recommendations
        self._add_recommendations(quality_analysis, formation_params)

        # Build PDF
        self.doc.build(self.story)
        pdf = self.buffer.getvalue()
        self.buffer.close()
        return pdf

    def _add_cover_page(self, material_data, formation_params):
        """Add cover page"""
        self.story.append(Spacer(1, 2*inch))

        # Title
        title = Paragraph(
            "📊 LAPORAN ANALISIS<br/>PEMBENTUKAN KELOMPOK OTOMATIS", self.title_style)
        self.story.append(title)
        self.story.append(Spacer(1, 0.5*inch))

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
        self.story.append(
            Paragraph("📋 RINGKASAN EKSEKUTIF", self.heading_style))

        # Key metrics summary
        mode = formation_params['mode']
        total_students = sum(group['size'] for group in groups_data)
        total_groups = len(groups_data)
        avg_group_size = total_students / total_groups if total_groups > 0 else 0

        balance_score = quality_analysis.get('balance_score', 0) * 100
        heterogeneity_score = quality_analysis.get(
            'heterogeneity_score', 0) * 100
        uniformity_score = quality_analysis.get('uniformity_score', 0) * 100

        # Quality assessment
        overall_quality = (
            balance_score + heterogeneity_score + uniformity_score) / 3

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
        self.story.append(Spacer(1, 0.3*inch))

    def _add_formation_process_analysis(self, formation_params, quality_analysis):
        """Add formation process analysis"""
        self.story.append(
            Paragraph("⚙️ ANALISIS PROSES PEMBENTUKAN", self.heading_style))

        mode = formation_params['mode']
        algorithm_used = "DEAP Genetic Algorithm" if mode == 'heterogen' else "Motivation-based Clustering"

        process_text = f"""
        <b>1. ALGORITMA YANG DIGUNAKAN</b><br/>
        Algoritma: {algorithm_used}<br/>
        Tujuan: {'Memaksimalkan keberagaman dan keseragaman distribusi' if mode == 'heterogen' else 'Mengelompokkan siswa dengan tingkat motivasi serupa'}<br/><br/>
        
        <b>2. PARAMETER OPTIMASI</b><br/>"""

        if mode == 'heterogen':
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
        self.story.append(Spacer(1, 0.3*inch))

    def _add_quality_metrics_analysis(self, quality_analysis):
        """Add detailed quality metrics analysis"""
        self.story.append(
            Paragraph("📈 ANALISIS METRIK KUALITAS", self.heading_style))

        balance_score = quality_analysis.get('balance_score', 0)
        heterogeneity_score = quality_analysis.get('heterogeneity_score', 0)
        uniformity_score = quality_analysis.get('uniformity_score', 0)

        interpretation = quality_analysis.get('interpretation', {})

        # Create metrics table
        metrics_data = [
            ['Metrik', 'Skor', 'Interpretasi', 'Deskripsi'],
            [
                'Balance Score',
                f'{balance_score:.3f}',
                interpretation.get('balance', 'N/A'),
                'Mengukur keseimbangan ukuran antar kelompok'
            ],
            [
                'Heterogeneity Score',
                f'{heterogeneity_score:.3f}',
                interpretation.get('heterogeneity', 'N/A'),
                'Mengukur keberagaman tingkat motivasi dalam kelompok'
            ],
            [
                'Uniformity Score',
                f'{uniformity_score:.3f}',
                interpretation.get('uniformity', 'N/A'),
                'Mengukur keseragaman pola distribusi antar kelompok'
            ]
        ]

        metrics_table = Table(metrics_data, colWidths=[
                              2*inch, 1*inch, 1.5*inch, 2.5*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1),
             [colors.white, colors.lightgrey])
        ]))

        self.story.append(metrics_table)
        self.story.append(Spacer(1, 0.2*inch))

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
        sizes = [group['size'] for group in groups_data]
        size_distribution = {}
        for size in sizes:
            size_distribution[size] = size_distribution.get(size, 0) + 1

        # Motivation distribution across all groups
        total_motivation = {'High': 0, 'Medium': 0, 'Low': 0}
        for group in groups_data:
            dist = group['motivation_distribution']
            for level, count in dist.items():
                if level in total_motivation:
                    total_motivation[level] += count

        # Create overview table
        overview_data = [
            ['Aspek', 'Detail'],
            ['Total Kelompok', f"{len(groups_data)} kelompok"],
            ['Total Siswa', f"{sum(sizes)} siswa"],
            ['Ukuran Kelompok',
                f"Min: {min(sizes)}, Max: {max(sizes)}, Rata-rata: {sum(sizes)/len(sizes):.1f}"],
            ['Distribusi Ukuran', ', '.join(
                [f"{size} siswa: {count} kelompok" for size, count in sorted(size_distribution.items())])],
            ['Distribusi Motivasi',
                f"High: {total_motivation['High']}, Medium: {total_motivation['Medium']}, Low: {total_motivation['Low']}"]
        ]

        overview_table = Table(overview_data, colWidths=[2*inch, 4*inch])
        overview_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))

        self.story.append(overview_table)
        self.story.append(Spacer(1, 0.3*inch))

    def _add_detailed_group_analysis(self, groups_data, quality_analysis):
        """Add detailed analysis for each group"""
        self.story.append(
            Paragraph("🔍 ANALISIS DETAIL KELOMPOK", self.heading_style))

        # Groups summary table
        groups_summary_data = [
            ['Kelompok', 'Ukuran', 'High', 'Medium', 'Low',
                'Heterogeneity Index', 'Pola Distribusi']
        ]

        group_details = quality_analysis.get('group_details', [])

        for i, group in enumerate(groups_data):
            detail = group_details[i] if i < len(group_details) else {}
            dist = group['motivation_distribution']
            pattern = f"{dist['High']}H:{dist['Medium']}M:{dist['Low']}L"
            heterogeneity = detail.get('heterogeneity_index', 0)

            groups_summary_data.append([
                group['name'],
                str(group['size']),
                str(dist['High']),
                str(dist['Medium']),
                str(dist['Low']),
                f"{heterogeneity:.3f}",
                pattern
            ])

        groups_summary_table = Table(groups_summary_data, colWidths=[
                                     1*inch, 0.7*inch, 0.6*inch, 0.8*inch, 0.6*inch, 1*inch, 1.3*inch])
        groups_summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1),
             [colors.white, colors.lightgrey])
        ]))

        self.story.append(groups_summary_table)
        self.story.append(Spacer(1, 0.3*inch))

        # Pattern analysis
        patterns = {}
        for group in groups_data:
            dist = group['motivation_distribution']
            pattern = f"{dist['High']}H:{dist['Medium']}M:{dist['Low']}L"
            patterns[pattern] = patterns.get(pattern, 0) + 1

        pattern_text = "<b>ANALISIS POLA DISTRIBUSI:</b><br/>"
        for pattern, count in sorted(patterns.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(groups_data)) * 100
            pattern_text += f"• Pola {pattern}: {count} kelompok ({percentage:.1f}%)<br/>"

        pattern_para = Paragraph(pattern_text, self.normal_style)
        self.story.append(pattern_para)
        self.story.append(PageBreak())

        # Individual group details
        self.story.append(
            Paragraph("📋 DETAIL SETIAP KELOMPOK", self.heading_style))

        for group in groups_data:
            group_text = f"""
            <b>{group['name']} (Kode: {group['code']})</b><br/>
            Ukuran: {group['size']} siswa<br/>
            Distribusi Motivasi: High={group['motivation_distribution']['High']}, Medium={group['motivation_distribution']['Medium']}, Low={group['motivation_distribution']['Low']}<br/>
            Anggota: {', '.join([member['username'] + f" ({member['motivation_level']})" for member in group['members']])}<br/>
            """

            group_para = Paragraph(group_text, self.normal_style)
            self.story.append(group_para)
            self.story.append(Spacer(1, 0.1*inch))

    def _add_recommendations(self, quality_analysis, formation_params):
        """Add recommendations and next steps"""
        self.story.append(PageBreak())
        self.story.append(
            Paragraph("💡 REKOMENDASI DAN LANGKAH SELANJUTNYA", self.heading_style))

        balance_score = quality_analysis.get('balance_score', 0)
        heterogeneity_score = quality_analysis.get('heterogeneity_score', 0)
        uniformity_score = quality_analysis.get('uniformity_score', 0)
        mode = formation_params['mode']

        recommendations = []

        # Balance recommendations
        if balance_score < 0.7:
            recommendations.append(
                "🔄 Pertimbangkan untuk menyesuaikan kembali ukuran kelompok agar lebih seimbang")

        # Heterogeneity recommendations
        if mode == 'heterogen' and heterogeneity_score < 0.6:
            recommendations.append(
                "🎯 Untuk meningkatkan keberagaman, pertimbangkan redistribusi siswa antar kelompok")
        elif mode == 'homogen' and heterogeneity_score > 0.5:
            recommendations.append(
                "🎯 Untuk meningkatkan homogenitas, kelompokkan kembali siswa berdasarkan tingkat motivasi yang sama")

        # Uniformity recommendations
        if mode == 'heterogen' and uniformity_score < 0.6:
            recommendations.append(
                "📊 Untuk distribusi yang lebih seragam, jalankan ulang algoritma dengan parameter yang disesuaikan")

        # General recommendations
        recommendations.extend([
            "📚 Monitor efektivitas kelompok selama proses pembelajaran",
            "🔄 Siapkan strategi regrouping jika diperlukan penyesuaian",
            "📈 Evaluasi pencapaian learning outcomes setiap kelompok",
            "👥 Pertimbangkan peer assessment untuk mengukur kolaborasi dalam kelompok"
        ])

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
