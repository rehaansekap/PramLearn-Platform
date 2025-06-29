import os
import django
import json
import random
from django.utils.text import slugify
from faker import Faker
from datetime import datetime, timedelta
import logging

logging.getLogger("faker.factory").setLevel(logging.ERROR)

# Set up Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()

fake = Faker("id_ID")  # Indonesian locale


def generate_roles():
    """Generate roles"""
    return [
        {
            "model": "pramlearnapp.role",
            "pk": 1,
            "fields": {
                "name": "Admin",
                "description": "Administrator with full access",
            },
        },
        {
            "model": "pramlearnapp.role",
            "pk": 2,
            "fields": {"name": "Teacher", "description": "Teacher with limited access"},
        },
        {
            "model": "pramlearnapp.role",
            "pk": 3,
            "fields": {"name": "Student", "description": "Student with view access"},
        },
    ]


def generate_users():
    """Generate 1 admin, 1 teacher, 34 students"""
    users = []

    # 1 Admin
    users.append(
        {
            "model": "pramlearnapp.customuser",
            "pk": 1,
            "fields": {
                "username": "admin1",
                "password": "pbkdf2_sha256$600000$dummy$dummy",
                "email": "admin@pramlearn.com",
                "first_name": "Administrator",
                "last_name": "System",
                "role": 1,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_online": False,
                "last_activity": None,
            },
        }
    )

    # 1 Teacher
    users.append(
        {
            "model": "pramlearnapp.customuser",
            "pk": 2,
            "fields": {
                "username": "teacher1",
                "password": "pbkdf2_sha256$600000$dummy$dummy",
                "email": "teacher1@pramlearn.com",
                "first_name": "Budi",
                "last_name": "Santoso",
                "role": 2,
                "is_staff": False,
                "is_superuser": False,
                "is_active": True,
                "is_online": False,
                "last_activity": None,
            },
        }
    )

    # 34 Students with Indonesian names
    student_names = [
        ("Ahmad", "Rizki"),
        ("Siti", "Nurhaliza"),
        ("Budi", "Permana"),
        ("Dewi", "Sartika"),
        ("Andi", "Pratama"),
        ("Rina", "Susanti"),
        ("Doni", "Setiawan"),
        ("Maya", "Putri"),
        ("Eko", "Saputra"),
        ("Lina", "Wati"),
        ("Rudi", "Hartono"),
        ("Sari", "Indah"),
        ("Joko", "Widodo"),
        ("Fitri", "Rahayu"),
        ("Agus", "Salim"),
        ("Dian", "Pertiwi"),
        ("Hendra", "Gunawan"),
        ("Ratna", "Sari"),
        ("Bambang", "Sutrisno"),
        ("Yuni", "Astuti"),
        ("Faisal", "Rahman"),
        ("Endah", "Lestari"),
        ("Wahyu", "Prasetyo"),
        ("Novi", "Handayani"),
        ("Rizal", "Fauzi"),
        ("Tika", "Damayanti"),
        ("Irwan", "Setiadi"),
        ("Mega", "Puspita"),
        ("Dedi", "Kurniawan"),
        ("Sinta", "Dewi"),
        ("Arif", "Hidayat"),
        ("Lia", "Permatasari"),
        ("Yoga", "Pratama"),
        ("Indra", "Wijaya"),
    ]

    for i, (first_name, last_name) in enumerate(student_names, 3):
        users.append(
            {
                "model": "pramlearnapp.customuser",
                "pk": i,
                "fields": {
                    "username": f"student{i-2}",
                    "password": "pbkdf2_sha256$600000$dummy$dummy",
                    "email": f"student{i-2}@pramlearn.com",
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": 3,
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True,
                    "is_online": False,
                    "last_activity": None,
                },
            }
        )

    return users


def generate_classes():
    """Generate 1 class"""
    return [
        {
            "model": "pramlearnapp.class",
            "pk": 1,
            "fields": {"name": "XII RPL 1", "slug": "xii-rpl-1"},
        }
    ]


def generate_subjects():
    """Generate 1 subject: Administrasi Sistem Jaringan"""
    return [
        {
            "model": "pramlearnapp.subject",
            "pk": 1,
            "fields": {
                "name": "Administrasi Sistem Jaringan",
                "slug": "administrasi-sistem-jaringan",
                "subject_class": 1,
                # add teacher name
            },
        }
    ]


def generate_subject_classes():
    """Generate subject class relationship"""
    return [
        {
            "model": "pramlearnapp.subjectclass",
            "pk": 1,
            "fields": {
                "teacher": 2,  # Teacher ID
                "class_id": 1,  # Class ID
                "subject": 1,  # Subject ID
            },
        }
    ]


def generate_class_students():
    """Generate class students for all 34 students"""
    class_students = []
    for i in range(3, 37):  # Student IDs 3-36
        class_students.append(
            {
                "model": "pramlearnapp.classstudent",
                "pk": i - 2,
                "fields": {"student": i, "class_id": 1},
            }
        )
    return class_students


def generate_materials():
    """Generate 1 material: Pengenalan Jaringan Komputer"""
    return [
        {
            "model": "pramlearnapp.material",
            "pk": 1,
            "fields": {
                "title": "Pengenalan Jaringan Komputer",
                "slug": "pengenalan-jaringan-komputer",
                "subject": 1,
                "created_at": "2024-01-15T08:00:00Z",
                "updated_at": "2024-01-15T08:00:00Z",
            },
        }
    ]


def generate_files():
    """Generate 1 PDF file for the material"""
    return [
        {
            "model": "pramlearnapp.file",
            "pk": 1,
            "fields": {
                "file": "materials/pengenalan_jaringan_komputer.pdf",
                "uploaded_at": "2024-01-15T08:00:00Z",
            },
        }
    ]


def generate_youtube_videos():
    """Generate 2 YouTube videos for the material"""
    return [
        {
            "model": "pramlearnapp.materialyoutubevideo",
            "pk": 1,
            "fields": {
                "material": 1,
                "url": "https://www.youtube.com/watch?v=QXfmzVWMkaM",
            },
        },
        {
            "model": "pramlearnapp.materialyoutubevideo",
            "pk": 2,
            "fields": {
                "material": 1,
                "url": "https://www.youtube.com/watch?v=k-ORWq281c4",
            },
        },
    ]


def generate_quiz():
    """Generate 1 quiz"""
    return [
        {
            "model": "pramlearnapp.quiz",
            "pk": 1,
            "fields": {
                "title": "Quiz 1",
                "content": "Quiz tentang pengenalan jaringan komputer",
                "material": 1,
                "is_active": True,
                "duration": 30,
                "created_at": "2024-01-15T09:00:00Z",
            },
        }
    ]


def generate_quiz_questions():
    """Generate quiz questions"""
    questions = [
        {
            "model": "pramlearnapp.question",
            "pk": 1,
            "fields": {
                "quiz": 1,
                "text": "Apa yang dimaksud dengan jaringan komputer?",
                "choice_a": "Kumpulan komputer yang terhubung untuk berbagi data",
                "choice_b": "Program untuk mengakses internet",
                "choice_c": "Perangkat keras komputer",
                "choice_d": "Sistem operasi komputer",
                "correct_choice": "A",
            },
        },
        {
            "model": "pramlearnapp.question",
            "pk": 2,
            "fields": {
                "quiz": 1,
                "text": "Protokol yang digunakan untuk transfer file adalah?",
                "choice_a": "HTTP",
                "choice_b": "FTP",
                "choice_c": "SMTP",
                "choice_d": "DNS",
                "correct_choice": "B",
            },
        },
        {
            "model": "pramlearnapp.question",
            "pk": 3,
            "fields": {
                "quiz": 1,
                "text": "Topologi jaringan yang membentuk lingkaran adalah?",
                "choice_a": "Star",
                "choice_b": "Bus",
                "choice_c": "Ring",
                "choice_d": "Mesh",
                "correct_choice": "C",
            },
        },
        {
            "model": "pramlearnapp.question",
            "pk": 4,
            "fields": {
                "quiz": 1,
                "text": "Perangkat yang berfungsi menghubungkan jaringan adalah?",
                "choice_a": "Hub",
                "choice_b": "Switch",
                "choice_c": "Router",
                "choice_d": "Semua benar",
                "correct_choice": "D",
            },
        },
        {
            "model": "pramlearnapp.question",
            "pk": 5,
            "fields": {
                "quiz": 1,
                "text": "IP Address 192.168.1.1 termasuk kelas?",
                "choice_a": "Kelas A",
                "choice_b": "Kelas B",
                "choice_c": "Kelas C",
                "choice_d": "Kelas D",
                "correct_choice": "C",
            },
        },
    ]
    return questions


def generate_assignment():
    """Generate 1 assignment"""
    return [
        {
            "model": "pramlearnapp.assignment",
            "pk": 1,
            "fields": {
                "title": "Test 1",
                "material": 1,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z",
                "due_date": "2024-01-22T23:59:59Z",
            },
        }
    ]


def generate_assignment_questions():
    """Generate assignment questions"""
    questions = [
        {
            "model": "pramlearnapp.assignmentquestion",
            "pk": 1,
            "fields": {
                "assignment": 1,
                "text": "Jelaskan perbedaan antara LAN, MAN, dan WAN beserta contohnya!",
                # "question_type": "essay",
                "choice_a": None,
                "choice_b": None,
                "choice_c": None,
                "choice_d": None,
                "correct_choice": None,
            },
        },
        {
            "model": "pramlearnapp.assignmentquestion",
            "pk": 2,
            "fields": {
                "assignment": 1,
                "text": "Buatlah diagram topologi jaringan star dengan 8 komputer klien!",
                # "question_type": "essay",
                "choice_a": None,
                "choice_b": None,
                "choice_c": None,
                "choice_d": None,
                "correct_choice": None,
            },
        },
        {
            "model": "pramlearnapp.assignmentquestion",
            "pk": 3,
            "fields": {
                "assignment": 1,
                "text": "Model referensi OSI memiliki berapa layer?",
                # "question_type": "multiple_choice",
                "choice_a": "5 layer",
                "choice_b": "6 layer",
                "choice_c": "7 layer",
                "choice_d": "8 layer",
                "correct_choice": "C",
            },
        },
    ]
    return questions


def generate_arcs_questionnaires():
    """Generate 2 ARCS questionnaires: Sebelum dan Sesudah"""
    return [
        {
            "model": "pramlearnapp.arcsquestionnaire",
            "pk": 1,
            "fields": {
                "title": "Kuesioner ARCS Sebelum Pembelajaran",
                "slug": "arcs-sebelum-pembelajaran",
                "description": "Kuesioner untuk mengukur motivasi belajar siswa sebelum pembelajaran dimulai",
                "material": 1,
                "questionnaire_type": "pre",
                "is_active": True,
                "duration_minutes": 15,
                "start_date": "2024-01-15T07:00:00Z",
                "end_date": "2024-01-15T23:59:59Z",
                "created_at": "2024-01-15T06:00:00Z",
                "updated_at": "2024-01-15T06:00:00Z",
                "created_by": 2,  # <-- Tambahkan ini (ID teacher)
            },
        },
        {
            "model": "pramlearnapp.arcsquestionnaire",
            "pk": 2,
            "fields": {
                "title": "Kuesioner ARCS Sesudah Pembelajaran",
                "slug": "arcs-sesudah-pembelajaran",
                "description": "Kuesioner untuk mengukur motivasi belajar siswa setelah pembelajaran selesai",
                "material": 1,
                "questionnaire_type": "post",
                "is_active": True,
                "duration_minutes": 15,
                "start_date": "2024-01-22T07:00:00Z",
                "end_date": "2024-01-22T23:59:59Z",
                "created_at": "2024-01-15T06:00:00Z",
                "updated_at": "2024-01-15T06:00:00Z",
                "created_by": 2,  # <-- Tambahkan ini (ID teacher)
            },
        },
    ]


def generate_arcs_questions():
    """Generate ARCS questions for both questionnaires"""
    questions = []

    # Questions for questionnaire 1 (Sebelum)
    arcs_questions_data = [
        # Attention dimension
        (
            "Saya merasa tertarik untuk mempelajari materi jaringan komputer",
            "attention",
            1,
        ),
        ("Materi jaringan komputer tampak menarik bagi saya", "attention", 2),
        ("Saya penasaran dengan konsep-konsep dalam jaringan komputer", "attention", 3),
        ("Saya mudah fokus saat belajar tentang jaringan komputer", "attention", 4),
        ("Topik jaringan komputer memicu rasa ingin tahu saya", "attention", 5),
        # Relevance dimension
        ("Materi jaringan komputer berguna untuk masa depan saya", "relevance", 6),
        (
            "Saya dapat menghubungkan materi ini dengan pengalaman sehari-hari",
            "relevance",
            7,
        ),
        ("Pembelajaran jaringan komputer sesuai dengan minat saya", "relevance", 8),
        ("Materi ini akan membantu saya dalam karir di bidang IT", "relevance", 9),
        ("Saya membutuhkan pengetahuan jaringan komputer", "relevance", 10),
        # Confidence dimension
        (
            "Saya yakin dapat memahami materi jaringan komputer dengan baik",
            "confidence",
            11,
        ),
        (
            "Saya merasa mampu menyelesaikan tugas-tugas jaringan komputer",
            "confidence",
            12,
        ),
        ("Saya percaya diri dengan kemampuan belajar saya", "confidence", 13),
        ("Materi jaringan komputer tidak terlalu sulit bagi saya", "confidence", 14),
        ("Saya optimis akan berhasil dalam pembelajaran ini", "confidence", 15),
        # Satisfaction dimension
        (
            "Saya merasa puas dengan cara pembelajaran jaringan komputer",
            "satisfaction",
            16,
        ),
        ("Pembelajaran ini membuat saya senang", "satisfaction", 17),
        ("Saya mendapat kepuasan dari belajar jaringan komputer", "satisfaction", 18),
        ("Aktivitas pembelajaran ini menyenangkan", "satisfaction", 19),
        (
            "Saya merasa bangga ketika memahami konsep jaringan komputer",
            "satisfaction",
            20,
        ),
    ]

    # Generate questions for both questionnaires
    for qid in [1, 2]:
        for idx, (text, dimension, order) in enumerate(arcs_questions_data, 1):
            pk = (qid - 1) * 20 + idx
            questions.append(
                {
                    "model": "pramlearnapp.arcsquestion",
                    "pk": pk,
                    "fields": {
                        "questionnaire": qid,
                        "text": text,
                        "dimension": dimension,
                        "question_type": "likert_5",
                        "order": order,
                        "is_required": True,
                        "scale_min": 1,
                        "scale_max": 5,
                        "scale_label_min": "Sangat Tidak Setuju",
                        "scale_label_max": "Sangat Setuju",
                        "created_at": "2024-01-15T06:00:00Z",
                        "updated_at": "2024-01-15T06:00:00Z",
                        # HAPUS "scale_labels"
                    },
                }
            )
    return questions


def generate_arcs_responses():
    """Generate ARCS responses for all students"""
    responses = []

    # Generate responses for questionnaire 1 (pre-learning) for all 34 students
    for student_id in range(3, 37):  # Students ID 3-36
        responses.append(
            {
                "model": "pramlearnapp.arcsresponse",
                "pk": student_id - 2,  # Response ID 1-34
                "fields": {
                    "questionnaire": 1,
                    "student": student_id,
                    "submitted_at": "2024-01-15T08:30:00Z",
                    "completed_at": "2024-01-15T08:45:00Z",
                    "is_completed": True,
                },
            }
        )

    return responses


def generate_arcs_answers():
    """Generate ARCS answers for all student responses"""
    answers = []
    answer_id = 1

    # Generate answers for all 34 students for questionnaire 1
    for student_response_id in range(1, 35):  # Response IDs 1-34
        # Generate answers for all 20 questions (1-20 for questionnaire 1)
        for question_id in range(1, 21):
            # Generate realistic likert responses (mostly 3-5)
            likert_value = random.choices([2, 3, 4, 5], weights=[10, 30, 40, 20])[0]

            answers.append(
                {
                    "model": "pramlearnapp.arcsanswer",
                    "pk": answer_id,
                    "fields": {
                        "response": student_response_id,
                        "question": question_id,
                        "likert_value": likert_value,
                        "choice_value": None,
                        "text_value": None,
                        "answered_at": "2024-01-15T08:35:00Z",
                    },
                }
            )
            answer_id += 1

    return answers


def generate_student_motivation_profiles():
    """Generate motivation profiles based on ARCS responses"""
    profiles = []

    for student_id in range(3, 37):  # Students ID 3-36
        # Generate realistic ARCS scores
        attention = round(random.uniform(2.5, 4.5), 2)
        relevance = round(random.uniform(2.8, 4.8), 2)
        confidence = round(random.uniform(2.2, 4.2), 2)
        satisfaction = round(random.uniform(2.6, 4.6), 2)

        # Determine motivation level based on averages
        avg_score = (attention + relevance + confidence + satisfaction) / 4
        if avg_score >= 4.0:
            motivation_level = "High"
        elif avg_score >= 3.0:
            motivation_level = "Medium"
        else:
            motivation_level = "Low"

        profiles.append(
            {
                "model": "pramlearnapp.studentmotivationprofile",
                "pk": student_id - 2,
                "fields": {
                    "student": student_id,
                    "attention": attention,
                    "relevance": relevance,
                    "confidence": confidence,
                    "satisfaction": satisfaction,
                    "motivation_level": motivation_level,
                },
            }
        )

    return profiles


def generate_student_attendance():
    """Generate attendance data with various status"""
    attendance = []
    statuses = ["present", "excused", "late", "absent"]
    weights = [70, 15, 10, 5]  # Realistic distribution

    for i, student_id in enumerate(range(3, 37), 1):  # Students ID 3-36
        status = random.choices(statuses, weights=weights)[0]
        attendance.append(
            {
                "model": "pramlearnapp.studentattendance",
                "pk": i,
                "fields": {
                    "student": student_id,
                    "material": 1,  # ID materi
                    "status": status,
                    "updated_by": 2,  # ID teacher
                    "updated_at": "2024-01-15T08:00:00Z",  # <-- Tambahkan ini!
                },
            }
        )
    return attendance


def main():
    """Main function to generate comprehensive initial data"""
    print("Generating comprehensive PramLearn initial data...")
    print("=" * 50)

    data = []

    print("📝 Generating basic data...")
    data.extend(generate_roles())
    data.extend(generate_users())
    data.extend(generate_classes())
    data.extend(generate_subjects())
    data.extend(generate_subject_classes())
    data.extend(generate_class_students())

    print("📚 Generating material and content...")
    data.extend(generate_materials())
    data.extend(generate_files())
    data.extend(generate_youtube_videos())

    print("🧩 Generating quiz and questions...")
    data.extend(generate_quiz())
    data.extend(generate_quiz_questions())

    print("📋 Generating assignment and questions...")
    data.extend(generate_assignment())
    data.extend(generate_assignment_questions())

    print("📊 Generating ARCS questionnaires...")
    data.extend(generate_arcs_questionnaires())
    data.extend(generate_arcs_questions())
    data.extend(generate_arcs_responses())
    data.extend(generate_arcs_answers())
    data.extend(generate_student_motivation_profiles())

    print("📅 Generating attendance data...")
    data.extend(generate_student_attendance())

    # Ensure fixtures directory exists
    os.makedirs("pramlearnapp/fixtures", exist_ok=True)

    print("💾 Writing to file...")
    with open("pramlearnapp/fixtures/initial_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print("✅ DATA GENERATION COMPLETE!")
    print("=" * 50)
    print(f"📊 Total records generated: {len(data)}")
    print("\n📋 Summary:")
    print("  • 1 Admin user")
    print("  • 1 Teacher user")
    print("  • 34 Student users")
    print("  • 1 Class (XII RPL 1)")
    print("  • 1 Subject (Administrasi Sistem Jaringan)")
    print("  • 1 Material (Pengenalan Jaringan Komputer)")
    print("  • 1 PDF file + 2 YouTube videos")
    print("  • 1 Quiz (5 questions)")
    print("  • 1 Assignment (3 questions)")
    print("  • 2 ARCS Questionnaires (Pre & Post)")
    print("  • 40 ARCS Questions (20 each)")
    print("  • 34 ARCS Responses (all students completed pre-learning)")
    print("  • 680 ARCS Answers (34 students × 20 questions)")
    print("  • 34 Student motivation profiles")
    print("  • 34 Attendance records")
    print("\n🎯 All students have completed ARCS pre-learning questionnaire")
    print("📝 No students have completed quiz or assignment yet")
    print("📁 File saved to: pramlearnapp/fixtures/initial_data.json")
    print("\n🚀 Ready for loading with: python manage.py loaddata initial_data")


if __name__ == "__main__":
    main()
