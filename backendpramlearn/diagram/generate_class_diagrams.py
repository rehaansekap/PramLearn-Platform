import os
import sys
import django
from datetime import datetime

# Tambahkan direktori induk ke system path untuk mengimpor pengaturan Django
# Pastikan skrip ini berada di dalam subdirektori dari proyek Django Anda
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    sys.path.insert(0, parent_dir)

    # Pengaturan Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
    django.setup()
    print("✅ Pengaturan Django berhasil dimuat.")
except ImportError as e:
    print(f"⚠️ Peringatan: Tidak dapat memuat pengaturan Django. {e}")
    print("   Diagram akan tetap dibuat, tetapi mungkin tidak mencerminkan model Django secara akurat.")
    print("   Pastikan skrip ini dijalankan dalam konteks proyek Django yang benar.")


def generate_arcs_clustering_system_class_diagram():
    """Menghasilkan diagram kelas untuk ARCS Clustering System"""
    return """
classDiagram
    %% ARCS Clustering System - Models & Services
    
    class CustomUser {
        +int id
        +string username
        +Role role
        +boolean is_active
        +boolean is_online
        +datetime last_activity
        +__str__() string
    }
    
    class StudentMotivationProfile {
        +int id
        +CustomUser student
        +float attention
        +float relevance
        +float confidence
        +float satisfaction
        +string motivation_level
        +__str__() string
    }
    
    class ARCSQuestionnaire {
        +int id
        +Material material
        +string title
        +string description
        +string questionnaire_type
        +boolean is_active
        +datetime start_date
        +datetime end_date
        +int duration_minutes
        +CustomUser created_by
        +string slug
        +is_available_for_submission() tuple
        +time_remaining() int
        +save() void
        +__str__() string
    }
    
    class ARCSQuestion {
        +int id
        +ARCSQuestionnaire questionnaire
        +string text
        +string dimension
        +string question_type
        +int order
        +boolean is_required
        +string choice_a
        +string choice_b
        +string choice_c
        +string choice_d
        +string choice_e
        +int scale_min
        +int scale_max
        +string scale_label_min
        +string scale_label_max
        +choices() list
        +scale_labels() dict
        +__str__() string
    }
    
    class ARCSResponse {
        +int id
        +ARCSQuestionnaire questionnaire
        +CustomUser student
        +datetime submitted_at
        +datetime completed_at
        +boolean is_completed
        +__str__() string
    }
    
    class ARCSAnswer {
        +int id
        +ARCSResponse response
        +ARCSQuestion question
        +int likert_value
        +string choice_value
        +string text_value
        +datetime answered_at
        +__str__() string
    }
    
    class ARCSProcessor {
        +int n_clusters
        +StandardScaler scaler
        +__init__(n_clusters) void
        +update_all_motivation_levels() dict
        +get_cluster_statistics() dict
    }
    
    class Material {
        +int id
        +string title
        +Subject subject
        +string slug
        +datetime created_at
        +datetime updated_at
        +save() void
        +__str__() string
    }
    
    %% Relationships
    CustomUser -- StudentMotivationProfile : "has a"
    CustomUser "1" -- "many" ARCSQuestionnaire : "creates"
    CustomUser "1" -- "many" ARCSResponse : "submits"
    
    Material "1" -- "many" ARCSQuestionnaire : "is used in"
    ARCSQuestionnaire "1" -- "many" ARCSQuestion : "contains"
    ARCSQuestionnaire "1" -- "many" ARCSResponse : "receives"
    
    ARCSResponse "1" -- "many" ARCSAnswer : "contains"
    ARCSQuestion "1" -- "many" ARCSAnswer : "is answered in"
    
    ARCSProcessor ..> StudentMotivationProfile : "processes & updates"
    ARCSProcessor ..> CustomUser : "analyzes"
    
    %% Notes
    note for StudentMotivationProfile "Menyimpan hasil analisis ARCS\\ndan level motivasi (Tinggi/Sedang/Rendah)"
    note for ARCSProcessor "Menggunakan K-Means clustering untuk menganalisis\\nmotivasi siswa berdasarkan dimensi ARCS"
    note for ARCSQuestionnaire "Asesmen Pre/Post dengan batasan waktu\\ndan kontrol ketersediaan"
"""

def generate_genetic_algorithm_group_formation_class_diagram():
    """Menghasilkan diagram kelas untuk Genetic Algorithm Group Formation System"""
    return """
classDiagram
    %% Genetic Algorithm Group Formation System
    
    class Group {
        +int id
        +Material material
        +string name
        +string code
        +__str__() string
    }
    
    class GroupMember {
        +int id
        +Group group
        +CustomUser student
    }
    
    class GroupFormationAlgorithms {
        +create_homogeneous_groups(student_data, n_clusters) list
        +create_heterogeneous_groups_deap(student_data, n_clusters, priority_mode) list
        +create_heterogeneous_groups_improved(student_data, n_clusters, priority_mode) list
        +distribute_by_size_first(motivation_groups, n_groups, target_sizes) list
    }
    
    class TeacherSessionAutoGroupFormationView {
        +GroupFormationAlgorithms algorithms
        +GroupService group_service
        +AdaptiveGroupFormationService adaptive_service
        +get(request, material_slug) Response
        +post(request, material_slug) Response
        +create_groups(request, material_slug) Response
        +handle_pdf_export(request, material_slug) Response
        +get_class_analysis(request, material_slug) Response
    }
    
    class StudentMotivationProfile {
        +CustomUser student
        +float attention
        +float relevance
        +float confidence
        +float satisfaction
        +string motivation_level
    }
    
    class CustomUser {
        +string username
        +Role role
        +boolean is_active
    }
    
    class Material {
        +string title
        +string slug
        +Subject subject
    }
    
    class GroupQuiz {
        +int id
        +Group group
        +Quiz quiz
        +datetime start_time
        +datetime end_time
        +boolean is_completed
        +datetime submitted_at
        +calculate_and_save_score() GroupQuizResult
        +__str__() string
    }
    
    class GroupQuizSubmission {
        +int id
        +GroupQuiz group_quiz
        +Question question
        +CustomUser student
        +string selected_choice
        +boolean is_correct
        +datetime submitted_at
        +save() void
        +__str__() string
    }
    
    class GroupQuizResult {
        +int id
        +GroupQuiz group_quiz
        +float score
        +datetime completed_at
        +datetime created_at
        +datetime updated_at
        +save() void
        +__str__() string
    }
    
    class Quiz {
        +string title
        +string content
        +boolean is_group_quiz
        +int duration
        +boolean is_active
    }
    
    class Question {
        +Quiz quiz
        +string text
        +string choice_a
        +string choice_b
        +string choice_c
        +string choice_d
        +string correct_choice
    }
    
    %% Relationships
    Material "1" -- "many" Group : "has groups"
    Group "1" -- "many" GroupMember : "has members"
    CustomUser "1" -- "many" GroupMember : "is member of"
    CustomUser -- StudentMotivationProfile : "has profile"
    
    TeacherSessionAutoGroupFormationView ..> GroupFormationAlgorithms : "uses"
    GroupFormationAlgorithms ..> StudentMotivationProfile : "analyzes"
    GroupFormationAlgorithms ..> CustomUser : "groups"
    
    Group "1" -- "many" GroupQuiz : "takes"
    Quiz "1" -- "many" GroupQuiz : "is assigned to"
    Quiz "1" -- "many" Question : "contains"
    
    GroupQuiz -- GroupQuizResult : "has one"
    GroupQuiz "1" -- "many" GroupQuizSubmission : "has submissions"
    Question "1" -- "many" GroupQuizSubmission : "is answered in"
    CustomUser "1" -- "many" GroupQuizSubmission : "submits"
    
    %% Notes
    note for GroupFormationAlgorithms "Menggunakan Algoritma Genetika DEAP\\nuntuk pembentukan kelompok heterogen"
    note for StudentMotivationProfile "Menyediakan data motivasi (Tinggi/Sedang/Rendah)\\nuntuk algoritma pembentukan kelompok"
    note for TeacherSessionAutoGroupFormationView "Kontroler utama untuk pembentukan\\nkelompok otomatis dengan parameter adaptif"
"""

def generate_integrated_arcs_grouping_system_class_diagram():
    """Menghasilkan diagram kelas terintegrasi yang menunjukkan hubungan antara ARCS dan Pembentukan Kelompok"""
    return """
classDiagram
    %% Integrated ARCS Clustering & Group Formation System
    
    class CustomUser {
        +string username
        +Role role
        +string first_name
        +string last_name
    }
    
    class StudentMotivationProfile {
        +CustomUser student
        +float attention
        +float relevance
        +float confidence
        +float satisfaction
        +string motivation_level
    }
    
    class ARCSProcessor {
        +int n_clusters
        +update_all_motivation_levels() dict
    }
    
    class GroupFormationAlgorithms {
        +create_heterogeneous_groups_deap() list
        +create_homogeneous_groups() list
    }
    
    class Material {
        +string title
        +string slug
        +Subject subject
    }
    
    class Group {
        +Material material
        +string name
        +string code
    }
    
    class GroupMember {
        +Group group
        +CustomUser student
    }
    
    class ARCSQuestionnaire {
        +Material material
        +string title
        +string questionnaire_type
    }
    
    class ARCSResponse {
        +ARCSQuestionnaire questionnaire
        +CustomUser student
        +boolean is_completed
    }
    
    class TeacherSessionAutoGroupFormationView {
        +GroupFormationAlgorithms algorithms
        +create_groups() Response
    }
    
    %% Core Relationships
    CustomUser -- StudentMotivationProfile : "analyzed as"
    Material "1" -- "many" ARCSQuestionnaire : "has"
    Material "1" -- "many" Group : "forms groups in"
    
    ARCSQuestionnaire "1" -- "many" ARCSResponse : "receives"
    CustomUser "1" -- "many" ARCSResponse : "responds to"
    
    Group "1" -- "many" GroupMember : "contains"
    CustomUser "1" -- "many" GroupMember : "is member of"
    
    %% Process Flow Relationships
    ARCSProcessor ..> ARCSResponse : "analyzes"
    ARCSProcessor ..> StudentMotivationProfile : "updates"
    
    GroupFormationAlgorithms ..> StudentMotivationProfile : "uses motivation data from"
    TeacherSessionAutoGroupFormationView ..> GroupFormationAlgorithms : "executes"
    TeacherSessionAutoGroupFormationView ..> Group : "creates"
    
    %% Data Flow
    ARCSResponse -->> ARCSProcessor : input data
    ARCSProcessor -->> StudentMotivationProfile : clustering results
    StudentMotivationProfile -->> GroupFormationAlgorithms : motivation levels
    GroupFormationAlgorithms -->> Group : optimal groups
    
    %% Notes
    note for ARCSProcessor "K-Means clustering memetakan\\nrespons ARCS ke level motivasi"
    note for GroupFormationAlgorithms "Algoritma Genetika DEAP mengoptimalkan\\nkeragaman kelompok berdasarkan level motivasi"
    note for StudentMotivationProfile "Jembatan antara analisis ARCS\\ndan pembentukan kelompok"
"""

def generate_arcs_questionnaire_detailed_class_diagram():
    """Menghasilkan diagram kelas detail untuk sistem Kuesioner ARCS"""
    return """
classDiagram
    %% Detailed ARCS Questionnaire System
    
    class ARCSQuestionnaire {
        +Material material
        +string title
        +string description
        +string questionnaire_type
        +boolean is_active
        +datetime start_date
        +datetime end_date
        +int duration_minutes
        +CustomUser created_by
        +string slug
        +is_available_for_submission() tuple
        +time_remaining() int
    }
    
    class ARCSQuestion {
        +ARCSQuestionnaire questionnaire
        +string text
        +string dimension
        +string question_type
        +int order
        +boolean is_required
        +string choice_a
        +string choice_b
        +string choice_c
        +string choice_d
        +string choice_e
        +int scale_min
        +int scale_max
        +string scale_label_min
        +string scale_label_max
        +choices() list
        +scale_labels() dict
    }
    
    class ARCSResponse {
        +ARCSQuestionnaire questionnaire
        +CustomUser student
        +datetime submitted_at
        +datetime completed_at
        +boolean is_completed
    }
    
    class ARCSAnswer {
        +ARCSResponse response
        +ARCSQuestion question
        +int likert_value
        +string choice_value
        +string text_value
        +datetime answered_at
    }
    
    class CustomUser {
        +string username
        +Role role
    }
    
    class Material {
        +string title
        +string slug
    }
    
    class StudentMotivationProfile {
        +CustomUser student
        +string motivation_level
    }
    
    %% Relationships
    Material "1" -- "many" ARCSQuestionnaire : "contains"
    CustomUser "1" -- "many" ARCSQuestionnaire : "creates"
    CustomUser "1" -- "many" ARCSResponse : "responds to"
    CustomUser -- StudentMotivationProfile : "has"
    
    ARCSQuestionnaire "1" -- "many" ARCSQuestion : "contains"
    ARCSQuestionnaire "1" -- "many" ARCSResponse : "receives"
    
    ARCSResponse "1" -- "many" ARCSAnswer : "is composed of"
    ARCSQuestion "1" -- "many" ARCSAnswer : "is answered by"
    
    %% Enumerations
    class QuestionTypes {
        <<enumeration>>
        LIKERT_5
        LIKERT_7
        MULTIPLE_CHOICE
        TEXT
    }
    
    class ARCSDimensions {
        <<enumeration>>
        ATTENTION
        RELEVANCE
        CONFIDENCE
        SATISFACTION
    }
    
    ARCSQuestion ..> QuestionTypes : "uses"
    ARCSQuestion ..> ARCSDimensions : "is categorized by"
    
    %% Notes
    note for ARCSQuestionnaire "Mengontrol ketersediaan kuesioner\\ndengan batasan waktu"
    note for ARCSQuestion "Mendukung berbagai jenis pertanyaan\\ndan terhubung ke dimensi ARCS"
    note for ARCSAnswer "Penyimpanan jawaban yang fleksibel\\nuntuk berbagai jenis pertanyaan"
"""

def save_class_diagrams():
    """Menyimpan semua diagram kelas ke folder yang terorganisir"""
    
    base_dir = os.path.join(current_dir, "class_diagrams_generated")
    folders = {
        "ARCS Clustering System": "arcs_clustering",
        "Group Formation System": "group_formation", 
        "Integrated System": "integrated_system",
        "Questionnaire System": "questionnaire_system"
    }
    
    for folder_path in folders.values():
        full_path = os.path.join(base_dir, folder_path)
        os.makedirs(full_path, exist_ok=True)
    
    diagrams = {
        "ARCS Clustering System": {
            "01_arcs_clustering_system": generate_arcs_clustering_system_class_diagram(),
        },
        "Questionnaire System": {
             "01_arcs_questionnaire_detailed": generate_arcs_questionnaire_detailed_class_diagram(),
        },
        "Group Formation System": {
            "01_genetic_algorithm_group_formation": generate_genetic_algorithm_group_formation_class_diagram(),
        },
        "Integrated System": {
            "01_integrated_arcs_grouping_system": generate_integrated_arcs_grouping_system_class_diagram(),
        }
    }
    
    diagram_structure = {}
    
    for folder_name, folder_diagrams in diagrams.items():
        folder_path = folders[folder_name]
        full_folder_path = os.path.join(base_dir, folder_path)
        
        diagram_structure[folder_name] = {}
        
        for diagram_name, diagram_content in folder_diagrams.items():
            file_path = os.path.join(full_folder_path, f"{diagram_name}.mmd")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(diagram_content)
            
            diagram_structure[folder_name][diagram_name] = diagram_content
            print(f"✅ Tersimpan: {file_path}")
    
    html_content = generate_html_preview(diagram_structure)
    html_file_path = os.path.join(base_dir, "class_diagrams_preview.html")
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n✅ Pratinjau HTML berhasil dibuat: {html_file_path}")
    print(f"🎯 Total diagram yang dibuat: {sum(len(d) for d in diagram_structure.values())}")
    
    return diagram_structure

def generate_html_preview(diagram_structure):
    """Menghasilkan file HTML untuk pratinjau semua diagram kelas dengan struktur folder"""
    
    html_content = f"""
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PramLearn - Diagram Kelas Sistem</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body {{ 
            font-family: 'Inter', sans-serif; 
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #212529;
        }}
        .header {{
            background: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.8em;
            font-weight: 700;
        }}
        .header h2 {{
            margin: 10px 0 20px;
            font-size: 1.4em;
            opacity: 0.9;
            font-weight: 400;
        }}
        .description {{
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            font-size: 1.1em;
            text-align: left;
        }}
        .folder-section {{
            margin-bottom: 40px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            border: 1px solid #dee2e6;
        }}
        .folder-header {{
            background: #343a40;
            color: white;
            padding: 15px 25px;
            font-size: 1.5em;
            font-weight: 500;
        }}
        .diagram-container {{ 
            background: white; 
            padding: 25px;
            border-bottom: 1px solid #dee2e6;
        }}
        .diagram-container:last-child {{
            border-bottom: none;
        }}
        .diagram-title {{
            color: #0056b3;
            font-size: 1.3em;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #007bff;
            font-weight: 500;
        }}
        .mermaid {{
            background: #ffffff;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #e9ecef;
            text-align: center;
        }}
        .footer {{
            color: #6c757d;
            font-size: 14px;
            text-align: center;
            margin-top: 40px;
            padding: 20px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🏗️ Diagram Kelas PramLearn</h1>
        <h2>ARCS Clustering & Genetic Algorithm Group Formation</h2>
        <div class="description">
            <strong>Diagram kelas</strong> ini menggambarkan struktur dan hubungan antar kelas dalam sistem:
            <ul>
              <li><strong>ARCS Clustering System:</strong> Analisis motivasi siswa dengan kuesioner dan K-Means.</li>
              <li><strong>Genetic Algorithm Group Formation:</strong> Pembentukan kelompok heterogen yang optimal.</li>
              <li><strong>Integrated System:</strong> Hubungan antara clustering dan pembentukan kelompok.</li>
            </ul>
        </div>
    </div>
"""

    for folder_name, diagrams in diagram_structure.items():
        html_content += f"""
    <div class="folder-section">
        <div class="folder-header">
            📁 {folder_name}
        </div>
"""
        
        for diagram_name, diagram_content in diagrams.items():
            display_name = ' '.join(word.capitalize() for word in diagram_name.replace('_', ' ').split())[3:]
            
            html_content += f"""
        <div class="diagram-container">
            <h3 class="diagram-title">{display_name}</h3>
            <div class="mermaid">
{diagram_content}
            </div>
        </div>
"""
        
        html_content += "    </div>\n"

    html_content += f"""
    <div class="footer">
        Dibuat pada: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    </div>

    <script>
        mermaid.initialize({{ 
            startOnLoad: true,
            theme: 'base',
            themeVariables: {{
                'primaryColor': '#ffffff',
                'primaryTextColor': '#212529',
                'primaryBorderColor': '#dee2e6',
                'lineColor': '#343a40',
                'secondaryColor': '#f8f9fa',
                'tertiaryColor': '#ffffff',
                'fontFamily': '"Inter", sans-serif',
                'fontSize': '16px'
            }}
        }});
    </script>
</body>
</html>
"""
    
    return html_content

if __name__ == "__main__":
    print("🚀 Memulai pembuatan Diagram Kelas untuk PramLearn...")
    print("=" * 80)
    print("📊 Sistem yang dicakup:")
    print("   • ARCS Clustering System (Models & Services)")
    print("   • Genetic Algorithm Group Formation (DEAP)")
    print("   • Integrated System Architecture")
    print("   • ARCS Questionnaire Detailed Structure")
    print("=" * 80)
    
    save_class_diagrams()

