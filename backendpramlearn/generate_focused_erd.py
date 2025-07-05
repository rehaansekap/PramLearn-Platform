import os
import django
from django.apps import apps
import graphviz

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()


def generate_drawio_compatible_erd():
    """Generate ERD yang kompatibel dengan Draw.io untuk editing"""

    # Model-model yang relevan
    relevant_models = {
        "clustering": [
            "CustomUser",
            "StudentMotivationProfile", 
            "ARCSQuestionnaire",
            "ARCSQuestion",
            "ARCSResponse",
            "ARCSAnswer",
        ],
        "group_formation": [
            "Material",
            "Group", 
            "GroupMember",
        ],
        "realtime_collaboration": [
            "Quiz",
            "Question",
            "GroupQuiz",
            "GroupQuizSubmission",
            "GroupQuizResult",
        ],
        "progress_tracking": [
            "StudentMaterialProgress",
            "StudentMaterialActivity",
            "StudentActivity",
            "Achievement",
            "Assignment",
            "Grade",
            "GradeStatistics",
        ],
    }

    # Buat Graphviz dengan pengaturan Draw.io friendly
    dot = graphviz.Digraph(comment="PramLearn ERD - Draw.io Compatible")
    
    # Pengaturan yang lebih sederhana dan kompatibel
    dot.attr(rankdir="TB", size="16,12", dpi="72")  # DPI rendah untuk compatibility
    dot.attr("node", 
             shape="box",           # Bentuk kotak sederhana
             style="filled,rounded", # Style yang didukung Draw.io
             fontname="Arial",      # Font standar
             fontsize="10")
    dot.attr("edge", 
             fontname="Arial", 
             fontsize="9",
             arrowhead="normal")    # Arrow head sederhana

    # Get all models
    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}

    # Function untuk field info yang lebih sederhana
    def get_simple_field_info(field):
        field_name = field.name
        if field.primary_key:
            return f"[PK] {field_name}"
        elif field.related_model:
            return f"[FK] {field_name} -> {field.related_model.__name__}"
        else:
            return f"{field_name}"

    # Track all unique models
    all_unique_models = set()
    for model_names in relevant_models.values():
        all_unique_models.update(model_names)

    # Add nodes dengan format sederhana
    for model_name in all_unique_models:
        if model_name in model_dict:
            model = model_dict[model_name]

            # Get fields dengan format sederhana
            fields = []
            for field in model._meta.fields[:8]:  # Batasi field untuk readability
                fields.append(get_simple_field_info(field))
            
            if len(model._meta.fields) > 8:
                fields.append("... (more fields)")

            # Create simple label tanpa table formatting
            field_text = "\\n".join(fields)
            simple_label = f"{model_name}\\n\\n{field_text}"

            # Tentukan warna berdasarkan kategori
            fillcolor = "lightblue"
            for category, models in relevant_models.items():
                if model_name in models:
                    if category == "clustering":
                        fillcolor = "lightcyan"
                    elif category == "group_formation": 
                        fillcolor = "lightgreen"
                    elif category == "realtime_collaboration":
                        fillcolor = "lightyellow"
                    elif category == "progress_tracking":
                        fillcolor = "lavender"
                    break

            dot.node(model_name, 
                    label=simple_label,
                    fillcolor=fillcolor)

    # Add relationships dengan format sederhana
    def add_simple_relationships():
        processed_edges = set()
        
        for model_name in all_unique_models:
            if model_name in model_dict:
                model = model_dict[model_name]

                for field in model._meta.fields:
                    if (field.related_model and 
                        field.related_model.__name__ in all_unique_models):
                        
                        target_model = field.related_model.__name__
                        edge_key = (model_name, target_model, field.name)
                        
                        if edge_key not in processed_edges:
                            processed_edges.add(edge_key)
                            
                            # Tentukan tipe relasi
                            if field.__class__.__name__ == "OneToOneField":
                                edge_label = "1:1"
                                edge_color = "blue"
                            elif field.__class__.__name__ == "ForeignKey":
                                edge_label = "N:1"
                                edge_color = "black"
                            else:
                                edge_label = "M:N"
                                edge_color = "gray"

                            dot.edge(model_name, target_model,
                                   label=edge_label,
                                   color=edge_color)

    # Add relationships
    add_simple_relationships()

    # Save dalam format yang lebih kompatibel
    output_file = "pramlearn_drawio_compatible"
    
    # Generate dengan pengaturan khusus untuk Draw.io
    dot.attr(bgcolor="white")  # Background putih
    
    # Render SVG
    dot.render(output_file, format="svg", cleanup=True)
    print(f"✅ Draw.io compatible SVG generated: {output_file}.svg")
    
    # Generate PNG backup
    dot.render(output_file + "_png", format="png", cleanup=True)
    print(f"✅ PNG backup generated: {output_file}_png.png")

    return dot


def generate_mermaid_format():
    """Generate dalam format Mermaid yang bisa dicopy-paste ke Draw.io"""
    
    print("\n📋 Mermaid Format for Draw.io:")
    print("=" * 50)
    print("```mermaid")
    print("erDiagram")
    
    # Get models
    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}
    
    relevant_models = [
        "CustomUser", "StudentMotivationProfile", "ARCSQuestionnaire", 
        "Material", "Group", "GroupMember", "Quiz", "Question",
        "Grade", "Achievement"
    ]
    
    # Add entities
    for model_name in relevant_models:
        if model_name in model_dict:
            model = model_dict[model_name]
            print(f"    {model_name} {{")
            
            for field in model._meta.fields[:5]:  # Batasi field
                field_type = "string"
                if "Integer" in field.__class__.__name__:
                    field_type = "int"
                elif "Float" in field.__class__.__name__:
                    field_type = "float"
                elif "Boolean" in field.__class__.__name__:
                    field_type = "boolean"
                    
                if field.primary_key:
                    print(f"        {field_type} {field.name} PK")
                elif field.related_model:
                    print(f"        {field_type} {field.name} FK")
                else:
                    print(f"        {field_type} {field.name}")
            print("    }")
    
    # Add relationships
    for model_name in relevant_models:
        if model_name in model_dict:
            model = model_dict[model_name]
            for field in model._meta.fields:
                if (field.related_model and 
                    field.related_model.__name__ in relevant_models):
                    target = field.related_model.__name__
                    if field.__class__.__name__ == "OneToOneField":
                        print(f"    {model_name} ||--|| {target} : has")
                    else:
                        print(f"    {model_name} }}|--|| {target} : belongs_to")
    
    print("```")
    print("\n📝 Copy code above and paste in Draw.io as Mermaid diagram")


def generate_dbdiagram_format():
    """Generate format untuk dbdiagram.io"""
    
    print("\n� dbdiagram.io Format:")
    print("=" * 50)
    
    all_models = apps.get_app_config("pramlearnapp").get_models()
    model_dict = {model.__name__: model for model in all_models}
    
    relevant_models = [
        "CustomUser", "StudentMotivationProfile", "ARCSQuestionnaire",
        "Material", "Group", "GroupMember", "Quiz", "Question", "Grade"
    ]
    
    # Generate tables
    for model_name in relevant_models:
        if model_name in model_dict:
            model = model_dict[model_name]
            print(f"\nTable {model_name} {{")
            
            for field in model._meta.fields[:8]:
                field_type = "varchar"
                if "Integer" in field.__class__.__name__:
                    field_type = "int"
                elif "Float" in field.__class__.__name__:
                    field_type = "float"
                elif "Boolean" in field.__class__.__name__:
                    field_type = "boolean"
                elif "DateTime" in field.__class__.__name__:
                    field_type = "timestamp"
                
                # Field attributes
                attrs = []
                if field.primary_key:
                    attrs.append("pk")
                if not field.null:
                    attrs.append("not null")
                
                attr_str = f" [{', '.join(attrs)}]" if attrs else ""
                print(f"  {field.name} {field_type}{attr_str}")
            
            print("}")
    
    # Generate relationships
    print("\n// Relationships:")
    for model_name in relevant_models:
        if model_name in model_dict:
            model = model_dict[model_name]
            for field in model._meta.fields:
                if (field.related_model and 
                    field.related_model.__name__ in relevant_models):
                    target = field.related_model.__name__
                    if field.__class__.__name__ == "OneToOneField":
                        print(f"Ref: {model_name}.{field.name} - {target}.id")
                    else:
                        print(f"Ref: {model_name}.{field.name} > {target}.id")
    
    print(f"\n📝 Copy code above and paste in https://dbdiagram.io/")


if __name__ == "__main__":
    print("🚀 Generating Draw.io Compatible ERD...")
    
    # Generate Draw.io compatible SVG
    generate_drawio_compatible_erd()
    
    # Generate alternative formats
    generate_mermaid_format()
    generate_dbdiagram_format()
    
    print(f"\n✅ Generated multiple formats:")
    print(f"1. SVG file for Draw.io import")
    print(f"2. Mermaid format for Draw.io")
    print(f"3. dbdiagram.io format")