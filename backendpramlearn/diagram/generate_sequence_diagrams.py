import os
import sys
import django
from datetime import datetime

# Add the parent directory to the system path to import Django settings
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()

def generate_student_arcs_questionnaire():
    """Generate sequence diagram untuk ARCS Questionnaire Flow - Student"""
    return """
sequenceDiagram
    participant S as Student
    participant F as Frontend (React)
    participant B as Backend API
    participant DB as Database
    
    Note over S,DB: ARCS Questionnaire Flow
    
    S->>+F: Login sebagai student
    F->>+B: POST /api/auth/login/
    B-->>-F: Authentication token
    F-->>-S: Dashboard siswa
    
    S->>+F: Akses material pembelajaran
    F->>+B: GET /api/materials/{slug}/
    B-->>-F: Material data + ARCS questionnaire
    F-->>-S: Tampilan material
    
    S->>+F: Klik "Isi Kuesioner ARCS"
    F->>+B: GET /api/arcs/questionnaire/{id}/
    B->>+DB: Ambil pertanyaan ARCS
    DB-->>-B: 20 pertanyaan (4 dimensi)
    B-->>-F: Struktur kuesioner
    F-->>-S: Form kuesioner (20 pertanyaan)
    
    loop Untuk setiap pertanyaan (1-20)
        S->>F: Jawab pertanyaan (skala 1-5)
        F->>F: Simpan di state lokal
    end
    
    S->>+F: Submit kuesioner lengkap
    F->>+B: POST /api/student/arcs/submit/
    B->>+DB: Simpan ARCSResponse & ARCSAnswer
    DB-->>-B: Data tersimpan
    B-->>-F: Submission berhasil
    F-->>-S: Konfirmasi pengiriman
"""

def generate_automatic_clustering_process():
    """Generate sequence diagram untuk Automatic Clustering Process"""
    return """
sequenceDiagram
    participant B as Backend API
    participant ARCS as ARCSProcessor
    participant DB as Database
    participant KM as K-Means
    
    Note over B,KM: Automatic Clustering Process
    
    B->>+ARCS: _process_arcs_scores()
    ARCS->>+DB: Ambil semua data ARCS siswa
    DB-->>-ARCS: Dataset lengkap (Attention, Relevance, Confidence, Satisfaction)
    
    ARCS->>ARCS: Hitung rata-rata per dimensi
    ARCS->>+KM: fit_predict(features_scaled)
    KM->>KM: StandardScaler normalization
    KM->>KM: K-Means clustering (k=3)
    KM->>KM: Map clusters to motivation levels
    KM-->>-ARCS: cluster_labels (High/Medium/Low)
    
    ARCS->>+DB: Update StudentMotivationProfile
    DB-->>-ARCS: Profile updated
    ARCS-->>-B: Clustering selesai
"""

def generate_student_view_results():
    """Generate sequence diagram untuk View Results - Student"""
    return """
sequenceDiagram
    participant S as Student
    participant F as Frontend (React)
    participant B as Backend API
    participant DB as Database
    
    Note over S,DB: View Results
    
    S->>+F: Lihat hasil analisis ARCS
    F->>+B: GET /api/student/motivation-profile/
    B->>+DB: Ambil StudentMotivationProfile
    DB-->>-B: Profil motivasi + skor dimensi
    B-->>-F: Data analisis lengkap
    F-->>-S: Dashboard hasil ARCS
    
    S->>F: Lihat rekomendasi personal
    F->>F: Generate recommendations berdasarkan hasil
    F->>S: Tampilan insight & saran
"""

def generate_teacher_csv_upload():
    """Generate sequence diagram untuk CSV Upload Flow - Teacher"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant CSV as CSV Processor
    participant KM as K-Means
    participant DB as Database
    
    Note over T,DB: CSV Upload Flow
    
    T->>+F: Login sebagai teacher
    F->>+B: POST /api/auth/login/
    B-->>-F: Authentication token
    F-->>-T: Dashboard guru
    
    T->>+F: Akses Class Management
    F->>+B: GET /api/teacher/classes/
    B-->>-F: Daftar kelas yang diajar
    F-->>-T: Pilihan kelas
    
    T->>+F: Klik tab "Upload ARCS Data"
    F-->>-T: Upload interface + template download
    
    T->>F: Download template CSV
    F->>T: File arcs_data.csv (template)
    
    T->>+F: Upload file CSV yang sudah diisi
    F->>+B: POST /api/upload-arcs-csv/
    B->>+CSV: sessions_assign_motivation_profiles()
    CSV->>CSV: Validasi format CSV
    CSV->>CSV: Hitung rata-rata per dimensi ARCS
    
    CSV->>+KM: KMeans clustering (k=3)
    KM->>KM: fit_predict(features)
    KM->>KM: Map clusters berdasarkan centroid
    KM-->>-CSV: cluster_labels
    
    CSV->>+DB: Batch update StudentMotivationProfile
    DB-->>-CSV: Profiles updated
    CSV-->>-B: Processing result
    B-->>-F: Success + statistics
    F-->>-T: Konfirmasi upload berhasil
"""

def generate_teacher_questionnaire_based():
    """Generate sequence diagram untuk Questionnaire-based Flow - Teacher"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant ARCS as ARCSProcessor
    participant KM as K-Means
    participant DB as Database
    
    Note over T,DB: Questionnaire-based Flow
    
    T->>+F: Klik tab "ARCS Questionnaire"
    F->>+B: GET /api/arcs/responses/
    B->>+DB: Ambil responses siswa
    DB-->>-B: Data responses (34 siswa)
    B-->>-F: Statistics responses
    F-->>-T: Overview kuesioner
    
    T->>+F: Trigger clustering manual
    F->>+B: POST /api/arcs/trigger-clustering/
    B->>+ARCS: update_all_motivation_levels()
    ARCS->>+DB: Query semua StudentMotivationProfile
    DB-->>-ARCS: Dataset ARCS lengkap
    
    ARCS->>+KM: Perform clustering
    KM->>KM: StandardScaler + K-Means
    KM-->>-ARCS: Motivation levels
    
    ARCS->>+DB: Update motivation_level untuk semua siswa
    DB-->>-ARCS: Batch update selesai
    ARCS-->>-B: Clustering statistics
    B-->>-F: Results summary
    F-->>-T: Hasil clustering
"""

def generate_teacher_analysis_export():
    """Generate sequence diagram untuk Analysis & Export - Teacher"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant PDF as PDF Service
    participant DB as Database
    
    Note over T,DB: Analysis & Export
    
    T->>+F: Lihat hasil clustering
    F->>+B: GET /api/clustering/statistics/
    B->>+DB: Query StudentMotivationProfile grouped
    DB-->>-B: Distribution statistics
    B-->>-F: High: X, Medium: Y, Low: Z
    F-->>-T: Dashboard analytics
    
    T->>+F: Export laporan PDF
    F->>+B: POST /api/export/clustering-report/
    B->>+PDF: ARCSClusteringPDFService.generate()
    PDF->>+DB: Ambil data lengkap untuk laporan
    DB-->>-PDF: All student profiles + statistics
    PDF->>PDF: Generate comprehensive report
    PDF-->>-B: PDF file content
    B-->>-F: PDF download response
    F-->>-T: File laporan clustering.pdf
"""

def generate_teacher_group_formation():
    """Generate sequence diagram untuk Group Formation Flow - Teacher"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant DB as Database
    
    Note over T,DB: Group Formation Flow
    
    T->>+F: Lanjut ke pembentukan kelompok
    F->>+B: GET /api/groups/formation-page/
    B-->>-F: Group formation interface
    F-->>-T: Opsi pembentukan kelompok
    
    T->>+F: Generate Groups (Heterogen/Homogen)
    F->>+B: POST /api/teacher/auto-group-formation/
    B->>B: Validate motivation profiles
    B->>B: Execute genetic algorithm (DEAP)
    B->>+DB: Simpan kelompok optimal
    DB-->>-B: Groups created
    B-->>-F: Group formation results
    F-->>-T: Kelompok terbentuk berdasarkan clustering
"""

def generate_clustering_data_preparation():
    """Generate sequence diagram untuk Data Preparation - Clustering Algorithm"""
    return """
sequenceDiagram
    participant API as API Endpoint
    participant ARCS as ARCSProcessor
    participant DB as Database
    
    Note over API,DB: Data Preparation
    
    API->>+ARCS: update_all_motivation_levels()
    
    ARCS->>+DB: Query StudentMotivationProfile
    Note right of DB: Filter: attention, relevance,<br/>confidence, satisfaction not null<br/>Exclude: semua nilai = 0.0
    DB-->>-ARCS: profiles (N siswa)
    
    ARCS->>ARCS: Validasi: len(profiles) >= n_clusters (3)
    
    loop Untuk setiap profile
        ARCS->>ARCS: features.append([attention, relevance, confidence, satisfaction])
        ARCS->>ARCS: profile_ids.append(profile.id)
    end
    
    ARCS->>ARCS: features = np.array(features)
"""

def generate_clustering_normalization():
    """Generate sequence diagram untuk Normalization & Clustering"""
    return """
sequenceDiagram
    participant ARCS as ARCSProcessor
    participant SC as StandardScaler
    participant KM as KMeans
    
    Note over ARCS,KM: Normalization & Clustering
    
    ARCS->>+SC: fit_transform(features)
    SC->>SC: Standardize: (X - mean) / std
    SC-->>-ARCS: features_scaled
    
    ARCS->>+KM: __init__(n_clusters=3, random_state=42, n_init=10)
    KM-->>-ARCS: KMeans object
    
    ARCS->>+KM: fit_predict(features_scaled)
    KM->>KM: Initialize centroids (k-means++)
    
    loop Max 300 iterations
        KM->>KM: Assign points to nearest centroid
        KM->>KM: Update centroids
        KM->>KM: Check convergence
    end
    
    KM-->>-ARCS: cluster_labels [0,1,2,...]
    
    ARCS->>+KM: cluster_centers_
    KM-->>-ARCS: centroids matrix
    
    ARCS->>ARCS: centroid_means = np.mean(centroids, axis=1)
    ARCS->>ARCS: sorted_indices = np.argsort(centroid_means)
    
    ARCS->>ARCS: level_mapping = {<br/>  sorted_indices[0]: "Low",<br/>  sorted_indices[1]: "Medium",<br/>  sorted_indices[2]: "High"<br/>}
"""

def generate_clustering_database_update():
    """Generate sequence diagram untuk Database Update - Clustering Algorithm"""
    return """
sequenceDiagram
    participant ARCS as ARCSProcessor
    participant DB as Database
    participant API as API Endpoint
    
    Note over ARCS,API: Database Update
    
    ARCS->>+DB: transaction.atomic()
    
    loop Untuk setiap profile_id, cluster_label
        ARCS->>ARCS: motivation_level = level_mapping[cluster_label]
        ARCS->>DB: UPDATE StudentMotivationProfile<br/>SET motivation_level = motivation_level<br/>WHERE id = profile_id
    end
    
    DB-->>-ARCS: Batch update committed
    
    ARCS->>ARCS: Calculate return statistics
    ARCS-->>-API: {<br/>  "total_profiles": N,<br/>  "clusters": {<br/>    "Low": count_low,<br/>    "Medium": count_medium,<br/>    "High": count_high<br/>  }<br/>}
"""

def generate_teacher_group_formation():
    """Generate sequence diagram untuk Group Formation Flow - Teacher"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant DB as Database
    
    Note over T,DB: Group Formation Flow
    
    T->>+F: Lanjut ke pembentukan kelompok
    F->>+B: GET /api/groups/formation-page/
    B-->>-F: Group formation interface
    F-->>-T: Opsi pembentukan kelompok
    
    T->>+F: Generate Groups (Heterogen/Homogen)
    F->>+B: POST /api/teacher/auto-group-formation/
    B->>B: Validate motivation profiles
    B->>B: Execute genetic algorithm (DEAP)
    B->>+DB: Simpan kelompok optimal
    DB-->>-B: Groups created
    B-->>-F: Group formation results
    F-->>-T: Kelompok terbentuk berdasarkan clustering
"""

def generate_genetic_algorithm_group_formation():
    """Generate sequence diagram untuk Genetic Algorithm Group Formation"""
    return """
sequenceDiagram
    participant T as Teacher
    participant F as Frontend (React)
    participant B as Backend API
    participant GA as Genetic Algorithm
    participant DB as Database
    
    Note over T,DB: Genetic Algorithm - Heterogeneous Group Formation
    
    T->>+F: Pilih "Heterogeneous Groups"
    F->>+B: POST /api/groups/genetic-formation/
    B->>+DB: Ambil StudentMotivationProfile
    DB-->>-B: Data siswa dengan motivation levels
    
    B->>+GA: initialize_population()
    GA->>GA: Create random group combinations
    GA-->>-B: Initial population
    
    loop Evolusi (Max 100 generasi)
        B->>+GA: evaluate_fitness()
        GA->>GA: Hitung diversity score per kelompok
        GA->>GA: Hitung balance score antar kelompok
        GA-->>-B: Fitness scores
        
        B->>+GA: selection_crossover_mutation()
        GA->>GA: Tournament selection
        GA->>GA: Crossover (swap students)
        GA->>GA: Mutation (random reassignment)
        GA-->>-B: New generation
        
        B->>B: Check convergence
    end
    
    B->>B: Pilih solusi terbaik
    B->>+DB: Simpan kelompok hasil GA
    DB-->>-B: Groups saved
    B-->>-F: Optimal group formation
    F-->>-T: Kelompok heterogen terbentuk
"""

def save_sequence_diagrams():
    """Save all sequence diagrams to organized folders"""
    
    # Create main output directory
    output_dir = "sequence_diagrams"
    os.makedirs(output_dir, exist_ok=True)
    
    # Define folder structure and diagrams
    diagram_structure = {
        "Student Flow": {
            "01_arcs_questionnaire_flow": generate_student_arcs_questionnaire(),
            "02_automatic_clustering_process": generate_automatic_clustering_process(),
            "03_view_results": generate_student_view_results()
        },
        "Teacher Flow": {
            "01_csv_upload_flow": generate_teacher_csv_upload(),
            "02_questionnaire_based_flow": generate_teacher_questionnaire_based(),
            "03_analysis_export": generate_teacher_analysis_export(),
            "04_group_formation_flow": generate_teacher_group_formation(),
            "05_genetic_algorithm_group_formation": generate_genetic_algorithm_group_formation()
        },
        "Detail Algoritma K-Means Clustering": {
            "01_data_preparation": generate_clustering_data_preparation(),
            "02_normalization_clustering": generate_clustering_normalization(),
            "03_database_update": generate_clustering_database_update()
        }
    }
    
    all_diagrams = {}
    
    # Create folders and save diagrams
    for folder_name, diagrams in diagram_structure.items():
        folder_path = os.path.join(output_dir, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        for filename, diagram_content in diagrams.items():
            file_path = os.path.join(folder_path, f"{filename}.mmd")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(diagram_content)
            print(f"✅ Generated: {file_path}")
            
            # Store for HTML preview with full path as key
            all_diagrams[f"{folder_name}/{filename}"] = diagram_content
    
    # Generate HTML preview with organized structure
    html_content = generate_html_preview(diagram_structure)
    html_filename = os.path.join(output_dir, "sequence_diagrams_preview.html")
    with open(html_filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ Generated: {html_filename}")
    
    print(f"\n🎯 Sequence diagrams berhasil di-generate dengan struktur folder!")
    print(f"📁 Lokasi: {os.path.abspath(output_dir)}/")
    print(f"🌐 Preview: Buka {html_filename} di browser")
    print(f"\n📂 Struktur folder:")
    for folder_name, diagrams in diagram_structure.items():
        print(f"   📁 {folder_name}/")
        for filename in diagrams.keys():
            print(f"      📄 {filename}.mmd")

def generate_html_preview(diagram_structure):
    """Generate HTML file untuk preview semua diagrams dengan struktur folder"""
    
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>PramLearn ARCS Clustering - Sequence Diagrams</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {{ 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }}
        .diagram-container {{ 
            background: white; 
            margin: 30px 0; 
            padding: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .folder-header {{
            background: linear-gradient(135deg, #11418b, #1a5bb8);
            color: white;
            padding: 15px 20px;
            margin: 40px 0 0 0;
            border-radius: 8px 8px 0 0;
            font-size: 18px;
            font-weight: bold;
        }}
        .diagram-title {{ 
            color: #11418b; 
            border-bottom: 2px solid #11418b; 
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 16px;
        }}
        .mermaid {{ 
            text-align: center; 
            background: white;
            margin: 20px 0;
        }}
        .header {{
            text-align: center;
            color: #11418b;
            margin-bottom: 30px;
        }}
        .timestamp {{
            color: #666;
            font-size: 14px;
            text-align: right;
            margin-top: 20px;
        }}
        .folder-section {{
            margin-bottom: 50px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🔄 PramLearn ARCS Clustering System</h1>
        <h2>Sequence Diagrams - Organized Structure</h2>
        <p>Generated automatically from codebase analysis</p>
    </div>
"""

    # Generate content for each folder
    for folder_name, diagrams in diagram_structure.items():
        html_content += f"""
    <div class="folder-section">
        <div class="folder-header">
            📁 {folder_name}
        </div>
"""
        
        for diagram_name, diagram_content in diagrams.items():
            # Clean up diagram name for display
            display_name = diagram_name.replace('_', ' ').replace('01 ', '').replace('02 ', '').replace('03 ', '').replace('04 ', '').title()
            
            html_content += f"""
        <div class="diagram-container">
            <h3 class="diagram-title">📄 {display_name}</h3>
            <div class="mermaid">
{diagram_content}
            </div>
        </div>
"""
        
        html_content += "    </div>\n"

    html_content += f"""
    <div class="timestamp">
        Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    </div>

    <script>
        mermaid.initialize({{ 
            startOnLoad: true,
            theme: 'neutral',
            themeVariables: {{
                primaryColor: '#11418b',
                primaryTextColor: '#fff',
                primaryBorderColor: '#11418b',
                lineColor: '#11418b'
            }}
        }});
    </script>
</body>
</html>
"""
    
    return html_content

if __name__ == "__main__":
    print("🚀 Generating Organized Sequence Diagrams for ARCS Clustering System...")
    print("=" * 70)
    
    save_sequence_diagrams()