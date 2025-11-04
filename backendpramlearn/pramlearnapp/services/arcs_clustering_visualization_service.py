from io import BytesIO
from matplotlib.figure import Figure
from matplotlib.backends.backend_svg import FigureCanvasSVG
from pramlearnapp.models.user import StudentMotivationProfile
import numpy as np
import logging

logger = logging.getLogger(__name__)


class ARCSClusteringVisualizationService:
    """
    Service untuk membuat visualisasi scatter plot clustering ARCS dalam format SVG (vektor)
    """

    def generate_scatter_plot_svg(
        self,
        width_inches=7,
        height_inches=5,
        aggregate_duplicates=True,
        jitter_std=0.0,  # contoh: 0.02 untuk jitter kecil
    ):
        """
        Menghasilkan scatter plot clustering ARCS sebagai SVG bytes

        Returns:
            bytes: konten SVG siap diunduh
        """
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
        )

        fig = Figure(figsize=(width_inches, height_inches), dpi=100)
        ax = fig.add_subplot(111)

        if not profiles.exists():
            ax.text(
                0.5,
                0.5,
                "Tidak ada data clustering",
                ha="center",
                va="center",
                fontsize=12,
            )
            ax.axis("off")
            buf = BytesIO()
            FigureCanvasSVG(fig).print_svg(buf)
            return buf.getvalue()

        cluster_colors = {
            "High": "#33CC66",
            "Medium": "#CC9933",
            "Low": "#CC3333",
        }

        if aggregate_duplicates:
            # Gabungkan titik dengan koordinat sama (dibulatkan 2 desimal) dan besarkan ukurannya
            level_coord_counts = {"High": {}, "Medium": {}, "Low": {}}
            for p in profiles:
                x = float(p.attention + p.relevance) / 2.0
                y = float(p.confidence + p.satisfaction) / 2.0
                key = (round(x, 2), round(y, 2))
                level = p.motivation_level
                if level in level_coord_counts:
                    level_coord_counts[level][key] = (
                        level_coord_counts[level].get(key, 0) + 1
                    )

            # Plot aggregated points
            for level, coord_counts in level_coord_counts.items():
                if not coord_counts:
                    continue

                xs, ys, sizes, counts = [], [], [], []
                total_profiles = 0
                for (x, y), c in coord_counts.items():
                    xs.append(
                        x + (np.random.normal(0, jitter_std) if jitter_std > 0 else 0)
                    )
                    ys.append(
                        y + (np.random.normal(0, jitter_std) if jitter_std > 0 else 0)
                    )
                    counts.append(c)
                    total_profiles += c
                    base, scale = 28, 16
                    sizes.append(base + scale * np.log2(c + 1))

                ax.scatter(
                    xs,
                    ys,
                    s=sizes,
                    c=cluster_colors.get(level, "#888888"),
                    edgecolors="#222222",
                    linewidths=0.5,
                    label=f"{level} ({total_profiles})",
                    alpha=0.85,
                )

                # Tampilkan angka jumlah pada titik yang menumpuk
                for x, y, c in zip(xs, ys, counts):
                    if c > 1:
                        ax.text(
                            x,
                            y,
                            str(int(c)),
                            ha="center",
                            va="center",
                            fontsize=4,
                            color="#ffffff",
                            zorder=7,
                        )

            # Centroid berbobot (pakai jumlah duplikat)
            for level, coord_counts in level_coord_counts.items():
                if not coord_counts:
                    continue
                total = sum(coord_counts.values())
                cx = sum(x * c for (x, _), c in coord_counts.items()) / total
                cy = sum(y * c for (_, y), c in coord_counts.items()) / total
                ax.scatter(
                    [cx],
                    [cy],
                    s=160,
                    c=cluster_colors.get(level, "#000000"),
                    marker="o",
                    edgecolors="#000000",
                    linewidths=1.5,
                    alpha=1.0,
                    zorder=5,
                )
                ax.scatter(
                    [cx],
                    [cy],
                    s=60,
                    c="#FFFFFF",
                    marker="o",
                    edgecolors=cluster_colors.get(level, "#000000"),
                    linewidths=1.2,
                    zorder=6,
                )
        else:
            # Mode lama (tanpa agregasi)
            points = {"High": [], "Medium": [], "Low": []}
            for p in profiles:
                x = float(p.attention + p.relevance) / 2.0
                y = float(p.confidence + p.satisfaction) / 2.0
                points.get(p.motivation_level, []).append((x, y))

            for level, pts in points.items():
                if not pts:
                    continue
                xs, ys = zip(*pts)
                ax.scatter(
                    xs,
                    ys,
                    s=28,
                    c=cluster_colors.get(level, "#888888"),
                    edgecolors="#222222",
                    linewidths=0.4,
                    label=f"{level} ({len(pts)})",
                    alpha=0.9,
                )

            for level, pts in points.items():
                if not pts:
                    continue
                arr = np.array(pts)
                cx, cy = float(arr[:, 0].mean()), float(arr[:, 1].mean())
                ax.scatter(
                    [cx],
                    [cy],
                    s=160,
                    c=cluster_colors.get(level, "#000000"),
                    marker="o",
                    edgecolors="#000000",
                    linewidths=1.5,
                    alpha=1.0,
                    zorder=5,
                )
                ax.scatter(
                    [cx],
                    [cy],
                    s=60,
                    c="#FFFFFF",
                    marker="o",
                    edgecolors=cluster_colors.get(level, "#000000"),
                    linewidths=1.2,
                    zorder=6,
                )

        ax.set_xlim(1.0, 5.0)
        ax.set_ylim(1.0, 5.0)
        ax.set_xlabel("Attention + Relevance (Rata-rata)")
        ax.set_ylabel("Confidence + Satisfaction (Rata-rata)")
        ax.set_title("Visualisasi Clustering ARCS")
        ax.grid(True, linestyle="--", linewidth=0.5, alpha=0.5)
        ax.legend(loc="upper left", frameon=True)

        buf = BytesIO()
        FigureCanvasSVG(fig).print_svg(buf)
        svg_bytes = buf.getvalue()
        logger.info(
            "SVG scatter plot generated successfully, size=%d bytes", len(svg_bytes)
        )
        return svg_bytes
