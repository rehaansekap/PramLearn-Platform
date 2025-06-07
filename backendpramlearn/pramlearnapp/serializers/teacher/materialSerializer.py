from rest_framework import serializers
from pramlearnapp.models import Material, File, MaterialYoutubeVideo
from django.utils.text import slugify


class FileSerializer(serializers.ModelSerializer):
    """
    Serializer untuk file.
    """
    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_at']


class MaterialYoutubeVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialYoutubeVideo
        fields = ["id", "url"]


class MaterialSerializer(serializers.ModelSerializer):
    pdf_files = FileSerializer(many=True, read_only=True)
    pdf_files_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    youtube_videos = MaterialYoutubeVideoSerializer(many=True, required=False)

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'pdf_files', 'pdf_files_ids',
            "google_form_embed_arcs_awal", "google_form_embed_arcs_akhir",
            'google_form_embed', 'subject', 'slug', 'youtube_videos'
        ]

    def create(self, validated_data):
        pdf_files_ids = validated_data.pop('pdf_files_ids', [])
        youtube_videos_data = validated_data.pop('youtube_videos', [])
        title = validated_data.get('title')
        validated_data['slug'] = slugify(title)
        material = super().create(validated_data)
        material.pdf_files.set(File.objects.filter(id__in=pdf_files_ids))
        for video_data in youtube_videos_data:
            MaterialYoutubeVideo.objects.create(
                material=material, **video_data)
        return material

    def update(self, instance, validated_data):
        pdf_files_ids = validated_data.pop('pdf_files_ids', [])
        youtube_videos_data = validated_data.pop('youtube_videos', [])
        title = validated_data.get('title', instance.title)
        validated_data['slug'] = slugify(title)
        instance = super().update(instance, validated_data)
        if pdf_files_ids:
            instance.pdf_files.set(File.objects.filter(id__in=pdf_files_ids))
        # Hapus video lama, tambah yang baru
        instance.youtube_videos.all().delete()
        for video_data in youtube_videos_data:
            MaterialYoutubeVideo.objects.create(
                material=instance, **video_data)
        return instance


class MaterialDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'
