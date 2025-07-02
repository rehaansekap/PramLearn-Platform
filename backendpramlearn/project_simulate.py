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
    """Generate 5 group quizzes with deadline 2 Agustus 2025"""
    quizzes = [
        {
            "model": "pramlearnapp.quiz",
            "pk": 1,
            "fields": {
                "title": "Quiz 1: Pengenalan Jaringan Komputer",
                "slug": "quiz-1-pengenalan-jaringan-komputer",
                "content": "Quiz kelompok tentang pengenalan dasar jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 30,
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 2,
            "fields": {
                "title": "Quiz 2: Topologi Jaringan",
                "slug": "quiz-2-topologi-jaringan",
                "content": "Quiz kelompok tentang berbagai jenis topologi jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 35,
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 3,
            "fields": {
                "title": "Quiz 3: Protokol Jaringan",
                "slug": "quiz-3-protokol-jaringan",
                "content": "Quiz kelompok tentang protokol-protokol dalam jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 40,
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 4,
            "fields": {
                "title": "Quiz 4: Perangkat Jaringan",
                "slug": "quiz-4-perangkat-jaringan",
                "content": "Quiz kelompok tentang perangkat-perangkat jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 25,
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 5,
            "fields": {
                "title": "Quiz 5: Keamanan Jaringan",
                "slug": "quiz-5-keamanan-jaringan",
                "content": "Quiz kelompok tentang keamanan dalam jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 45,
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.quiz",
            "pk": 6,  # Quiz baru dengan ID 6
            "fields": {
                "title": "Quiz 6: Instrument Soal",
                "slug": "quiz-6-instrument-soal",
                "content": "Quiz kelompok komprehensif dengan 30 soal tentang jaringan komputer",
                "material": 1,
                "is_active": True,
                "is_group_quiz": True,
                "duration": 60,  # 60 menit untuk 30 soal
                "end_time": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T08:00:00Z",
            },
        },
    ]
    return quizzes


def generate_quiz_questions():
    """Generate quiz questions for all 5 quizzes"""
    questions = []
    question_id = 1

    # Quiz 1: Pengenalan Jaringan Komputer (8 questions)
    quiz1_questions = [
        (
            "Apa yang dimaksud dengan jaringan komputer?",
            "Kumpulan komputer yang terhubung untuk berbagi data",
            "Program untuk mengakses internet",
            "Perangkat keras komputer",
            "Sistem operasi komputer",
            "A",
        ),
        (
            "Apa keuntungan utama dari jaringan komputer?",
            "Menghemat listrik",
            "Berbagi sumber daya dan data",
            "Membuat komputer lebih cepat",
            "Mengurangi virus",
            "B",
        ),
        (
            "Jaringan yang mencakup area geografis luas disebut?",
            "LAN",
            "MAN",
            "WAN",
            "PAN",
            "C",
        ),
        (
            "Komponen dasar jaringan komputer meliputi?",
            "Hardware, software, protokol",
            "Monitor, keyboard, mouse",
            "CPU, RAM, storage",
            "Input, process, output",
            "A",
        ),
        (
            "Media transmisi kabel yang paling umum adalah?",
            "Fiber optic",
            "UTP",
            "Coaxial",
            "Wireless",
            "B",
        ),
        (
            "Kecepatan transfer data diukur dalam satuan?",
            "Hertz",
            "Watt",
            "bps",
            "dB",
            "C",
        ),
        (
            "Jaringan peer-to-peer memiliki karakteristik?",
            "Ada server pusat",
            "Tidak ada server pusat",
            "Hanya untuk internet",
            "Khusus untuk game",
            "B",
        ),
        (
            "Model jaringan client-server memiliki keunggulan?",
            "Tidak butuh admin",
            "Keamanan terpusat",
            "Biaya murah",
            "Setup mudah",
            "B",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz1_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 1,
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Quiz 2: Topologi Jaringan (7 questions)
    quiz2_questions = [
        (
            "Topologi jaringan yang membentuk lingkaran adalah?",
            "Star",
            "Bus",
            "Ring",
            "Mesh",
            "C",
        ),
        (
            "Topologi star memiliki karakteristik?",
            "Semua node terhubung langsung",
            "Ada node pusat",
            "Bentuk lingkaran",
            "Tidak ada kabel",
            "B",
        ),
        (
            "Kelemahan topologi bus adalah?",
            "Biaya mahal",
            "Sulit troubleshooting",
            "Butuh banyak kabel",
            "Kecepatan lambat",
            "B",
        ),
        (
            "Topologi yang paling fault-tolerant adalah?",
            "Bus",
            "Star",
            "Ring",
            "Mesh",
            "D",
        ),
        (
            "Hybrid topology merupakan kombinasi dari?",
            "Dua atau lebih topologi",
            "Hardware dan software",
            "Kabel dan wireless",
            "Server dan client",
            "A",
        ),
        (
            "Topologi tree memiliki struktur?",
            "Lingkaran",
            "Bintang",
            "Hierarkis",
            "Acak",
            "C",
        ),
        (
            "Topologi yang cocok untuk jaringan kecil adalah?",
            "Mesh",
            "Tree",
            "Star",
            "Ring",
            "C",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz2_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 2,
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Quiz 3: Protokol Jaringan (10 questions)
    quiz3_questions = [
        (
            "Protokol yang digunakan untuk transfer file adalah?",
            "HTTP",
            "FTP",
            "SMTP",
            "DNS",
            "B",
        ),
        (
            "TCP/IP bekerja pada layer berapa di model OSI?",
            "Layer 1-2",
            "Layer 3-4",
            "Layer 5-6",
            "Layer 7",
            "B",
        ),
        ("Protokol untuk mengirim email adalah?", "HTTP", "FTP", "SMTP", "POP3", "C"),
        (
            "DHCP berfungsi untuk?",
            "Transfer file",
            "Assign IP address",
            "Web browsing",
            "Email",
            "B",
        ),
        ("Protokol keamanan untuk web adalah?", "HTTP", "HTTPS", "FTP", "SMTP", "B"),
        (
            "DNS berfungsi untuk?",
            "Transfer file",
            "Resolve nama domain",
            "Kirim email",
            "Browse web",
            "B",
        ),
        ("Port default untuk HTTP adalah?", "21", "25", "80", "443", "C"),
        (
            "ICMP digunakan untuk?",
            "Transfer data",
            "Error reporting",
            "Email",
            "File sharing",
            "B",
        ),
        (
            "Protokol untuk sinkronisasi waktu adalah?",
            "NTP",
            "SNMP",
            "TFTP",
            "LDAP",
            "A",
        ),
        (
            "UDP memiliki karakteristik?",
            "Connection-oriented",
            "Connectionless",
            "Reliable",
            "Secure",
            "B",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz3_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 3,
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Quiz 4: Perangkat Jaringan (6 questions)
    quiz4_questions = [
        (
            "Perangkat yang bekerja di Physical Layer adalah?",
            "Router",
            "Switch",
            "Hub",
            "Gateway",
            "C",
        ),
        (
            "Switch bekerja berdasarkan?",
            "IP Address",
            "MAC Address",
            "Port Number",
            "Domain Name",
            "B",
        ),
        (
            "Router berfungsi untuk?",
            "Menghubungkan segmen jaringan",
            "Memperkuat sinyal",
            "Menyimpan data",
            "Mengamankan jaringan",
            "A",
        ),
        (
            "Bridge beroperasi di layer?",
            "Physical",
            "Data Link",
            "Network",
            "Transport",
            "B",
        ),
        (
            "Repeater berfungsi untuk?",
            "Routing",
            "Switching",
            "Memperkuat sinyal",
            "Filtering",
            "C",
        ),
        (
            "Access Point digunakan untuk?",
            "Jaringan kabel",
            "Jaringan wireless",
            "Internet",
            "Email",
            "B",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz4_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 4,
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Quiz 5: Keamanan Jaringan (9 questions)
    quiz5_questions = [
        (
            "Fungsi utama dari firewall adalah?",
            "Mempercepat koneksi",
            "Melindungi dari ancaman",
            "Menyimpan data",
            "Routing paket",
            "B",
        ),
        (
            "Enkripsi digunakan untuk?",
            "Mempercepat data",
            "Mengamankan data",
            "Mengkompresi data",
            "Menyimpan data",
            "B",
        ),
        (
            "VPN kepanjangan dari?",
            "Virtual Private Network",
            "Very Personal Network",
            "Virtual Public Network",
            "Visual Private Network",
            "A",
        ),
        (
            "Antivirus berfungsi untuk?",
            "Mempercepat sistem",
            "Melindungi dari malware",
            "Menghemat memory",
            "Backup data",
            "B",
        ),
        (
            "Intrusion Detection System (IDS) bertugas?",
            "Mencegah serangan",
            "Mendeteksi serangan",
            "Memperbaiki kerusakan",
            "Backup data",
            "B",
        ),
        (
            "Password yang kuat memiliki karakteristik?",
            "Hanya huruf",
            "Hanya angka",
            "Kombinasi huruf, angka, simbol",
            "Nama sendiri",
            "C",
        ),
        (
            "Social engineering adalah?",
            "Teknik programming",
            "Manipulasi psikologis",
            "Desain network",
            "Instalasi software",
            "B",
        ),
        (
            "Backup data sebaiknya dilakukan?",
            "Sebulan sekali",
            "Setahun sekali",
            "Secara berkala",
            "Tidak perlu",
            "C",
        ),
        (
            "Two-factor authentication menambah keamanan dengan?",
            "Password ganda",
            "Dua jenis verifikasi",
            "Dua komputer",
            "Dua jaringan",
            "B",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz5_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 5,
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Quiz 6: Instrument Soal (30 questions)
    quiz6_questions = [
        (
            "Apakah sebutan untuk sekumpulan dua atau lebih perangkat komputasi yang saling terhubung dengan tujuan untuk berbagi data dan sumber daya?",
            "Sistem Operasi",
            "Jaringan Komputer",
            "Topologi",
            "Protokol",
            "B",
        ),
        (
            "Jenis jaringan komputer apakah yang memiliki skala jangkauan paling kecil dan biasanya digunakan untuk menghubungkan perangkat pribadi seperti smartphone dengan headset bluetooth?",
            "LAN",
            "MAN",
            "WAN",
            "PAN",
            "D",
        ),
        (
            "Perangkat keras apakah yang berfungsi untuk menghubungkan dua atau lebih jaringan yang berbeda, seperti menghubungkan LAN ke internet?",
            "Switch",
            "Hub",
            "Router",
            "Repeater",
            "C",
        ),
        (
            "Apakah sebutan untuk alamat fisik unik yang tidak bisa diubah dan menjadi identitas pada setiap kartu jaringan (NIC)?",
            "IP Address",
            "Subnet Mask",
            "Gateway",
            "MAC Address",
            "D",
        ),
        (
            "Apakah nama kumpulan protokol yang menjadi aturan standar untuk komunikasi data di seluruh jaringan internet?",
            "HTTP/FTP",
            "TCP/IP",
            "POP3/SMTP",
            "LAN/WAN",
            "B",
        ),
        (
            "Manakah pernyataan yang paling tepat untuk menjelaskan perbedaan utama antara Hub dan Switch?",
            "Hub lebih cepat dari Switch",
            "Switch mengirimkan data ke semua port, sedangkan Hub hanya ke tujuan",
            "Hub mengirimkan data ke semua port, sedangkan Switch hanya ke port tujuan",
            "Hub digunakan untuk WAN, Switch untuk LAN",
            "C",
        ),
        (
            "Dalam sebuah jaringan nirkabel, apakah fungsi utama dari sebuah Access Point (AP)?",
            "Polisi lalu lintas yang mengatur rute antar jaringan",
            "Jembatan yang menghubungkan perangkat nirkabel ke jaringan kabel",
            "Pustakawan yang menyimpan semua data penting",
            "Satpam yang menjaga keamanan seluruh jaringan",
            "B",
        ),
        (
            "Jaringan komputer yang menghubungkan kantor-kantor cabang sebuah bank di seluruh kota Bandung merupakan contoh implementasi dari jenis jaringan apa?",
            "LAN",
            "MAN",
            "WAN",
            "PAN",
            "B",
        ),
        (
            "Ketika sebuah laboratorium komputer dengan 30 PC dapat menggunakan satu printer secara bersama-sama, manfaat jaringan komputer dalam hal apakah yang ditunjukkan oleh kondisi tersebut?",
            "Keamanan data",
            "Reliabilitas tinggi",
            "Komunikasi efisien",
            "Menghemat biaya dan sumber daya",
            "D",
        ),
        (
            "Manakah situasi yang paling baik dalam mendeskripsikan konsep reliabilitas tinggi dalam sebuah jaringan?",
            "Jaringan memiliki kecepatan internet yang sangat tinggi",
            "Data penting perusahaan disalin secara otomatis ke server cadangan",
            "Semua komputer dalam jaringan menggunakan merek yang sama",
            "Jaringan dapat diakses dari mana saja di seluruh dunia",
            "B",
        ),
        (
            "Anda ditugaskan membangun jaringan di lab komputer dengan 40 PC dan 1 server. Agar komunikasi efisien dan data terkirim ke tujuan yang tepat, perangkat sentral apakah yang paling tepat untuk digunakan?",
            "Hub",
            "Switch",
            "Router",
            "Modem",
            "B",
        ),
        (
            "Sebuah warung internet (warnet) memiliki 10 komputer untuk pelanggan yang semuanya harus bisa mengakses internet dan berbagi data. Jenis jaringan apakah yang paling tepat untuk dibangun di dalam warnet tersebut?",
            "WAN",
            "MAN",
            "PAN",
            "LAN",
            "D",
        ),
        (
            "Saat Anda membuka aplikasi browser dan mengetikkan alamat https://www.google.com/search?q=google.com, komputer atau laptop yang Anda gunakan sedang berperan sebagai apa?",
            "Server",
            "Client",
            "Router",
            "Switch",
            "B",
        ),
        (
            "Sebuah perusahaan multinasional ingin menghubungkan kantor pusat di Jakarta dengan kantor cabang di Singapura dan Kuala Lumpur. Jenis jaringan apakah yang harus mereka bangun?",
            "LAN",
            "MAN",
            "WAN",
            "PAN",
            "C",
        ),
        (
            "Jika Anda diminta untuk menghubungkan 5 komputer dan 1 printer di dalam satu ruangan kantor kecil agar bisa saling berbagi file, jenis jaringan apakah yang sedang Anda bangun?",
            "WAN",
            "MAN",
            "Internet",
            "PAN",
            "E",
        ),
        (
            "Sebuah jaringan LAN dengan 30 komputer yang menggunakan Hub terasa sangat lambat saat banyak pengguna aktif. Apakah penyebab yang paling mungkin dari masalah ini?",
            "Kabel UTP yang digunakan terlalu panjang",
            "Terlalu sering terjadi tabrakan data (collision) karena sifat Hub",
            "Server yang digunakan memiliki spesifikasi rendah",
            "Semua komputer terinfeksi virus yang sama",
            "B",
        ),
        (
            "Dibandingkan dengan kabel UTP, apakah keunggulan utama dari media transmisi Fiber Optic?",
            "Harga yang lebih murah dan instalasi yang mudah",
            "Fleksibilitas dan tidak memerlukan perangkat khusus",
            "Kecepatan transfer data yang jauh lebih tinggi dan tahan interferensi",
            "Ketersediaan yang lebih luas di pasaran",
            "C",
        ),
        (
            """Perhatikan pernyataan berikut:
            - Menghubungkan perangkat dalam satu segmen jaringan lokal.
            - Bekerja menggunakan MAC Address untuk mengirim data.
            - Menentukan rute terbaik untuk mengirim data antar jaringan yang berbeda.
            - Bekerja menggunakan IP Address untuk mengambil keputusan.
            Dari pernyataan tersebut, manakah yang mendeskripsikan peran sebuah Router?""",
            "1 dan 2",
            "2 dan 3",
            "3 dan 4",
            "1 dan 4",
            "C",
        ),
        (
            "Untuk membangun jaringan Wi-Fi di rumah yang dapat terhubung ke internet, kombinasi perangkat minimal apakah yang harus dimiliki?",
            "Switch, Hub, dan Kabel UTP",
            "Modem, Router dengan fitur Wi-Fi/AP, dan NIC pada perangkat client",
            "Server, Client, dan Kabel Fiber Optic",
            "Repeater, Switch, dan Server",
            "B",
        ),
        (
            "Saat menggunakan jaringan Wi-Fi publik di kafe atau bandara, apakah risiko keamanan utama yang harus diwaspadai oleh pengguna?",
            "Kecepatan internet yang menjadi lambat",
            "Baterai perangkat menjadi cepat habis",
            "Potensi pencurian data pribadi oleh pihak ketiga (Man-in-the-Middle Attack)",
            "Perangkat menjadi panas karena terlalu banyak pengguna",
            "C",
        ),
        (
            "Menurut prinsip perancangan jaringan yang baik (Top-Down Network Design), langkah manakah yang paling krusial dan harus ditentukan pertama kali sebelum membeli perangkat?",
            "Memilih merek perangkat yang paling terkenal",
            "Menentukan skema pengalamatan IP Address",
            "Menganalisis kebutuhan bisnis dan teknis dari pengguna",
            "Menggambar topologi fisik jaringan secara detail",
            "C",
        ),
        (
            "Seorang teknisi menyarankan untuk menghubungkan server data penting perusahaan langsung ke internet tanpa pelindung seperti router atau firewall, dengan alasan agar mudah diakses. Mengapa saran ini sangat tidak direkomendasikan?",
            "Akan membuat koneksi server menjadi lambat",
            "Membuat server sangat rentan terhadap serangan langsung dari internet",
            "Akan menghabiskan biaya internet yang sangat mahal",
            "Akan menyulitkan karyawan untuk mengakses server",
            "B",
        ),
        (
            "Sebuah sekolah dengan anggaran terbatas ingin menyediakan koneksi internet untuk 30 komputer di lab. Pilihan media transmisi apakah yang paling realistis dari segi biaya dan kemudahan instalasi?",
            "Fiber Optic",
            "Kabel UTP",
            "Satelit",
            "Bluetooth",
            "B",
        ),
        (
            "Untuk sebuah turnamen e-sports yang menuntut koneksi paling stabil dan latensi (delay) terendah, mengapa penggunaan jaringan kabel (LAN) lebih direkomendasikan daripada Wi-Fi?",
            "Jaringan kabel lebih mudah dipasang daripada Wi-Fi",
            "Jaringan kabel memiliki jangkauan yang lebih luas",
            "Jaringan kabel lebih aman dari peretasan",
            "Jaringan kabel lebih stabil dan minim interferensi gelombang radio",
            "D",
        ),
        (
            "Seorang admin jaringan memutuskan untuk menggunakan Hub daripada Switch untuk jaringan kantor baru dengan 50 komputer dengan alasan harga Hub lebih murah. Dari sudut pandang performa, mengapa keputusan ini kurang tepat?",
            "Hub memerlukan konfigurasi yang lebih rumit",
            "Hub akan menyebabkan traffic jaringan menjadi padat dan lambat",
            "Hub mengonsumsi daya listrik yang lebih besar",
            "Hub tidak kompatibel dengan komputer modern",
            "B",
        ),
        (
            "Anda diminta merancang jaringan untuk acara live streaming di aula sekolah dengan kebutuhan koneksi stabil untuk 3 PC panitia dan koneksi nirkabel untuk tamu. Rancangan manakah yang paling efektif?",
            "Menghubungkan semua perangkat ke satu Hub besar",
            "Menggunakan satu Router Wi-Fi rumahan untuk semua perangkat",
            "Menghubungkan 3 PC panitia ke Switch via kabel, lalu Switch dihubungkan ke Router. Untuk tamu, dipasang Access Point yang juga terhubung ke Router.",
            "Hanya menyediakan koneksi Wi-Fi untuk semua perangkat agar lebih praktis",
            "C",
        ),
        (
            "Sebuah kafe ingin menyediakan Wi-Fi gratis untuk pelanggan dan jaringan terpisah untuk kasir agar transaksi aman. Konfigurasi perangkat apakah yang paling sederhana dan efektif untuk kebutuhan ini?",
            "Memasang dua modem internet yang berbeda",
            "Menggunakan satu modem yang terhubung ke Router yang mendukung fitur Guest Network",
            "Menghubungkan kasir dan pelanggan ke satu Switch yang sama",
            "Memasang banyak Repeater di seluruh area kafe",
            "B",
        ),
        (
            "Jaringan di sebuah sekolah seringkali lambat pada jam istirahat karena banyak siswa mengakses video. Usulan teknis apakah yang paling logis untuk diajukan guna mengatasi masalah ini?",
            "Mengurangi jumlah komputer di sekolah",
            "Mematikan jaringan pada jam istirahat",
            "Meningkatkan paket bandwidth internet dan memasang sistem manajemen bandwidth (QoS)",
            "Mengganti semua komputer dengan laptop",
            "C",
        ),
        (
            "Untuk melindungi data penting pada file server di sebuah kantor kecil dari risiko kerusakan hard disk, strategi backup data paling dasar apakah yang bisa Anda usulkan?",
            "Menyimpan semua data hanya di server tanpa backup",
            "Meminta setiap karyawan menyimpan data di komputernya masing-masing",
            "Menjadwalkan backup otomatis setiap malam ke hard disk eksternal atau cloud storage",
            "Mencetak semua data penting setiap hari",
            "C",
        ),
        (
            "Anda diminta membuat 3 aturan kebijakan keamanan paling dasar untuk jaringan Wi-Fi di rumah. Kombinasi kebijakan manakah yang paling efektif?",
            "Membiarkan nama Wi-Fi default, tanpa password, dan menyala 24 jam",
            "Mengganti nama Wi-Fi (SSID), menggunakan password WPA2/WPA3 yang kuat, dan mematikan fitur WPS",
            "Memberitahu password Wi-Fi ke semua tetangga",
            "Menggunakan password yang mudah diingat seperti 12345678",
            "B",
        ),
    ]

    for i, (text, choice_a, choice_b, choice_c, choice_d, correct) in enumerate(
        quiz6_questions
    ):
        questions.append(
            {
                "model": "pramlearnapp.question",
                "pk": question_id,
                "fields": {
                    "quiz": 6,  # Quiz ID 6
                    "text": text,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    return questions


def generate_assignment():
    """Generate 5 assignments with deadline 2 Agustus 2025"""
    assignments = [
        {
            "model": "pramlearnapp.assignment",
            "pk": 1,
            "fields": {
                "title": "Assignment 1: Analisis Konsep Jaringan Komputer",
                "slug": "assignment-1-analisis-konsep-jaringan-komputer",
                "description": "Tugas untuk menganalisis konsep dasar jaringan komputer dan implementasinya",
                "material": 1,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "due_date": "2025-08-02T23:59:59Z",
            },
        },
        {
            "model": "pramlearnapp.assignment",
            "pk": 2,
            "fields": {
                "title": "Assignment 2: Desain Topologi Jaringan",
                "slug": "assignment-2-desain-topologi-jaringan",
                "description": "Tugas merancang topologi jaringan untuk kebutuhan organisasi",
                "material": 1,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "due_date": "2025-08-02T23:59:59Z",
            },
        },
        {
            "model": "pramlearnapp.assignment",
            "pk": 3,
            "fields": {
                "title": "Assignment 3: Konfigurasi Protokol Jaringan",
                "slug": "assignment-3-konfigurasi-protokol-jaringan",
                "description": "Tugas praktik konfigurasi protokol jaringan",
                "material": 1,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "due_date": "2025-08-02T23:59:59Z",
            },
        },
        {
            "model": "pramlearnapp.assignment",
            "pk": 4,
            "fields": {
                "title": "Assignment 4: Evaluasi Perangkat Jaringan",
                "slug": "assignment-4-evaluasi-perangkat-jaringan",
                "description": "Tugas evaluasi dan pemilihan perangkat jaringan yang tepat",
                "material": 1,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "due_date": "2025-08-02T23:59:59Z",
            },
        },
        {
            "model": "pramlearnapp.assignment",
            "pk": 5,
            "fields": {
                "title": "Assignment 5: Implementasi Keamanan Jaringan",
                "slug": "assignment-5-implementasi-keamanan-jaringan",
                "description": "Tugas implementasi strategi keamanan jaringan komputer",
                "material": 1,
                "created_at": "2025-07-01T08:00:00Z",
                "updated_at": "2025-07-01T08:00:00Z",
                "due_date": "2025-08-02T23:59:59Z",
            },
        },
    ]
    return assignments


def generate_assignment_questions():
    """Generate assignment questions for all 5 assignments"""
    questions = []
    question_id = 1

    # Assignment 1: Analisis Konsep Jaringan Komputer (4 questions)
    assignment1_questions = [
        (
            "Jelaskan perbedaan antara LAN, MAN, dan WAN beserta contoh implementasinya masing-masing!",
            "Pertanyaan essay tentang klasifikasi jaringan berdasarkan geografis",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Apa keuntungan dan kerugian dari model jaringan peer-to-peer dibandingkan dengan client-server?",
            "Analisis perbandingan model jaringan",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Manakah yang termasuk komponen hardware dalam jaringan komputer?",
            "Pertanyaan pilihan ganda tentang komponen jaringan",
            "NIC, Kabel, Switch",
            "Software, Driver, OS",
            "Protocol, TCP/IP, HTTP",
            "Database, File, Folder",
            "A",
        ),
        (
            "Sebutkan dan jelaskan 3 faktor yang mempengaruhi performa jaringan komputer!",
            "Pertanyaan essay tentang faktor performa jaringan",
            None,
            None,
            None,
            None,
            None,
        ),
    ]

    for i, (
        text,
        explanation,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct,
    ) in enumerate(assignment1_questions):
        questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 1,
                    "text": text,
                    "explanation": explanation,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Assignment 2: Desain Topologi Jaringan (5 questions)
    assignment2_questions = [
        (
            "Buatlah diagram topologi jaringan star untuk kantor dengan 20 komputer dan jelaskan keunggulannya!",
            "Tugas menggambar dan analisis topologi star",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Topologi mana yang paling cocok untuk jaringan dengan kebutuhan high availability?",
            "Pertanyaan pilihan ganda tentang topologi untuk high availability",
            "Bus",
            "Ring",
            "Star",
            "Mesh",
            "D",
        ),
        (
            "Analisis biaya implementasi topologi bus vs star untuk 15 komputer!",
            "Pertanyaan analisis biaya implementasi",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Apa yang terjadi jika central hub pada topologi star mengalami kerusakan?",
            "Pertanyaan pilihan ganda tentang single point of failure",
            "Hanya 1 komputer mati",
            "Setengah jaringan mati",
            "Seluruh jaringan mati",
            "Tidak ada pengaruh",
            "C",
        ),
        (
            "Rancang topologi hybrid yang menggabungkan star dan ring untuk gedung 3 lantai!",
            "Tugas desain topologi hybrid",
            None,
            None,
            None,
            None,
            None,
        ),
    ]

    for i, (
        text,
        explanation,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct,
    ) in enumerate(assignment2_questions):
        questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 2,
                    "text": text,
                    "explanation": explanation,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Assignment 3: Konfigurasi Protokol Jaringan (6 questions)
    assignment3_questions = [
        (
            "Jelaskan langkah-langkah konfigurasi TCP/IP pada Windows!",
            "Tugas praktik konfigurasi TCP/IP",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Port berapa yang digunakan untuk protokol HTTPS?",
            "Pertanyaan tentang port protokol",
            "80",
            "443",
            "21",
            "25",
            "B",
        ),
        (
            "Apa fungsi dari subnet mask dalam konfigurasi IP?",
            "Pertanyaan essay tentang subnet mask",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Protokol mana yang digunakan untuk transfer file secara aman?",
            "Pertanyaan tentang protokol file transfer aman",
            "FTP",
            "TFTP",
            "SFTP",
            "HTTP",
            "C",
        ),
        (
            "Konfigurasikan DHCP server untuk range IP 192.168.1.100-200!",
            "Tugas konfigurasi DHCP",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Apa perbedaan TCP dan UDP dalam hal reliability?",
            "Pertanyaan essay perbandingan TCP vs UDP",
            None,
            None,
            None,
            None,
            None,
        ),
    ]

    for i, (
        text,
        explanation,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct,
    ) in enumerate(assignment3_questions):
        questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 3,
                    "text": text,
                    "explanation": explanation,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Assignment 4: Evaluasi Perangkat Jaringan (4 questions)
    assignment4_questions = [
        (
            "Bandingkan fungsi dan kegunaan Hub, Switch, dan Router!",
            "Pertanyaan essay perbandingan perangkat jaringan",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Perangkat apa yang bekerja di Layer 2 OSI Model?",
            "Pertanyaan tentang layer perangkat jaringan",
            "Hub",
            "Switch",
            "Router",
            "Gateway",
            "B",
        ),
        (
            "Evaluasi kebutuhan perangkat jaringan untuk kantor 50 orang dengan 3 departemen!",
            "Tugas evaluasi kebutuhan perangkat",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Sebutkan 4 kriteria pemilihan switch untuk jaringan enterprise!",
            "Pertanyaan essay kriteria pemilihan switch",
            None,
            None,
            None,
            None,
            None,
        ),
    ]

    for i, (
        text,
        explanation,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct,
    ) in enumerate(assignment4_questions):
        questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 4,
                    "text": text,
                    "explanation": explanation,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    # Assignment 5: Implementasi Keamanan Jaringan (5 questions)
    assignment5_questions = [
        (
            "Rancang strategi keamanan berlapis (defense in depth) untuk jaringan perusahaan!",
            "Tugas perancangan strategi keamanan berlapis",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Apa yang dimaksud dengan social engineering dalam konteks keamanan jaringan?",
            "Pertanyaan pilihan ganda tentang social engineering",
            "Teknik hacking",
            "Manipulasi psikologis",
            "Desain jaringan",
            "Instalasi perangkat",
            "B",
        ),
        (
            "Jelaskan perbedaan antara firewall hardware dan software beserta kelebihan masing-masing!",
            "Pertanyaan essay perbandingan jenis firewall",
            None,
            None,
            None,
            None,
            None,
        ),
        (
            "Metode enkripsi mana yang paling aman untuk data sensitif?",
            "Pertanyaan tentang metode enkripsi",
            "DES",
            "3DES",
            "AES",
            "RC4",
            "C",
        ),
        (
            "Buatlah kebijakan password yang aman untuk organisasi dengan 100 karyawan!",
            "Tugas pembuatan kebijakan password",
            None,
            None,
            None,
            None,
            None,
        ),
    ]

    for i, (
        text,
        explanation,
        choice_a,
        choice_b,
        choice_c,
        choice_d,
        correct,
    ) in enumerate(assignment5_questions):
        questions.append(
            {
                "model": "pramlearnapp.assignmentquestion",
                "pk": question_id,
                "fields": {
                    "assignment": 5,
                    "text": text,
                    "explanation": explanation,
                    "choice_a": choice_a,
                    "choice_b": choice_b,
                    "choice_c": choice_c,
                    "choice_d": choice_d,
                    "correct_choice": correct,
                },
            }
        )
        question_id += 1

    return questions


def generate_arcs_questionnaires():
    """Generate hanya 1 ARCS questionnaire: Pre-assessment (post belum dibuat)"""
    return [
        {
            "model": "pramlearnapp.arcsquestionnaire",
            "pk": 1,
            "fields": {
                "title": "Kuesioner ARCS Sebelum Pembelajaran",
                "slug": "arcs-sebelum-pembelajaran-jaringan",
                "description": "Kuesioner untuk mengukur motivasi belajar siswa sebelum mempelajari materi Jaringan Komputer",
                "material": 1,
                "questionnaire_type": "pre",
                "is_active": True,
                "duration_minutes": 15,
                "start_date": "2025-07-01T07:00:00Z",
                "end_date": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T06:00:00Z",
                "updated_at": "2025-07-01T06:00:00Z",
                "created_by": 2,  # Teacher ID
            },
        }
    ]


def generate_arcs_questions():
    """Generate ARCS questions hanya untuk pre-assessment"""
    questions = []

    # Questions data for ARCS dimensions
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
        (
            "Saya membutuhkan pengetahuan jaringan komputer untuk pekerjaan",
            "relevance",
            10,
        ),
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

    # Generate questions for pre-assessment only
    for pk, (text, dimension, order) in enumerate(arcs_questions_data, 1):
        questions.append(
            {
                "model": "pramlearnapp.arcsquestion",
                "pk": pk,
                "fields": {
                    "questionnaire": 1,  # Only pre-assessment
                    "text": text,
                    "dimension": dimension,
                    "question_type": "likert_5",
                    "order": order,
                    "is_required": True,
                    "scale_min": 1,
                    "scale_max": 5,
                    "scale_label_min": "Sangat Tidak Setuju",
                    "scale_label_max": "Sangat Setuju",
                    "created_at": "2025-07-01T06:00:00Z",
                    "updated_at": "2025-07-01T06:00:00Z",
                },
            }
        )

    return questions


def generate_arcs_responses():
    """Generate ARCS responses untuk pre-assessment untuk semua 34 siswa"""
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
                    "submitted_at": "2025-07-01T08:30:00Z",
                    "completed_at": "2025-07-01T08:45:00Z",
                    "is_completed": True,
                },
            }
        )

    return responses


def generate_arcs_answers():
    """Generate ARCS answers untuk semua student responses"""
    answers = []
    answer_id = 1

    # Generate answers for all 34 students for questionnaire 1
    for student_response_id in range(1, 35):  # Response IDs 1-34
        # Generate answers for all 20 questions (1-20 for questionnaire 1)
        for question_id in range(1, 21):
            # Generate realistic likert responses (mostly 3-5 with some variation)
            # Higher scores for attention and relevance, mixed for confidence and satisfaction
            if question_id <= 5:  # Attention questions
                likert_value = random.choices([3, 4, 5], weights=[20, 40, 40])[0]
            elif question_id <= 10:  # Relevance questions
                likert_value = random.choices([3, 4, 5], weights=[30, 35, 35])[0]
            elif question_id <= 15:  # Confidence questions
                likert_value = random.choices([2, 3, 4, 5], weights=[10, 30, 40, 20])[0]
            else:  # Satisfaction questions
                likert_value = random.choices([2, 3, 4, 5], weights=[15, 25, 35, 25])[0]

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
                        "answered_at": "2025-07-01T08:35:00Z",
                    },
                }
            )
            answer_id += 1

    return answers


def generate_student_motivation_profiles():
    """Generate motivation profiles berdasarkan ARCS responses"""
    profiles = []

    # Generate profiles for all 34 students
    for student_id in range(3, 37):  # Students ID 3-36
        # Calculate realistic ARCS scores
        attention = round(random.uniform(3.2, 4.8), 2)
        relevance = round(random.uniform(3.0, 4.5), 2)
        confidence = round(random.uniform(2.8, 4.2), 2)
        satisfaction = round(random.uniform(2.9, 4.3), 2)

        # Calculate overall motivation level
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
                "pk": student_id - 2,  # Profile ID 1-34
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
    """Generate attendance data dengan various status"""
    attendances = []

    # Generate attendance for all 34 students for the material
    for student_id in range(3, 37):  # Students ID 3-36
        # Most students present, some late, few absent
        status_weights = [80, 10, 5, 5]  # present, late, absent, excused
        status = random.choices(
            ["present", "late", "absent", "excused"], weights=status_weights
        )[0]

        attendances.append(
            {
                "model": "pramlearnapp.studentattendance",
                "pk": student_id - 2,  # Attendance ID 1-34
                "fields": {
                    "student": student_id,
                    "material": 1,
                    "status": status,
                    "updated_at": "2025-07-01T08:00:00Z",
                    "updated_by": 2,  # Teacher ID
                },
            }
        )

    return attendances


def generate_student_activities():
    """Generate student activities untuk learning analytics"""
    activities = []
    activity_id = 1

    activity_types = [
        ("material", "Membuka Materi Pembelajaran"),
        ("quiz", "Melihat Quiz"),
        ("assignment", "Melihat Tugas"),
    ]

    # Generate activities for all students
    for student_id in range(3, 37):  # Students ID 3-36
        # Generate 2-5 activities per student (belum mengerjakan, hanya melihat)
        num_activities = random.randint(2, 5)

        for i in range(num_activities):
            activity_type, title_template = random.choice(activity_types)

            # Create activity with realistic timestamps
            base_time = datetime(2025, 7, 1, 8, 0, 0)
            activity_time = base_time + timedelta(
                hours=random.randint(0, 24), minutes=random.randint(0, 59)
            )

            activities.append(
                {
                    "model": "pramlearnapp.studentactivity",
                    "pk": activity_id,
                    "fields": {
                        "student": student_id,
                        "activity_type": activity_type,
                        "title": f"{title_template} - Jaringan Komputer",
                        "timestamp": activity_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "related_object_id": 1,  # Related to material/quiz/assignment ID 1
                    },
                }
            )
            activity_id += 1

    return activities


def generate_announcements():
    """Generate sample announcements"""
    return [
        {
            "model": "pramlearnapp.announcement",
            "pk": 1,
            "fields": {
                "title": "Selamat Datang di Pembelajaran Jaringan Komputer",
                "content": "Selamat datang di pembelajaran Administrasi Sistem Jaringan. Materi pembelajaran, quiz, dan tugas sudah tersedia di sistem. Deadline pengumpulan semua tugas adalah 2 Agustus 2025. Silakan pelajari materi terlebih dahulu sebelum mengerjakan quiz dan tugas.",
                "author": 2,  # Teacher ID
                "priority": "high",
                "target_audience": "class",
                "target_class": 1,
                "is_active": True,
                "deadline": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T10:00:00Z",
                "updated_at": "2025-07-01T10:00:00Z",
            },
        },
        {
            "model": "pramlearnapp.announcement",
            "pk": 2,
            "fields": {
                "title": "Informasi Quiz dan Tugas Tersedia",
                "content": "Quiz dan tugas untuk materi Jaringan Komputer sudah tersedia. Terdapat 5 quiz kelompok dan 5 tugas individual. Pastikan untuk membentuk kelompok terlebih dahulu sebelum mengerjakan quiz kelompok. Semua deadline di tanggal 2 Agustus 2025.",
                "author": 2,  # Teacher ID
                "priority": "medium",
                "target_audience": "class",
                "target_class": 1,
                "is_active": True,
                "deadline": "2025-08-02T23:59:59Z",
                "created_at": "2025-07-01T11:00:00Z",
                "updated_at": "2025-07-01T11:00:00Z",
            },
        },
    ]


def main():
    """Main function to generate comprehensive initial data"""
    print("Generating PramLearn initial data (Updated Version)...")
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

    print("🧩 Generating 5 group quizzes (BELUM DIKERJAKAN)...")
    data.extend(generate_quiz())
    data.extend(generate_quiz_questions())

    print("📋 Generating 5 assignments (BELUM DIKERJAKAN)...")
    data.extend(generate_assignment())
    data.extend(generate_assignment_questions())

    print("📊 Generating ARCS pre-assessment (post belum dibuat)...")
    data.extend(generate_arcs_questionnaires())
    data.extend(generate_arcs_questions())
    data.extend(generate_arcs_responses())
    data.extend(generate_arcs_answers())

    print("🎯 Generating student profiles...")
    data.extend(generate_student_motivation_profiles())

    print("📅 Generating attendance data...")
    data.extend(generate_student_attendance())

    print("📈 Generating student activities...")
    data.extend(generate_student_activities())

    print("📢 Generating announcements...")
    data.extend(generate_announcements())

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
    print("  • 5 Group quizzes (BELUM DIKERJAKAN)")
    print("    - Quiz 1: Pengenalan Jaringan (8 soal)")
    print("    - Quiz 2: Topologi Jaringan (7 soal)")
    print("    - Quiz 3: Protokol Jaringan (10 soal)")
    print("    - Quiz 4: Perangkat Jaringan (6 soal)")
    print("    - Quiz 5: Keamanan Jaringan (9 soal)")
    print("  • 5 Assignments (BELUM DIKERJAKAN)")
    print("    - Assignment 1: Analisis Konsep (4 soal)")
    print("    - Assignment 2: Desain Topologi (5 soal)")
    print("    - Assignment 3: Konfigurasi Protokol (6 soal)")
    print("    - Assignment 4: Evaluasi Perangkat (4 soal)")
    print("    - Assignment 5: Keamanan Jaringan (5 soal)")
    print("  • 1 ARCS pre-assessment (20 pertanyaan)")
    print("  • 34 Student ARCS responses with answers")
    print("  • 34 Student motivation profiles")
    print("  • 34 Student attendance records")
    print("  • Student learning activities")
    print("  • 2 Class announcements")
    print("\n⚠️  CATATAN:")
    print("  • Quiz belum dikerjakan siswa/kelompok")
    print("  • Assignment belum dikerjakan siswa")
    print("  • Group belum dibentuk")
    print("  • ARCS post-assessment belum dibuat")
    print("  • Semua deadline: 2 Agustus 2025")
    print(
        "\n🎉 Ready to load with: python manage.py loaddata pramlearnapp/fixtures/initial_data.json"
    )


if __name__ == "__main__":
    main()
