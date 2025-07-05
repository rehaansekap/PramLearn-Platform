import os
import django
from django.apps import apps
import graphviz

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()


def get_field_info(field):
    """Function untuk menampilkan field info dengan keterangan relasi"""
    field_type = field.__class__.__name__
    field_name = field.name

    if field.primary_key:
        return f"🔑 {field_name}: {field_type}"
    elif field.related_model:
        return f"🔗 {field_name}: {field_type} → {field.related_model.__name__}"
    else:
        return f"   {field_name}: {field_type}"


def save_erd_formats(dot, filename):
    """Save ERD in both PNG and SVG formats"""
    # Save PNG
    dot.render(filename, format="png", cleanup=True)
    print(f"✅ {filename}.png")

    # Save SVG
    dot.render(filename, format="svg", cleanup=True)
    print(f"✅ {filename}.svg")


def generate_clustering_erd():
    """Generate ERD khusus untuk K-Means Clustering"""

    models = [
        "CustomUser",
        "StudentMotivationProfile",
        "ARCSQuestionnaire",
        "ARCSQuestion",
        "ARCSResponse",
        "ARCSAnswer",
    ]

    dot = graphviz.Digraph(comment="K-Means Clustering ERD")
    dot.attr(rankdir="TB", size="14,10", dpi="300")
    dot.attr("node", shape="record", fontname="Arial", fontsize="10")
    dot.attr("edge", fontname="Arial", fontsize="8")

    # Title
    dot.attr(
        label="K-Means Clustering Models\\nfor Student Motivation Profiling",
        labelloc="t",
        fontsize="16",
        fontname="Arial Bold",
    )

    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}

    # Add nodes
    for model_name in models:
        if model_name in model_dict:
            model = model_dict[model_name]

            fields = []
            for field in model._meta.fields:
                fields.append(get_field_info(field))

            table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"

            # Color coding
            if model_name == "CustomUser":
                fillcolor = "#e6f7ff"  # Light blue
            elif "ARCS" in model_name:
                fillcolor = "#f0f9ff"  # Very light blue
            else:
                fillcolor = "#f6ffed"  # Light green

            dot.node(model_name, label=table_label, fillcolor=fillcolor, style="filled")

    # Add relationships
    for model_name in models:
        if model_name in model_dict:
            model = model_dict[model_name]

            for field in model._meta.fields:
                if field.related_model and field.related_model.__name__ in models:
                    if field.__class__.__name__ == "OneToOneField":
                        edge_label = "1:1"
                        edge_style = "bold"
                        edge_color = "blue"
                    elif field.__class__.__name__ == "ForeignKey":
                        edge_label = "N:1"
                        edge_style = "solid"
                        edge_color = "black"
                    else:
                        edge_label = field.name
                        edge_style = "dashed"
                        edge_color = "gray"

                    dot.edge(
                        model_name,
                        field.related_model.__name__,
                        label=edge_label,
                        style=edge_style,
                        color=edge_color,
                        arrowhead="vee",
                    )

    # Add legend
    with dot.subgraph(name="cluster_legend") as legend:
        legend.attr(label="Legend", style="filled", fillcolor="#f0f0f0", fontsize="10")

        legend.node(
            "legend_content",
            label="{Legend|🔑 Primary Key\\l🔗 Foreign Key → Target Model\\l   Regular Field\\l|1:1 One-to-One\\lN:1 Many-to-One\\l}",
            shape="record",
            fillcolor="white",
            style="filled",
        )

    # Save ERD in both formats
    output_file = "01_clustering_kmeans_erd"
    save_erd_formats(dot, output_file)
    return dot


def generate_group_formation_erd():
    """Generate ERD lengkap untuk DEAP Genetic Algorithm Group Formation"""

    models = [
        "Material",
        "Group",
        "GroupMember",
        "CustomUser",
        "StudentMotivationProfile",
        "ARCSQuestionnaire",
        "ARCSResponse",
    ]

    dot = graphviz.Digraph(comment="DEAP Group Formation ERD")
    dot.attr(rankdir="TB", size="14,10", dpi="300")
    dot.attr("node", shape="record", fontname="Arial", fontsize="10")
    dot.attr("edge", fontname="Arial", fontsize="8")

    dot.attr(
        label="DEAP Genetic Algorithm\\nGroup Formation with Motivation Profiling",
        labelloc="t",
        fontsize="16",
        fontname="Arial Bold",
    )

    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}

    # Create subgraphs for better organization
    with dot.subgraph(name="cluster_group_core") as group_core:
        group_core.attr(
            label="Group Formation Core",
            style="filled",
            fillcolor="#f6ffed",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in ["Material", "Group", "GroupMember"]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"
                group_core.node(
                    model_name, label=table_label, fillcolor="#f6ffed", style="filled"
                )

    with dot.subgraph(name="cluster_motivation") as motivation:
        motivation.attr(
            label="Motivation Profiling for DEAP",
            style="filled",
            fillcolor="#e6f7ff",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in [
            "CustomUser",
            "StudentMotivationProfile",
            "ARCSQuestionnaire",
            "ARCSResponse",
        ]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"

                # Color coding
                if model_name == "CustomUser":
                    fillcolor = "#e6f7ff"
                elif "ARCS" in model_name:
                    fillcolor = "#f0f9ff"
                else:
                    fillcolor = "#f0f9ff"

                motivation.node(
                    model_name, label=table_label, fillcolor=fillcolor, style="filled"
                )

    # Add relationships
    for model_name in models:
        if model_name in model_dict:
            model = model_dict[model_name]

            for field in model._meta.fields:
                if field.related_model and field.related_model.__name__ in models:
                    if field.__class__.__name__ == "OneToOneField":
                        edge_label = "1:1"
                        edge_style = "bold"
                        edge_color = "blue"
                    elif field.__class__.__name__ == "ForeignKey":
                        edge_label = "N:1"
                        edge_style = "solid"
                        edge_color = "black"
                    else:
                        edge_label = field.name
                        edge_style = "dashed"
                        edge_color = "gray"

                    dot.edge(
                        model_name,
                        field.related_model.__name__,
                        label=edge_label,
                        style=edge_style,
                        color=edge_color,
                        arrowhead="vee",
                    )

    # Add DEAP annotation
    dot.node(
        "deap_annotation",
        label="{DEAP Algorithm Flow|\\l1. Material creates Groups\\l2. Students join GroupMembers\\l3. ARCS data feeds DEAP fitness\\l4. Genetic Algorithm optimizes\\l5. Balanced groups formed\\l}",
        shape="note",
        fillcolor="#fffacd",
        style="filled",
        fontsize="9",
    )

    # Add legend
    with dot.subgraph(name="cluster_legend") as legend:
        legend.attr(label="Legend", style="filled", fillcolor="#f0f0f0", fontsize="10")

        legend.node(
            "legend_content",
            label="{Legend|🔑 Primary Key\\l🔗 Foreign Key → Target Model\\l   Regular Field\\l|1:1 One-to-One\\lN:1 Many-to-One\\l}",
            shape="record",
            fillcolor="white",
            style="filled",
        )

    output_file = "02_group_formation_deap_erd"
    save_erd_formats(dot, output_file)
    return dot


def generate_realtime_collaboration_erd():
    """Generate ERD lengkap untuk Real-time Collaboration dengan Ranking System"""

    models = [
        # Core Quiz Models
        "Quiz",
        "Question",
        # Group Collaboration Models
        "Group",
        "GroupMember",
        "GroupQuiz",
        "GroupQuizSubmission",
        "GroupQuizResult",
        # Ranking & Performance Models
        "Grade",
        "GradeStatistics",
        # Supporting Models
        "Material",
        "CustomUser",
    ]

    dot = graphviz.Digraph(comment="Real-time Collaboration with Ranking ERD")
    dot.attr(rankdir="TB", size="18,14", dpi="300")
    dot.attr("node", shape="record", fontname="Arial", fontsize="9")
    dot.attr("edge", fontname="Arial", fontsize="7")

    dot.attr(
        label="Real-time Collaboration Models\\nWebSocket Group Quiz with Live Ranking System",
        labelloc="t",
        fontsize="16",
        fontname="Arial Bold",
    )

    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}

    # Create subgraphs for better organization
    with dot.subgraph(name="cluster_quiz_core") as quiz_core:
        quiz_core.attr(
            label="Quiz Core System",
            style="filled",
            fillcolor="#f0f9ff",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in ["Quiz", "Question", "Material"]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"
                quiz_core.node(
                    model_name, label=table_label, fillcolor="#f0f9ff", style="filled"
                )

    with dot.subgraph(name="cluster_group_collaboration") as group_collab:
        group_collab.attr(
            label="Group Collaboration System",
            style="filled",
            fillcolor="#fff7e6",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in [
            "Group",
            "GroupMember",
            "GroupQuiz",
            "GroupQuizSubmission",
            "GroupQuizResult",
        ]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"

                # Color coding within group
                if "GroupQuiz" in model_name:
                    fillcolor = "#fff7e6"  # Light orange
                elif model_name == "Group":
                    fillcolor = "#f6ffed"  # Light green
                else:
                    fillcolor = "#fff7e6"

                group_collab.node(
                    model_name, label=table_label, fillcolor=fillcolor, style="filled"
                )

    with dot.subgraph(name="cluster_ranking_system") as ranking:
        ranking.attr(
            label="Real-time Ranking System",
            style="filled",
            fillcolor="#f9f0ff",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in ["Grade", "GradeStatistics"]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"
                ranking.node(
                    model_name, label=table_label, fillcolor="#f9f0ff", style="filled"
                )

    # Add CustomUser outside clusters
    if "CustomUser" in model_dict:
        model = model_dict["CustomUser"]
        fields = []
        for field in model._meta.fields:
            fields.append(get_field_info(field))

        table_label = f"{{'CustomUser'|{'\\l'.join(fields)}\\l}}"
        dot.node("CustomUser", label=table_label, fillcolor="#e6f7ff", style="filled")

    # Add relationships
    for model_name in models:
        if model_name in model_dict:
            model = model_dict[model_name]

            for field in model._meta.fields:
                if field.related_model and field.related_model.__name__ in models:
                    if field.__class__.__name__ == "OneToOneField":
                        edge_label = "1:1"
                        edge_style = "bold"
                        edge_color = "blue"
                    elif field.__class__.__name__ == "ForeignKey":
                        edge_label = "N:1"
                        edge_style = "solid"
                        edge_color = "black"
                    else:
                        edge_label = field.name
                        edge_style = "dashed"
                        edge_color = "gray"

                    dot.edge(
                        model_name,
                        field.related_model.__name__,
                        label=edge_label,
                        style=edge_style,
                        color=edge_color,
                        arrowhead="vee",
                    )

    # Add WebSocket flow annotation
    dot.node(
        "websocket_flow",
        label="{Real-time WebSocket Flow|\\l1. Students join GroupQuiz\\l2. Submit answers via GroupQuizSubmission\\l3. Results stored in GroupQuizResult\\l4. Grades calculated automatically\\l5. Live ranking broadcast to all participants\\l6. GradeStatistics updated in real-time\\l}",
        shape="note",
        fillcolor="#fffacd",
        style="filled",
        fontsize="8",
    )

    # Add ranking calculation note
    dot.node(
        "ranking_calculation",
        label="{Ranking Calculation|\\l• Score: (correct_answers / total_questions) × 100\\l• Time Factor: completion_time consideration\\l• Status: not_started | in_progress | completed\\l• Live Updates: via QuizRankingConsumer\\l• Group Performance: aggregated team scores\\l}",
        shape="note",
        fillcolor="#e6ffe6",
        style="filled",
        fontsize="7",
    )

    # Add legend
    with dot.subgraph(name="cluster_legend") as legend:
        legend.attr(label="Legend", style="filled", fillcolor="#f0f0f0", fontsize="10")

        legend.node(
            "legend_content",
            label="{Legend|🔑 Primary Key\\l🔗 Foreign Key → Target Model\\l   Regular Field\\l|1:1 One-to-One\\lN:1 Many-to-One\\l}",
            shape="record",
            fillcolor="white",
            style="filled",
        )

    output_file = "03_realtime_collaboration_with_ranking_erd"
    save_erd_formats(dot, output_file)
    return dot


def generate_progress_tracking_erd():
    """Generate ERD khusus untuk Progress Tracking"""

    models = [
        "StudentMaterialProgress",
        "StudentMaterialActivity",
        "StudentActivity",
        "Grade",
        "GradeStatistics",
        "Material",
        "Achievement",
        "CustomUser",
        "Quiz",
        "Assignment",
    ]

    dot = graphviz.Digraph(comment="Progress Tracking ERD")
    dot.attr(rankdir="TB", size="16,12", dpi="300")
    dot.attr("node", shape="record", fontname="Arial", fontsize="10")
    dot.attr("edge", fontname="Arial", fontsize="8")

    dot.attr(
        label="Progress Tracking Models\\nStudent Performance Monitoring & Progress Percentage",
        labelloc="t",
        fontsize="16",
        fontname="Arial Bold",
    )

    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}

    # Create subgraphs for better organization
    with dot.subgraph(name="cluster_progress_core") as progress_core:
        progress_core.attr(
            label="Progress Tracking Core",
            style="filled",
            fillcolor="#f9f0ff",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in [
            "StudentMaterialProgress",
            "StudentMaterialActivity",
            "StudentActivity",
        ]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"
                progress_core.node(
                    model_name, label=table_label, fillcolor="#f9f0ff", style="filled"
                )

    with dot.subgraph(name="cluster_grading_system") as grading:
        grading.attr(
            label="Grading & Achievement System",
            style="filled",
            fillcolor="#fff2e8",
            fontsize="12",
            fontname="Arial Bold",
        )

        for model_name in ["Grade", "GradeStatistics", "Achievement"]:
            if model_name in model_dict:
                model = model_dict[model_name]
                fields = []
                for field in model._meta.fields:
                    fields.append(get_field_info(field))

                table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"
                grading.node(
                    model_name, label=table_label, fillcolor="#fff2e8", style="filled"
                )

    # Add remaining nodes
    for model_name in ["Material", "Quiz", "Assignment", "CustomUser"]:
        if model_name in model_dict:
            model = model_dict[model_name]
            fields = []
            for field in model._meta.fields:
                fields.append(get_field_info(field))

            table_label = f"{{{model_name}|{'\\l'.join(fields)}\\l}}"

            # Color coding
            if model_name == "Material":
                fillcolor = "#fff7e6"  # Light orange
            else:
                fillcolor = "#e6f7ff"  # Light blue

            dot.node(model_name, label=table_label, fillcolor=fillcolor, style="filled")

    # Add relationships
    for model_name in models:
        if model_name in model_dict:
            model = model_dict[model_name]

            for field in model._meta.fields:
                if field.related_model and field.related_model.__name__ in models:
                    if field.__class__.__name__ == "OneToOneField":
                        edge_label = "1:1"
                        edge_style = "bold"
                        edge_color = "blue"
                    elif field.__class__.__name__ == "ForeignKey":
                        edge_label = "N:1"
                        edge_style = "solid"
                        edge_color = "black"
                    else:
                        edge_label = field.name
                        edge_style = "dashed"
                        edge_color = "gray"

                    dot.edge(
                        model_name,
                        field.related_model.__name__,
                        label=edge_label,
                        style=edge_style,
                        color=edge_color,
                        arrowhead="vee",
                    )

    # Add progress calculation note
    dot.node(
        "progress_calculation",
        label="{Progress Percentage Calculation| \\l•Material Progress: (completed_sections / total_sections) × 100\\l• Activity Tracking: time_spent, interactions_count\\l• Grade Integration: quiz_scores + assignment_scores\\l• Achievement Unlocking: based on progress milestones\\l• Real-time Updates: via progress tracking API\\l}",
        shape="note",
        fillcolor="#e6ffe6",
        style="filled",
        fontsize="8",
    )

    # Add legend
    with dot.subgraph(name="cluster_legend") as legend:
        legend.attr(label="Legend", style="filled", fillcolor="#f0f0f0", fontsize="10")

        legend.node(
            "legend_content",
            label="{Legend|🔑 Primary Key\\l🔗 Foreign Key → Target Model\\l   Regular Field\\l|1:1 One-to-One\\lN:1 Many-to-One\\l}",
            shape="record",
            fillcolor="white",
            style="filled",
        )

    output_file = "04_progress_tracking_erd"
    save_erd_formats(dot, output_file)
    return dot


def generate_all_separated_erds():
    """Generate semua ERD terpisah dalam format PNG dan SVG"""
    print("🚀 Generating separated ERDs for PramLearn features...\n")

    print("📊 K-Means Clustering ERD:")
    generate_clustering_erd()
    print()

    print("🔧 DEAP Group Formation ERD:")
    generate_group_formation_erd()
    print()

    print("⚡ Real-time Collaboration ERD:")
    generate_realtime_collaboration_erd()
    print()

    print("📈 Progress Tracking ERD:")
    generate_progress_tracking_erd()
    print()

    print(f"✅ All ERDs generated successfully!")
    print("📁 Files created:")
    print("   PNG Files:")
    print("   - 01_clustering_kmeans_erd.png")
    print("   - 02_group_formation_deap_erd.png")
    print("   - 03_realtime_collaboration_with_ranking_erd.png")
    print("   - 04_progress_tracking_erd.png")
    print()
    print("   SVG Files:")
    print("   - 01_clustering_kmeans_erd.svg")
    print("   - 02_group_formation_deap_erd.svg")
    print("   - 03_realtime_collaboration_with_ranking_erd.svg")
    print("   - 04_progress_tracking_erd.svg")


if __name__ == "__main__":
    generate_all_separated_erds()
