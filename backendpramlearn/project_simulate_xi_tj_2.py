import os
import django
import json
import random
from django.utils.text import slugify
from faker import Faker
from datetime import datetime, timedelta
import logging
import string

logging.getLogger("faker.factory").setLevel(logging.ERROR)

# Set up Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()

fake = Faker("id_ID")  # Indonesian locale


def generate_roles():
    """Generate 3 roles"""
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


def generate_random_password(length=5):
    """Generate random password dengan panjang tertentu"""
    characters = string.ascii_lowercase + string.digits
    return "".join(random.choice(characters) for _ in range(length))


def generate_users():
    """Generate 1 admin, 1 teacher, 36 students"""
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
                "date_joined": "2024-01-01T00:00:00Z",
            },
        }
    )

    # 1 Teacher - Updated with new name and username
    users.append(
        {
            "model": "pramlearnapp.customuser",
            "pk": 2,
            "fields": {
                "username": "rehanseekap",
                "password": "pbkdf2_sha256$600000$dummy$dummy",
                "email": "rehanseekap@pramlearn.com",
                "first_name": "Raihan Syeka",
                "last_name": "Pramukastie",
                "role": 2,
                "is_staff": False,
                "is_superuser": False,
                "is_active": True,
                "is_online": False,
                "last_activity": None,
                "date_joined": "2024-01-01T00:00:00Z",
            },
        }
    )

    # 36 Students from XI TJ 2.csv
    students_data = [
        ("ahmad_d_f", "Ahmad Dhani", "Firmansyah"),
        ("ahmad_f_k", "Ahmad Faza", "Kurniawan"),
        ("aisyah_n_a", "Aisyah Nur", "Azizah"),
        ("alifia_p_r", "Alifia Putri", "Rahmadani"),
        ("alika_n", "Alika", "Nuraini"),
        ("ananda_a_r", "Ananda Aurellia", "Rahma"),
        ("angga_p_s", "Angga Prasetyo", "Saputro"),
        ("aqila_n_r", "Aqila Najwa", "Rahmadhani"),
        ("archelsea_d_p", "Archelsea Dwi", "Pangestu"),
        ("ardiansyah_e_p", "Ardiansyah Eka", "Prasetya"),
        ("arief_r", "Arief", "Rahman"),
        ("arkan_a_p", "Arkan Altaaf", "Prasetyo"),
        ("arsya_a_w", "Arsya Aditya", "Wardana"),
        ("aulia_n", "Aulia", "Nuraini"),
        ("bagas_d_w", "Bagas Dwi", "Waskito"),
        ("cahya_a_f", "Cahya Ahmad", "Fauzi"),
        ("davin_p_w", "Davin Putra", "Winarno"),
        ("desta_a_s", "Desta Aditya", "Saputra"),
        ("devi_k_s", "Devi Kurnia", "Safitri"),
        ("devita_a", "Devita", "Anggraini"),
        ("dimas_a_s", "Dimas Adji", "Saputro"),
        ("dinda_a", "Dinda", "Ayunda"),
        ("dwi_a_p", "Dwi Agung", "Prasetyo"),
        ("erik_s", "Erik", "Saputra"),
        ("fadli_a_r", "Fadli Akbar", "Ramadhan"),
        ("fahmi_a", "Fahmi", "Aziz"),
        ("fatkhur_r_s", "Fatkhur Rozaq", "Saputra"),
        ("fauzan_a_a", "Fauzan Adhima", "Akbar"),
        ("febi_k", "Febi", "Kristanti"),
        ("fernando_y_s", "Fernando Yoga", "Saputra"),
        ("hafiz_a_s", "Hafiz Adi", "Saputra"),
        ("imam_s", "Imam", "Syaifullah"),
        ("kevin_a_p", "Kevin Aditya", "Pratama"),
        ("kevin_e_p", "Kevin Eka", "Prastyawan"),
        ("m_dafik_a_k", "Moch. Dafik Ardiansyah", "K."),
        ("m_farrel_a_p", "Muhamad Farrel Aditya", "Putra"),
    ]

    # Generate random passwords dan print untuk referensi
    print("\n📝 STUDENT LOGIN CREDENTIALS:")
    print("=" * 50)
    student_passwords = {}

    for i, (username, first_name, last_name) in enumerate(students_data, 3):
        # Generate random password 5 karakter
        random_password = generate_random_password(5)
        student_passwords[username] = random_password

        # Print credentials for reference
        print(f"Username: {username:<20} Password: {random_password}")

        users.append(
            {
                "model": "pramlearnapp.customuser",
                "pk": i,
                "fields": {
                    "username": username,
                    "password": "pbkdf2_sha256$600000$dummy$dummy",  # Will be changed via management command
                    "email": f"{username}@pramlearn.com",
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": 3,
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True,
                    "is_online": False,
                    "last_activity": None,
                    "date_joined": "2024-01-01T00:00:00Z",
                },
            }
        )

    # Save passwords to file for reference
    with open("student_passwords.txt", "w", encoding="utf-8") as f:
        f.write("STUDENT LOGIN CREDENTIALS - XI TJ 2\n")
        f.write("=" * 50 + "\n")
        for username, password in student_passwords.items():
            f.write(f"Username: {username:<20} Password: {password}\n")

    print("=" * 50)
    print("💾 Passwords saved to: student_passwords.txt")

    return users


def generate_classes():
    """Generate 1 class: XI TJ 2"""
    return [
        {
            "model": "pramlearnapp.class",
            "pk": 1,
            "fields": {
                "name": "XI TJ 2",
                "slug": "xi-tj-2",
            },
        }
    ]


def generate_subject_classes():
    """Generate 1 subject class relationship - HARUS DIBUAT DULU"""
    return [
        {
            "model": "pramlearnapp.subjectclass",
            "pk": 1,
            "fields": {
                "subject": None,  # Akan diisi setelah Subject dibuat
                "class_id": 1,
                "teacher": 2,
            },
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
                "subject_class": 1,  # Merujuk ke SubjectClass yang sudah dibuat
            },
        }
    ]


def generate_subject_class_update():
    """Update SubjectClass dengan Subject ID yang sudah ada"""
    return [
        {
            "model": "pramlearnapp.subjectclass",
            "pk": 1,
            "fields": {
                "subject": 1,  # Sekarang merujuk ke Subject yang sudah ada
                "class_id": 1,
                "teacher": 2,
            },
        }
    ]


def generate_class_students():
    """Generate 36 class student relationships"""
    class_students = []
    for i in range(36):
        class_students.append(
            {
                "model": "pramlearnapp.classstudent",
                "pk": i + 1,
                "fields": {
                    "student": i + 3,  # Student IDs start from 3
                    "class_id": 1,
                },
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
                "subject": 1,
                "slug": "pengenalan-jaringan-komputer",
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z",
            },
        }
    ]


def generate_youtube_videos():
    """Generate 3 YouTube videos for material"""
    videos = [
        "https://www.youtube.com/watch?v=MIWbGhug-HA",
        "https://www.youtube.com/watch?v=3QhU9jd03a0",
        "https://www.youtube.com/watch?v=AEaKrq3SpW8",
    ]

    youtube_videos = []
    for i, url in enumerate(videos, 1):
        youtube_videos.append(
            {
                "model": "pramlearnapp.materialyoutubevideo",
                "pk": i,
                "fields": {
                    "material": 1,
                    "url": url,
                },
            }
        )
    return youtube_videos


def parse_soal_file():
    """Parse soal.txt and process questions with correct answer = e"""
    questions = []

    try:
        with open("Soal.txt", "r", encoding="utf-8") as f:
            content = f.read()

        # Split by lines and process
        lines = content.strip().split("\n")

        current_question = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if line starts with a number (new question)
            if line and line[0].isdigit() and ". " in line:
                # Save previous question
                if (
                    current_question
                    and current_question.get("text")
                    and current_question.get("choices")
                ):
                    questions.append(current_question)

                # Start new question
                current_question = {
                    "text": line.split(". ", 1)[1],
                    "choices": {},
                    "correct_answer": None,
                }
            elif line.startswith(("a. ", "b. ", "c. ", "d. ", "e. ")):
                if current_question is not None:
                    choice_letter = line[0].upper()
                    choice_text = line[3:]
                    current_question["choices"][choice_letter] = choice_text
            elif line.startswith("correct answer = "):
                if current_question is not None:
                    current_question["correct_answer"] = line.split("= ")[1].upper()

        # Add last question
        if (
            current_question
            and current_question.get("text")
            and current_question.get("choices")
        ):
            questions.append(current_question)

    except FileNotFoundError:
        print("⚠️  Soal.txt not found, generating sample questions instead")
        return generate_sample_questions()
    except Exception as e:
        print(f"⚠️  Error parsing Soal.txt: {e}, generating sample questions instead")
        return generate_sample_questions()

    # Process questions with correct answer = E
    processed_questions = []
    for q in questions:
        if q.get("correct_answer") == "E":
            # Remove option E
            if "E" in q["choices"]:
                del q["choices"]["E"]

            # Randomly remove one more option and update correct answer
            remaining_options = [k for k in q["choices"].keys() if k != "E"]
            if len(remaining_options) > 3:
                # Remove one random option
                to_remove = random.choice(remaining_options)
                del q["choices"][to_remove]
                remaining_options.remove(to_remove)

            # Set new correct answer
            if remaining_options:
                q["correct_answer"] = random.choice(remaining_options)
            else:
                q["correct_answer"] = "A"  # fallback

        processed_questions.append(q)

    if not processed_questions:
        print(
            "⚠️  No valid questions found in Soal.txt, generating sample questions instead"
        )
        return generate_sample_questions()

    return processed_questions


def generate_sample_questions():
    """Generate sample questions if Soal.txt not found"""
    sample_questions = [
        {
            "text": "Apa yang dimaksud dengan jaringan komputer?",
            "choices": {
                "A": "Sekumpulan komputer yang terhubung",
                "B": "Sistem operasi khusus",
                "C": "Program antivirus",
                "D": "Perangkat keras komputer",
            },
            "correct_answer": "A",
        },
        {
            "text": "Protokol yang digunakan untuk mengirim email adalah?",
            "choices": {"A": "HTTP", "B": "FTP", "C": "SMTP", "D": "TCP"},
            "correct_answer": "C",
        },
        # Add more sample questions...
    ]

    # Generate more questions to reach 60 total
    for i in range(3, 61):
        sample_questions.append(
            {
                "text": f"Pertanyaan jaringan komputer nomor {i}?",
                "choices": {
                    "A": f"Opsi A untuk soal {i}",
                    "B": f"Opsi B untuk soal {i}",
                    "C": f"Opsi C untuk soal {i}",
                    "D": f"Opsi D untuk soal {i}",
                },
                "correct_answer": random.choice(["A", "B", "C", "D"]),
            }
        )

    return sample_questions


def generate_quiz():
    """Generate 3 quizzes"""
    quizzes = [
        {
            "model": "pramlearnapp.quiz",
            "pk": 1,
            "fields": {
                "material": 1,
                "title": "Instrumen Soal Jaringan Komputer",
                "content": "Kuis komprehensif tentang konsep dasar jaringan komputer",
                "created_at": "2025-07-01T10:00:00Z",
                "is_group_quiz": True,
                "end_time": "2025-08-02T23:59:59Z",
                "slug": "instrumen-soal-jaringan-komputer",
                "duration": 120,
                "is_active": True,
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 2,
            "fields": {
                "material": 1,
                "title": "Konsep Dasar Jaringan",
                "content": "Evaluasi pemahaman konsep dasar jaringan komputer",
                "created_at": "2025-07-01T11:00:00Z",
                "is_group_quiz": True,
                "end_time": "2025-08-02T23:59:59Z",
                "slug": "konsep-dasar-jaringan",
                "duration": 60,
                "is_active": True,
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 3,
            "fields": {
                "material": 1,
                "title": "Perangkat dan Protokol Jaringan",
                "content": "Evaluasi pemahaman perangkat dan protokol jaringan",
                "created_at": "2025-07-01T12:00:00Z",
                "is_group_quiz": True,
                "end_time": "2025-08-02T23:59:59Z",
                "slug": "perangkat-dan-protokol-jaringan",
                "duration": 60,
                "is_active": True,
            },
        },
    ]

    return quizzes


def generate_quiz_questions():
    """Generate questions for all quizzes"""
    questions = parse_soal_file()
    quiz_questions = []
    question_id = 1

    print(f"📝 Parsed {len(questions)} questions from file")

    # Ensure we have enough questions
    if len(questions) < 60:
        print("⚠️  Not enough questions, duplicating some questions...")
        # Duplicate questions to reach at least 60
        while len(questions) < 60:
            questions.extend(questions[: min(len(questions), 60 - len(questions))])

    # Quiz 1: First 54 questions from soal.txt
    quiz1_questions = questions[:54] if len(questions) >= 54 else questions
    for i, q in enumerate(quiz1_questions, 1):
        quiz_questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 1,
                    "text": q["text"],
                    "choice_a": q["choices"].get("A", ""),
                    "choice_b": q["choices"].get("B", ""),
                    "choice_c": q["choices"].get("C", ""),
                    "choice_d": q["choices"].get("D", ""),
                    "correct_choice": q["correct_answer"],
                },
            }
        )
        question_id += 1

    # Quiz 2: Next 10 questions
    quiz2_start = min(40, len(questions))
    quiz2_end = min(50, len(questions))
    quiz2_questions = (
        questions[quiz2_start:quiz2_end]
        if len(questions) > quiz2_start
        else questions[:10]
    )

    for i, q in enumerate(quiz2_questions, 1):
        quiz_questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 2,
                    "text": q["text"],
                    "choice_a": q["choices"].get("A", ""),
                    "choice_b": q["choices"].get("B", ""),
                    "choice_c": q["choices"].get("C", ""),
                    "choice_d": q["choices"].get("D", ""),
                    "correct_choice": q["correct_answer"],
                },
            }
        )
        question_id += 1

    # Quiz 3: Last 10 questions
    quiz3_start = min(50, len(questions))
    quiz3_questions = (
        questions[quiz3_start : quiz3_start + 10]
        if len(questions) > quiz3_start
        else questions[-10:]
    )

    for i, q in enumerate(quiz3_questions, 1):
        quiz_questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 3,
                    "text": q["text"],
                    "choice_a": q["choices"].get("A", ""),
                    "choice_b": q["choices"].get("B", ""),
                    "choice_c": q["choices"].get("C", ""),
                    "choice_d": q["choices"].get("D", ""),
                    "correct_choice": q["correct_answer"],
                },
            }
        )
        question_id += 1

    return quiz_questions


def generate_assignment():
    """Generate 2 assignments"""
    return [
        {
            "model": "pramlearnapp.assignment",
            "pk": 1,
            "fields": {
                "material": 1,
                "title": "Analisis Jaringan Dasar",
                "description": "Tugas analisis konsep dasar jaringan komputer dan implementasinya",
                "due_date": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T13:00:00Z",
                "updated_at": "2025-07-01T13:00:00Z",
                "slug": "analisis-jaringan-dasar",
            },
        },
        {
            "model": "pramlearnapp.assignment",
            "pk": 2,
            "fields": {
                "material": 1,
                "title": "Perancangan Jaringan Sederhana",
                "description": "Tugas merancang topologi jaringan sederhana untuk kebutuhan spesifik",
                "due_date": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T14:00:00Z",
                "updated_at": "2025-07-01T14:00:00Z",
                "slug": "perancangan-jaringan-sederhana",
            },
        },
    ]


def generate_assignment_questions():
    """Generate questions for assignments"""
    assignment_questions = []
    question_id = 1

    # Assignment 1: 10 questions
    for i in range(1, 11):
        assignment_questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 1,
                    "text": f"Pertanyaan analisis jaringan dasar nomor {i}. Jelaskan konsep dan implementasinya.",
                    "explanation": f"Penjelasan untuk soal nomor {i}",
                    "choice_a": f"Opsi A untuk soal analisis {i}",
                    "choice_b": f"Opsi B untuk soal analisis {i}",
                    "choice_c": f"Opsi C untuk soal analisis {i}",
                    "choice_d": f"Opsi D untuk soal analisis {i}",
                    "correct_choice": random.choice(["A", "B", "C", "D"]),
                },
            }
        )
        question_id += 1

    # Assignment 2: 10 questions
    for i in range(1, 11):
        assignment_questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 2,
                    "text": f"Pertanyaan perancangan jaringan nomor {i}. Bagaimana merancang solusi yang tepat?",
                    "explanation": f"Penjelasan untuk soal perancangan {i}",
                    "choice_a": f"Opsi A untuk soal perancangan {i}",
                    "choice_b": f"Opsi B untuk soal perancangan {i}",
                    "choice_c": f"Opsi C untuk soal perancangan {i}",
                    "choice_d": f"Opsi D untuk soal perancangan {i}",
                    "correct_choice": random.choice(["A", "B", "C", "D"]),
                },
            }
        )
        question_id += 1

    return assignment_questions


def generate_arcs_questionnaires():
    """Generate 1 ARCS questionnaire"""
    return [
        {
            "model": "pramlearnapp.arcsquestionnaire",
            "pk": 1,
            "fields": {
                "material": 1,
                "title": "Evaluasi Motivasi Pembelajaran",
                "description": "Kuesioner untuk mengukur tingkat motivasi siswa dalam pembelajaran jaringan komputer menggunakan model ARCS",
                "questionnaire_type": "pre",
                "is_active": True,
                "start_date": "2025-07-01T08:00:00Z",
                "end_date": "2025-08-02T23:59:59Z",
                "duration_minutes": 30,
                "created_by": 2,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "slug": "evaluasi-motivasi-pembelajaran-pre",
            },
        }
    ]


def generate_arcs_questions():
    """Generate 20 ARCS questions based on arcs.txt"""
    arcs_questions_text = [
        # Attention (1-5)
        "Cara guru memulai pelajaran dan menyajikan materi ini menarik perhatian saya.",
        "Penggunaan analogi dan contoh-contoh (seperti restoran atau lalu lintas) membuat saya lebih tertarik untuk memahami materi jaringan.",
        "Variasi kegiatan belajar (penjelasan guru, diskusi tim, dan kuis di LMS) membuat saya tidak merasa bosan.",
        "Topik tentang cara kerja jaringan komputer adalah sesuatu yang baru dan membuat saya penasaran.",
        "Secara keseluruhan, pembelajaran ini disajikan dengan cara yang tidak monoton dan mampu menjaga fokus saya.",
        # Relevance (6-10)
        "Materi tentang jaringan komputer ini terasa bermanfaat karena berhubungan langsung dengan cara saya menggunakan internet setiap hari.",
        "Saya merasa bahwa mempelajari konsep dasar jaringan ini sangat penting untuk karir saya di bidang TKJ di masa depan.",
        "Saya bisa melihat hubungan antara materi yang diajarkan dengan hobi atau minat saya (misalnya, bermain game online).",
        "Tujuan pembelajaran yang disampaikan di awal pelajaran terasa sesuai dengan apa yang ingin saya ketahui.",
        "Keterampilan dalam merancang jaringan dasar yang diajarkan adalah keterampilan yang berguna dan bisa saya pakai nantinya.",
        # Confidence (11-15)
        "Saya merasa tujuan pembelajaran yang harus dicapai dalam pertemuan ini cukup jelas dan saya tahu apa yang diharapkan dari saya.",
        "Meskipun materinya teknis, penjelasan yang diberikan membuat saya merasa yakin bisa memahaminya.",
        "Saya percaya bahwa tim saya dan saya bisa mengerjakan kuis kolaboratif di LMS dengan baik setelah mempelajari materi.",
        "Tingkat kesulitan materi dan soal-soal yang ada terasa pas, tidak terlalu mudah dan tidak terlalu sulit.",
        "Setelah berdiskusi dengan tim, saya merasa lebih percaya diri dengan pemahaman saya tentang materi ini.",
        # Satisfaction (16-20)
        "Saya merasa senang dan puas ketika saya berhasil memahami sebuah konsep yang sulit, seperti perbedaan antara Switch dan Router.",
        "Saya merasa usaha yang saya dan tim saya lakukan selama diskusi dan belajar sepadan dengan hasil yang kami dapatkan.",
        "Bekerja sama dengan teman satu tim untuk menjawab kuis adalah pengalaman belajar yang menyenangkan.",
        "Saya merasa penilaian melalui kuis kelompok ini adil karena mencerminkan pemahaman bersama tim kami.",
        "Secara keseluruhan, saya puas dengan pengetahuan dan keterampilan yang saya peroleh dari sesi pembelajaran ini.",
    ]

    dimensions = (
        ["attention"] * 5
        + ["relevance"] * 5
        + ["confidence"] * 5
        + ["satisfaction"] * 5
    )

    questions = []
    for i, (text, dimension) in enumerate(zip(arcs_questions_text, dimensions), 1):
        questions.append(
            {
                "model": "pramlearnapp.arcsquestion",
                "pk": i,
                "fields": {
                    "questionnaire": 1,
                    "text": text,
                    "dimension": dimension,
                    "question_type": "likert_5",
                    "order": i,
                    "is_required": True,
                    "choice_a": None,
                    "choice_b": None,
                    "choice_c": None,
                    "choice_d": None,
                    "choice_e": None,
                    "scale_min": 1,
                    "scale_max": 5,
                    "scale_label_min": "Sangat Tidak Setuju",
                    "scale_label_max": "Sangat Setuju",
                    "created_at": "2025-07-01T08:00:00Z",
                    "updated_at": "2025-07-01T08:00:00Z",
                },
            }
        )

    return questions


def generate_student_attendance():
    """Generate student attendance for all 36 students"""
    attendance_records = []
    statuses = ["present", "absent", "late", "excused"]
    weights = [70, 15, 10, 5]  # 70% present, 15% absent, 10% late, 5% excused

    for i in range(36):
        student_id = i + 3  # Student IDs start from 3
        status = random.choices(statuses, weights=weights)[0]

        attendance_records.append(
            {
                "model": "pramlearnapp.studentattendance",
                "pk": i + 1,
                "fields": {
                    "student": student_id,
                    "material": 1,
                    "status": status,
                    "updated_at": "2025-07-01T09:00:00Z",
                    "updated_by": 2,  # Teacher ID
                },
            }
        )

    return attendance_records


def main():
    """Main function to generate comprehensive initial data"""
    print("🚀 Generating PramLearn Simulation Data")
    print("=" * 50)

    data = []

    print("📝 Generating basic data...")
    data.extend(generate_roles())
    data.extend(generate_users())
    data.extend(generate_classes())

    # URUTAN PENTING: SubjectClass dulu, baru Subject
    print("🔗 Generating subject class relationships...")
    data.extend(generate_subject_classes())

    print("📖 Generating subjects...")
    data.extend(generate_subjects())

    # Update SubjectClass dengan Subject ID
    print("🔄 Updating subject class relationships...")
    data.extend(generate_subject_class_update())

    data.extend(generate_class_students())

    print("📚 Generating material and content...")
    data.extend(generate_materials())
    data.extend(generate_youtube_videos())

    print("🧩 Generating quizzes...")
    data.extend(generate_quiz())
    data.extend(generate_quiz_questions())

    print("📋 Generating assignments...")
    data.extend(generate_assignment())
    data.extend(generate_assignment_questions())

    print("📊 Generating ARCS questionnaire...")
    data.extend(generate_arcs_questionnaires())
    data.extend(generate_arcs_questions())

    # Ensure fixtures directory exists
    os.makedirs("pramlearnapp/fixtures", exist_ok=True)

    print("💾 Writing to file...")
    with open(
        "pramlearnapp/fixtures/initial_data_xi_tj_1.json", "w", encoding="utf-8"
    ) as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print("✅ DATA GENERATION COMPLETE!")
    print("=" * 50)
    print(f"📊 Total records generated: {len(data)}")
    print("\n📋 Summary:")
    print("  • 1 Admin user")
    print("  • 1 Teacher user (Raihan Syeka Pramukastie)")
    print("  • 36 Student users (from XI TJ 1.csv)")
    print("  • 1 Class (XI TJ 1)")
    print("  • 1 Subject (Administrasi Sistem Jaringan)")
    print("  • 1 Material (Pengenalan Jaringan Komputer)")
    print("  • 1 PDF file + 3 YouTube videos")
    print("  • 3 Individual quizzes (BELUM DIKERJAKAN)")
    print("    - Quiz 1: Instrumen Soal Jaringan Komputer (54 soal)")
    print("    - Quiz 2: Konsep Dasar Jaringan (10 soal)")
    print("    - Quiz 3: Perangkat dan Protokol Jaringan (10 soal)")
    print("  • 2 Assignments (BELUM DIKERJAKAN)")
    print("    - Assignment 1: Analisis Jaringan Dasar (10 soal)")
    print("    - Assignment 2: Perancangan Jaringan Sederhana (10 soal)")
    print("  • 1 ARCS pre-assessment (20 pertanyaan)")
    print("\n⚠️  CATATAN:")
    print("  • Quiz belum dikerjakan siswa")
    print("  • Assignment belum dikerjakan siswa")
    print("  • Group belum dibentuk")
    print("  • ARCS responses belum dibuat")
    print("  • Student motivation profiles belum dibuat")
    print("  • Attendance records TIDAK DIBUAT (biarkan default)")
    print("  • Semua deadline: 2 Agustus 2025")
    print(
        "\n🎉 Ready to load with: python manage.py loaddata pramlearnapp/fixtures/initial_data_xi_tj_1.json"
    )


if __name__ == "__main__":
    main()
