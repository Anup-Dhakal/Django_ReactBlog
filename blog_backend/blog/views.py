from rest_framework import generics
from .models import Post, PostImage
from .serializers import PostSerializer, PostCreateSerializer


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by("-created_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PostCreateSerializer
        return PostSerializer


class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer



class PostRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()

    def get_serializer_class(self):
        # For PUT/PATCH we can reuse PostCreateSerializer
        # (it supports title/content, and optionally images)
        if self.request.method in ["PUT", "PATCH"]:
            return PostCreateSerializer
        return PostSerializer

    def perform_update(self, serializer):
        """
        For simplicity:
        - updates title/content
        - if images are sent, they are appended (not replacing old ones)
        """
        post = serializer.save()
        images = self.request.FILES.getlist("images")
        for img in images:
            PostImage.objects.create(post=post, image=img)
