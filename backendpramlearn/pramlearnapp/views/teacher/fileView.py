from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from pramlearnapp.models import File
from pramlearnapp.serializers import FileSerializer


class FileUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_serializer = FileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileDeleteView(APIView):
    def delete(self, request, pk, *args, **kwargs):
        try:
            file = File.objects.get(pk=pk)
            file.delete()
            return Response({"message": "File deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            return Response({"error": "File not found."}, status=status.HTTP_404_NOT_FOUND)
