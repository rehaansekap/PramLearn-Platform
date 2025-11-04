Collecting workspace information# PramLearn - Adaptive Learning Platform

![PramLearn Logo](https://img.shields.io/badge/PramLearn-Educational%20Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)
![Django](https://img.shields.io/badge/Django-4.x-092E20?style=flat&logo=django)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

## 📚 Project Description

**PramLearn** is an adaptive web-based learning platform that integrates the ARCS model (Attention, Relevance, Confidence, Satisfaction) with the Teams Games Tournament (TGT) method to enhance student motivation and engagement in learning.

### 🎯 Main Objectives

- Measure and improve student learning motivation using the ARCS model
- Implement collaborative group-based learning with TGT
- Automatic student clustering based on motivation profiles using K-Means
- Real-time learning monitoring and analytics
- Progress tracking for each student learning activity

---

## ✨ Key Features

### 🔐 Multi-Role System

- **Admin**: User, class, and system management
- **Teacher**: Material, quiz, assignment management, and monitoring
- **Student**: Access to learning, group quizzes, and progress tracking

### 📊 ARCS Motivation Assessment

- **Dual Input Method**:
  - Interactive questionnaire for students (20 questions, 4 dimensions)
  - CSV file upload for external data import
- **K-Means Clustering**: Automatic student classification (High/Medium/Low motivation)
- **Analytics Dashboard**: Motivation distribution visualization and learning recommendations
- **PDF Report Generation**: Clustering analysis and motivation profile reports

### 🎮 Teams Games Tournament (TGT)

- **Group Formation**: Heterogeneous group formation based on ARCS clustering
- **Real-time Collaboration**: Collaborative quiz completion within groups
- **Live Synchronization**: Answer synchronization among group members
- **Competitive Scoring**: Point system and ranking for tournaments
- **Auto-submit**: Automatic submission when time expires

### 📈 Learning Management

- **Material Management**: PDF upload, YouTube videos, and learning content
- **Assignment System**: File upload, essay answers, and automatic feedback
- **Quiz Management**: Multiple choice, true/false with timer
- **Progress Tracking**: Real-time monitoring of student learning activities
- **Analytics**: Class and individual performance dashboard

### 🔄 Real-time Features

- Progress tracking with visual checklist
- Live quiz collaboration in groups
- Auto-refresh for latest data
- Responsive progress card (desktop) and drawer (mobile)

### 🔄 Real-time Features

#### 💬 Group Chat WebSocket

![Group Chat](docs/screenshots/websockets/group-chat.jpeg)

- **Real-time messaging** within learning groups
- **Typing indicators** to see who is typing
- **Online status** for each group member
- **Message delivery confirmation** with sent/delivered status
- **Auto-reconnect** on connection loss
- **Heartbeat mechanism** to maintain active connections
- **Message history** with lazy loading

**Technical Implementation:**

- WebSocket endpoint: `ws://localhost:8000/ws/group-chat/{material_slug}/`
- Authentication via token parameter
- Message broadcasting via Django Channels
- Persistent chat storage in database

**Features:**

- Send text messages to group
- See who's online in real-time
- Typing indicators
- Message read status
- Reconnection handling
- Mobile-responsive chat drawer

#### 🎮 Quiz Collaboration WebSocket

![Quiz Collaboration](docs/screenshots/websockets/quiz-collab.png)

- **Real-time answer synchronization** among group members
- **Live question navigation** - see which question members are on
- **Member activity tracking** - see who answered what
- **Auto-submit notification** - get notified when someone submits
- **Connection status indicator** - know who's online/offline
- **Heartbeat ping-pong** to maintain connection

**Technical Implementation:**

- WebSocket endpoint: `ws://localhost:8000/ws/quiz-collaboration/{quiz_id}/{group_id}/`
- Token-based authentication
- Channel layers for broadcasting
- Automatic state synchronization

**Features:**

- Real-time answer updates
- Question navigation sync
- User join/leave notifications
- Submit status broadcasting
- Connection management

---

## 🏗️ Technology Stack

### Frontend

- **React 18** with React Router v6
- **Ant Design** for UI components
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **Day.js** for date manipulation
- **SweetAlert2** for notifications

### Backend

- **Django 4.x** with Django REST Framework
- **PostgreSQL** for database
- **JWT Authentication** for security
- **ReportLab** for PDF generation
- **Scikit-learn** for K-Means clustering
- **Pandas** for data processing

### Deployment

- **Azure Web Services** for hosting
- **Azure Blob Storage** for media files
- **GitHub Actions** for CI/CD

---

## 📸 Main Page Screenshots

### 1. 🔐 Login Page

_Clean and user-friendly login interface with gradient background_

![Login Page](docs/screenshots/auth/login.jpeg)

**Features:**

- Login with username and password
- Role-based redirect (Admin/Teacher/Student)
- Real-time input validation
- Responsive design

**Path:** `/login`

---

### 2. 👨‍🎓 Student Dashboard

_Student dashboard with learning overview and quick actions_

![Student Dashboard](docs/screenshots/student/dashboard.png)

**Features:**

- Welcome card with dynamic greeting
- Quick statistics (subjects, assignments, quizzes)
- Quick actions for fast navigation
- Recent activities and upcoming deadlines
- Progress overview per subject

**Path:** `/student`

**Main Components:**

- `WelcomeCard` - Greeting and motivation
- `QuickStatsCard` - Quick statistics
- `QuickActionsCard` - Quick actions

---

### 3. 📚 Student Subjects

_List of subjects followed by students with progress tracking_

![Student Subjects](docs/screenshots/student/subjects.png)

**Features:**

- Card view for each subject
- Progress bar for each material
- Quick access to last material
- Learning schedule
- Filter and search

**Path:** `/student/subjects`

**Main Components:**

- `SubjectCardBody` - Subject details
- `MaterialStats` - Material statistics

---

### 4. 📖 Learning Material Details

_Learning interface with multi-tab for various content types_

![Material Detail](docs/screenshots/materials/material-detail.png)

**Features:**

- **PDF Documents Tab**: Interactive PDF viewer with progress tracking
- **Video Tab**: YouTube player with watch duration tracking
- **Quiz Tab**: Individual quiz list with completion status
- **Group Tab**: TGT group quizzes with real-time collaboration
- **Assignment Tab**: Individual assignments with file upload
- **Progress Tracker**: Card/Drawer progress with activity checklist

**Path:** `/student/materials/:slug`

**Main Components:**

- `MaterialContentTabs` - Tab navigation
- `StudentPDFViewer` - PDF viewer
- `StudentVideoPlayer` - Video player
- `MaterialQuizList` - Quiz list

---

### 5. 🎯 Group Quiz (TGT)

_Collaborative interface for Teams Games Tournament_

![Group Quiz Attempt](docs/screenshots/group-quiz/attempt.png)

**Features:**

- Real-time answer synchronization among members
- Navigation panel with answer status
- Automatic countdown timer
- Live member activities
- Chat/discussion (optional)
- Auto-submit when time expires
- Responsive mobile view

**Path:** `/student/group-quiz/:attemptId`

**Main Components:**

- `GroupQuizNavigation` - Question navigation
- Real-time collaboration engine
- Live answer synchronization

---

### 6. 📊 Group Quiz Results

_Quiz results dashboard with group performance analytics_

![Group Quiz Results](docs/screenshots/group-quiz/results.png)

**Features:**

- Group and individual scores
- Correct/incorrect answer breakdown
- Member contribution analysis
- Comparison with other groups
- Details per question
- Download report (PDF)

**Path:** `/student/group-quiz/:attemptId/results`

**Main Components:**

- `GroupQuizActions` - Quick actions

---

### 7. 📝 Assignment Submission

_Submission form for individual assignments_

![Assignment Submission](docs/screenshots/assignments/submission.png)

**Features:**

- Multiple file upload (PDF, DOC, images)
- Text editor for essay answers
- File preview before submit
- File type and size validation
- Upload progress indicator

**Path:** `/student/assignments/:slug`

**Main Components:**

- `AssignmentSubmissionForm` - Submission form
- `StudentFileUpload` - File uploader
- `AssignmentFileSection` - File management

---

### 8. 📊 ARCS Questionnaire (Student)

_ARCS questionnaire to measure learning motivation_

![ARCS Questionnaire](docs/screenshots/arcs/questionnaire.png)

**Features:**

- 20 questions with 4 ARCS dimensions
- Scale 1-5 for each question
- Progress indicator
- Completion validation
- Auto-save (optional)

**Path:** `/student/materials/:slug/arcs`

---

### 9. 📈 ARCS Results (Student)

_ARCS motivation analysis results dashboard_

![ARCS Results](docs/screenshots/arcs/results.png)

**Features:**

- Overall motivation score
- Breakdown per dimension (Attention, Relevance, Confidence, Satisfaction)
- Radar chart visualization
- Personal recommendations based on scores
- Strength analysis and improvement areas
- Adaptive learning tips

**Path:** `/student/materials/:slug/arcs/results`

**Main Components:**

- `ARCSDimensionScores` - Score per dimension
- `ARCSAnalysisCard` - Analysis and recommendations
- `ARCSResultsActions` - Quick actions

---

### 10. 🏆 Student Grades & Feedback

_Grade dashboard with performance analytics_

![Student Grades](docs/screenshots/student/grades.png)

**Features:**

- Filter by assignment/quiz
- Table view with sorting
- Detailed feedback per submission
- Grade visualization
- Analytics chart (performance over time)
- Subject performance breakdown
- Download transcript

**Path:** `/student/grades`

**Main Components:**

- Grade table (desktop & mobile responsive)
- Performance analytics
- Subject performance cards

---

### 11. 👨‍🏫 Teacher Dashboard

_Teacher dashboard with class overview and statistics_

![Teacher Dashboard](docs/screenshots/teacher/dashboard.png)

**Features:**

- Welcome card with summary
- Quick stats (subjects, students, assignments, quizzes)
- Recent activities
- Pending submissions alert
- Quick actions to create content
- Performance overview

**Path:** `/teacher`

**Main Components:**

- `TeacherWelcomeCard`
- `TeacherQuickStatsCard`
- `QuickActionsCard`

---

### 12. 📚 Teacher Subjects Management

_Management of subjects taught by teacher_

![Teacher Subjects](docs/screenshots/teacher/subjects.png)

**Features:**

- Card view for each subject
- Statistics (students, materials, assignments, quizzes)
- Performance overview
- Quick access to subject details
- Create/edit subject

**Path:** `/teacher/subjects`

---

### 13. 🎓 Teacher Sessions Management

_Learning session management (class & subject combination)_

![Teacher Sessions](docs/screenshots/teacher/sessions.png)

**Features:**

- List all active sessions
- Filter by class/subject
- Quick stats per session
- Materials management
- Student monitoring
- Create new session

**Path:** `/teacher/sessions`

**Main Components:**

- Session list with filtering
- Material cards
- Student roster

---

### 14. 📖 Teacher Material Detail Management

_Complete interface to manage one learning material_

![Content Tab](docs/screenshots/materials/content-tab.png)
![Groups Tab](docs/screenshots/materials/groups-tab.png)
![ARCS Tab](docs/screenshots/materials/arcs-tab.png)

**Multi-Tab System:**

#### Tab 1: 📄 Content

- Upload/manage PDF files
- Embed YouTube videos
- Preview and edit content

**Path:** Material detail content tab

**Components:**

- `PDFFilesSection`
- `VideoSection`

#### Tab 2: 👥 Students

- List students who accessed
- Progress tracking per student
- Attendance management
- Individual performance

**Components:**

- Student list with progress bars
- Activity timeline per student

#### Tab 3: 📝 Assignment

- Create/edit assignments
- List submissions
- Grading interface
- Bulk operations
- Submission statistics

**Components:**

- `SubmissionDetailModal`
- Submission table with filtering

#### Tab 4: ❓ Quiz

- Create/edit quizzes
- Question bank management
- Assign to groups
- View results
- Analytics per quiz

**Components:**

- Quiz management panel
- Question editor
- Results dashboard

#### Tab 5: 👥 Groups

- Auto group formation based on ARCS clustering
- Manual group editing
- Priority mode selection (Balance/Heterogeneity/Custom)
- Group analytics
- Member management

**Components:**

- `GroupFormationSection`
- Clustering visualization
- Group cards with member list

#### Tab 6: 📊 ARCS Management

- Create ARCS questionnaires
- Manage questions (20 questions, 4 dimensions)
- View student responses
- Analytics dashboard with visualization
- Clustering results
- Download reports

**Path:** Material ARCS tab

**Components:**

- `ARCSHeader`
- `ARCSQuestionManager`
- `ARCSAnalyticsDashboard`

#### Tab 7: 📤 Upload ARCS CSV

- Upload CSV file with student ARCS data
- Dual input method support
- Format guide with examples
- Validation and error handling
- Preview before upload
- Automatic clustering after upload

**Path:** Material upload ARCS tab

**Components:**

- `ARCSUploadContainer`
- `ARCSFormatGuide`

**Upload Features:**

- Support 2 CSV formats (with/without dimensions)
- Auto-validation file format
- Progress indicator during upload
- Data preview before submit
- Error handling with detailed messages

---

### 15. 🔧 Management Pages (Admin/Teacher)

#### User Management

_System user management (Admin only)_

**Features:**

- CRUD operations for users
- Role assignment (Admin/Teacher/Student)
- Bulk operations
- Import/export Excel
- User info modal
- Column visibility toggle

**Path:** `/management` - Users Tab

**Components:**

- `UserManagement`
- `UserTable`
- `UserForm`

#### Class Management

_Class management_

**Features:**

- Create/edit/delete classes
- Assign students to classes
- View class roster
- Export data

**Path:** `/management` - Classes Tab

**Components:**

- Class table with filtering
- Class form modal
- Student assignment

#### Subject Management

_Subject management_

**Features:**

- CRUD subjects
- Assign to classes
- Material overview
- Export data

**Path:** `/management` - Subjects Tab

**Components:**

- `SubjectManagement`
- Subject table
- Subject form

#### Schedule Management

_Lesson schedule management_

**Features:**

- Create schedules
- Calendar view
- Conflict detection
- Recurring schedules

**Path:** `/management` - Schedules Tab

---

## 🚀 Installation Guide

### Prerequisites

```bash
# Node.js 18+ and npm
node --version
npm --version

# Python 3.10+ and pip
python --version
pip --version

# PostgreSQL
psql --version
```

### Frontend Setup

```bash
# Clone repository
git clone https://github.com/rehaansekap/pramlearn.git
cd pramlearn/frontendpramlearn

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env according to configuration

# Run development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd backendpramlearn

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env according to database and configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### PostgreSQL Installation (Windows, Linux, macOS)

Install PostgreSQL based on your OS. After install, ensure the service is running and you can open psql.

- Windows (EnterpriseDB installer)

  - Download from https://www.postgresql.org/download/windows/
  - Install and note superuser (postgres) password
  - Start “PostgreSQL” service from Services.msc (should be auto-start)
  - Open PowerShell:
    ```powershell
    "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost
    ```
  - Or via package managers:
    - Chocolatey: `choco install postgresql`
    - Scoop: `scoop install postgresql` (then `pg_ctl -D ~/scoop/persist/postgresql/data start`)

- Linux

  - Ubuntu/Debian:
    ```bash
    sudo apt update && sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable --now postgresql
    sudo -u postgres psql
    ```
  - Fedora/RHEL/CentOS:
    ```bash
    sudo dnf install -y postgresql-server postgresql-contrib
    sudo postgresql-setup --initdb
    sudo systemctl enable --now postgresql
    sudo -u postgres psql
    ```
  - Arch:
    ```bash
    sudo pacman -S postgresql
    sudo -iu postgres initdb -D /var/lib/postgres/data
    sudo systemctl enable --now postgresql
    sudo -u postgres psql
    ```

- macOS
  - Homebrew:
    ```bash
    brew install postgresql@16
    brew services start postgresql@16
    psql postgres
    ```
  - Postgres.app: https://postgresapp.com (start server, then use bundled psql)

### Create Database and Role (pramadmin)

Use psql as superuser (postgres) to create a dedicated DB user and database for this app.

```sql
-- Connect as superuser:
-- psql -U postgres -h localhost

-- 1) Create application role with login
CREATE ROLE pramadmin WITH LOGIN PASSWORD 'YOUR_SECURE_PASSWORD';

-- 2) (Optional) Allow creating DBs from this role
ALTER ROLE pramadmin CREATEDB;

-- 3) Create application database owned by pramadmin
CREATE DATABASE pramlearn_db OWNER pramadmin ENCODING 'UTF8' TEMPLATE template0;

-- 4) Grant privileges (redundant if owner, kept for clarity)
GRANT ALL PRIVILEGES ON DATABASE pramlearn_db TO pramadmin;
```

Verify you can connect:

```bash
psql -U pramadmin -d pramlearn_db -h localhost -W
```

Update backend .env to use this role:

```env
# backendpramlearn/.env
DATABASE_URL=postgresql://pramadmin:YOUR_SECURE_PASSWORD@localhost:5432/pramlearn_db
```

If you changed default PostgreSQL auth to require md5/password, ensure pg_hba.conf has a line like for local connections:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Then restart PostgreSQL service.

### Database Setup

```bash
# Create PostgreSQL database
createdb pramlearn_db

# Or restore from backup
psql pramlearn_db < pramlearn_db_backup.sql
```

### Load Initial Data (Dummy Data)

This project includes `simulate_initial_data.json` file containing:

- 1 Admin, 1 Teacher, 34 Students
- 1 Class (XI TKJ 1)
- 1 Subject (Network System Administration)
- 1 Material with PDF & Videos
- 6 Group Quizzes (54+ computer network questions)
- 2 Assignments (20 questions)
- 1 ARCS Questionnaire (20 questions)
- Student attendance records

#### How to Load Dummy Data:

```bash
cd backendpramlearn

# Make sure database is created and migrations are run
python manage.py migrate

# Load initial data
python manage.py loaddata pramlearnapp/fixtures/simulate_initial_data.json

# Run script to generate correct passwords
python manage.py shell
```

##### Inside Django shell, run:

```bash
from pramlearnapp.models import CustomUser
from django.contrib.auth.hashers import make_password

# Update passwords for all users
admin = CustomUser.objects.get(username='admin1')
admin.password = make_password('123')
admin.save()

teacher = CustomUser.objects.get(username='teacher1')
teacher.password = make_password('123')
teacher.save()

# Update passwords for all students (student1-student34)
for i in range(1, 35):
    student = CustomUser.objects.get(username=f'student{i}')
    student.password = make_password('123')
    student.save()
    print(f'Updated password for student{i}')

print('✅ All passwords updated successfully!')
exit()
```

---

## 🔑 Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (.env)

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/pramlearn_db
ALLOWED_HOSTS=localhost,127.0.0.1

# Azure Storage (optional)
AZURE_ACCOUNT_NAME=your-account-name
AZURE_ACCOUNT_KEY=your-account-key
AZURE_CONTAINER=media
```

---

## 📱 Responsive Design

This platform is fully responsive for various devices:

- **Desktop** (1200px+): Full feature with sidebar navigation
- **Tablet** (768px - 1199px): Adapted layout with collapsible menu
- **Mobile** (< 768px): Mobile-first with drawer navigation and optimized UI

**Mobile-Specific Features:**

- Drawer navigation with swipe gesture
- Collapsed progress drawer (floating button)
- Optimized quiz navigation
- Touch-friendly buttons and cards
- Compressed table view

---

## 🧪 Testing Accounts

For testing, use the following accounts:

### Teacher Account

```
Username: teacher1
Password: 123
Access: Teacher Dashboard, Materials, ARCS Management
```

### Student Accounts

```
Username: student1 - student34
Password: 123
Access: Student Dashboard, Learning Materials, Quizzes
```

### Admin Account

```
Username: admin
Password: admin123
Access: Full system management
```

---

## 📊 Dataset for Evaluation

This project comes with complete dataset for evaluation:

- **34 students** from class XI TKJ 1 with complete ARCS data
- **1 material** "Introduction to Computer Networks"
- **6 group quizzes** with 40+ computer network questions
- **5 individual assignments**
- **ARCS CSV template** for dual input testing

Download template: [arcs_data.csv](https://pramlearnstorage.blob.core.windows.net/media/arcs_data.csv)

---

## 📖 User Guide

### For Students

1. **Login** with student account
2. **Dashboard**: View learning overview
3. **Subjects**: Select subject to study
4. **Material**: Access content (PDF, Video, Quiz, Assignment)
5. **ARCS**: Fill motivation questionnaire
6. **Group Quiz**: Complete quiz collaboratively
7. **Grades**: Check grades and feedback

### For Teachers

1. **Login** with teacher account
2. **Sessions**: Select learning session
3. **Material Detail**: Manage learning content
4. **ARCS Management**:
   - Create ARCS questionnaire
   - Or upload CSV file with ARCS data
5. **Group Formation**: System automatically forms groups
6. **Monitoring**: Track student progress and performance
7. **Grading**: Provide grades and feedback

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Development Team** - Initial work - PramLearn

---

## 🙏 Acknowledgments

- ARCS Model (John Keller)
- Teams Games Tournament methodology
- K-Means Clustering algorithm
- Ant Design component library
- Django REST Framework
- React ecosystem

---

## 📞 Support

For questions or support, please open an issue on GitHub repository or contact:

- Email: rehaansekap@gmail.com
- Website: https://pramlearn.tech

---

## 🔄 Update Log

### Version 1.0.0 (Current)

- ✅ Multi-role authentication system
- ✅ ARCS motivation assessment with dual input
- ✅ Automatic K-Means clustering
- ✅ Teams Games Tournament implementation
- ✅ Real-time collaboration for group quiz
- ✅ Progress tracking system
- ✅ Responsive design (desktop & mobile)
- ✅ Analytics dashboard
- ✅ PDF report generation

---

**⭐ Don't forget to give a star if this project is useful!**
