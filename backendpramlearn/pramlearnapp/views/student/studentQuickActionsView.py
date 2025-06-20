from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from datetime import datetime, timedelta
from django.utils import timezone
from pramlearnapp.models import (
    AssignmentSubmission, Assignment, Material, Quiz,
    GroupQuiz, GroupMember, Announcement, Schedule,
    ClassStudent, Subject, SubjectClass
)


class StudentQuickActionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        try:
            # 1. Submit Assignment - assignments yang belum dikumpulkan
            pending_assignments = self.get_pending_assignments(user)

            # 2. Browse Materials - materials yang tersedia
            available_materials = self.get_available_materials(user)

            # 3. Announcements - announcements baru
            new_announcements = self.get_new_announcements(user)

            # 4. My Schedule - jadwal hari ini dan besok
            upcoming_schedule = self.get_upcoming_schedule(user)

            quick_actions = {
                'submit_assignment': {
                    'count': pending_assignments['count'],
                    'label': 'Submit Tugas',
                    'description': f"{pending_assignments['count']} tertunda",
                    'icon': 'download',
                    'color': '#ff4d4f',
                    'route': '/student/assignments',
                    'data': pending_assignments['assignments']
                },
                'browse_materials': {
                    'count': available_materials['count'],
                    'label': 'Jelajahi Materi',
                    'description': f"{available_materials['count']} tersedia",
                    'icon': 'file-text',
                    'color': '#1890ff',
                    'route': '/student/subjects',
                    'data': available_materials['materials']
                },
                'announcements': {
                    'count': new_announcements['count'],
                    'label': 'Pengumuman',
                    'description': f"{new_announcements['count']} baru",
                    'icon': 'bell',
                    'color': '#faad14',
                    'route': '/student/announcements',
                    'data': new_announcements['announcements']
                },
                'schedule': {
                    'count': upcoming_schedule['count'],
                    'label': 'Jadwal Saya',
                    'description': f"{upcoming_schedule['count']} akan datang",
                    'icon': 'calendar',
                    'color': '#52c41a',
                    'route': '/student/schedule',
                    'data': upcoming_schedule['schedules']
                }
            }

            return Response(quick_actions)

        except Exception as e:
            print(f"❌ Error in StudentQuickActionsView: {e}")
            return Response(self.get_default_quick_actions())

    def get_pending_assignments(self, user):
        """Get assignments yang belum dikumpulkan oleh student"""
        try:
            print(f"🔍 Getting pending assignments for user: {user.username}")
            
            # PERBAIKAN: Coba beberapa pendekatan untuk mendapatkan assignments
            
            # Pendekatan 1: Langsung dari semua assignments yang aktif
            active_assignments = Assignment.objects.filter(
                due_date__gte=timezone.now()
            ).select_related('material', 'material__subject')
            
            print(f"📋 Total active assignments: {active_assignments.count()}")
            
            # Filter assignments yang belum dikumpulkan
            pending_assignments = []
            for assignment in active_assignments:
                # Cek apakah sudah ada submission final (bukan draft)
                has_submission = AssignmentSubmission.objects.filter(
                    student=user,
                    assignment=assignment,
                    is_draft=False
                ).exists()
                
                if not has_submission:
                    pending_assignments.append(assignment)
                    print(f"✅ Pending assignment found: {assignment.title}")
            
            print(f"📊 Pending assignments count: {len(pending_assignments)}")
            
            # Jika tidak ada dari pendekatan pertama, coba pendekatan kedua
            if not pending_assignments:
                print("🔄 Trying alternative approach...")
                
                # Get user's classes
                user_classes = ClassStudent.objects.filter(
                    student=user
                ).values_list('class_id', flat=True)
                
                print(f"👥 User classes: {list(user_classes)}")
                
                if user_classes.exists():
                    # Get subject_class IDs from user's classes
                    subject_class_ids = SubjectClass.objects.filter(
                        class_id__in=user_classes
                    ).values_list('id', flat=True)
                    
                    print(f"📚 Subject class IDs: {list(subject_class_ids)}")
                    
                    # Get subject IDs
                    subject_ids = Subject.objects.filter(
                        subject_class_id__in=subject_class_ids
                    ).values_list('id', flat=True)
                    
                    print(f"📖 Subject IDs: {list(subject_ids)}")
                    
                    # Get material IDs
                    material_ids = Material.objects.filter(
                        subject_id__in=subject_ids
                    ).values_list('id', flat=True)
                    
                    print(f"📄 Material IDs: {list(material_ids)}")
                    
                    # Get assignments from these materials
                    assignments_by_class = Assignment.objects.filter(
                        material_id__in=material_ids,
                        due_date__gte=timezone.now()
                    ).select_related('material', 'material__subject')
                    
                    print(f"📋 Assignments by class: {assignments_by_class.count()}")
                    
                    # Filter yang belum dikumpulkan
                    for assignment in assignments_by_class:
                        has_submission = AssignmentSubmission.objects.filter(
                            student=user,
                            assignment=assignment,
                            is_draft=False
                        ).exists()
                        
                        if not has_submission:
                            pending_assignments.append(assignment)
            
            # Prepare assignment data
            assignment_data = []
            for assignment in pending_assignments[:10]:  # Limit to 10
                days_left = (assignment.due_date.date() - timezone.now().date()).days
                assignment_data.append({
                    'id': assignment.id,
                    'title': assignment.title,
                    'description': assignment.description,
                    'due_date': assignment.due_date.isoformat(),
                    'subject_name': assignment.material.subject.name if assignment.material and assignment.material.subject else 'Unknown',
                    'material_title': assignment.material.title if assignment.material else 'Unknown',
                    'days_left': max(0, days_left)
                })

            print(f"✅ Final pending assignments: {len(assignment_data)}")
            
            return {
                'count': len(assignment_data),
                'assignments': assignment_data
            }
            
        except Exception as e:
            print(f"❌ Error getting pending assignments: {e}")
            import traceback
            print(traceback.format_exc())
            return {'count': 0, 'assignments': []}

    def get_available_materials(self, user):
        """Get materials yang tersedia untuk student"""
        try:
            # Get user's classes
            user_classes = ClassStudent.objects.filter(
                student=user
            ).values_list('class_id', flat=True)

            if not user_classes.exists():
                return {'count': 0, 'materials': []}

            # Get subject_class IDs
            subject_class_ids = SubjectClass.objects.filter(
                class_id__in=user_classes
            ).values_list('id', flat=True)

            # Get subjects
            subject_ids = Subject.objects.filter(
                subject_class_id__in=subject_class_ids
            ).values_list('id', flat=True)

            # Get materials
            materials = Material.objects.filter(
                subject_id__in=subject_ids
            ).select_related('subject')[:10]

            material_data = []
            for material in materials:
                material_data.append({
                    'id': material.id,
                    'title': material.title,
                    'subject_name': material.subject.name if material.subject else 'Unknown',
                    'content_type': getattr(material, 'content_type', 'document')
                })

            return {
                'count': len(material_data),
                'materials': material_data
            }

        except Exception as e:
            print(f"❌ Error getting available materials: {e}")
            return {'count': 0, 'materials': []}

    def get_new_announcements(self, user):
        """Get announcements baru untuk student"""
        try:
            # Get user's classes
            user_classes = ClassStudent.objects.filter(
                student=user
            ).values_list('class_id', flat=True)

            if not user_classes.exists():
                return {'count': 0, 'announcements': []}

            # Get announcements from last 30 days
            since_date = timezone.now() - timedelta(days=30)
            announcements = Announcement.objects.filter(
                class_id__in=user_classes,
                created_at__gte=since_date
            ).order_by('-created_at')[:5]

            announcement_data = []
            for announcement in announcements:
                announcement_data.append({
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content[:100] + '...' if len(announcement.content) > 100 else announcement.content,
                    'created_at': announcement.created_at.isoformat(),
                    'is_urgent': getattr(announcement, 'is_urgent', False)
                })

            return {
                'count': len(announcement_data),
                'announcements': announcement_data
            }

        except Exception as e:
            print(f"❌ Error getting new announcements: {e}")
            return {'count': 0, 'announcements': []}

    def get_upcoming_schedule(self, user):
        """Get jadwal upcoming untuk student"""
        try:
            # Get user's classes
            user_classes = ClassStudent.objects.filter(
                student=user
            ).values_list('class_id', flat=True)

            if not user_classes.exists():
                return {'count': 0, 'schedules': []}

            # Get schedules for next 7 days
            start_date = timezone.now().date()
            end_date = start_date + timedelta(days=7)
            
            schedules = Schedule.objects.filter(
                class_id__in=user_classes,
                date__range=[start_date, end_date]
            ).order_by('date', 'start_time')[:10]

            schedule_data = []
            for schedule in schedules:
                schedule_data.append({
                    'id': schedule.id,
                    'subject': getattr(schedule, 'subject', 'Unknown'),
                    'date': schedule.date.isoformat(),
                    'start_time': schedule.start_time.strftime('%H:%M') if schedule.start_time else '00:00',
                    'end_time': schedule.end_time.strftime('%H:%M') if schedule.end_time else '00:00',
                    'room': getattr(schedule, 'room', 'TBA')
                })

            return {
                'count': len(schedule_data),
                'schedules': schedule_data
            }

        except Exception as e:
            print(f"❌ Error getting upcoming schedule: {e}")
            return {'count': 0, 'schedules': []}

    def get_default_quick_actions(self):
        """Default quick actions jika terjadi error"""
        return {
            'submit_assignment': {
                'count': 0,
                'label': 'Submit Tugas',
                'description': '0 tertunda',
                'icon': 'download',
                'color': '#ff4d4f',
                'route': '/student/assignments',
                'data': []
            },
            'browse_materials': {
                'count': 0,
                'label': 'Jelajahi Materi',
                'description': '0 tersedia',
                'icon': 'file-text',
                'color': '#1890ff',
                'route': '/student/subjects',
                'data': []
            },
            'announcements': {
                'count': 0,
                'label': 'Pengumuman',
                'description': '0 baru',
                'icon': 'bell',
                'color': '#faad14',
                'route': '/student/announcements',
                'data': []
            },
            'schedule': {
                'count': 0,
                'label': 'Jadwal Saya',
                'description': '0 akan datang',
                'icon': 'calendar',
                'color': '#52c41a',
                'route': '/student/schedule',
                'data': []
            }
        }