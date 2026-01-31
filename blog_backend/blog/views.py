from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, PostImage
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    RegisterSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PostCreateSerializer
        return PostSerializer
    
    def get_queryset(self):
        # show only my posts when logged in
        if self.request.user.is_authenticated:
            return Post.objects.filter(author=self.request.user).order_by("-created_at")
        # guests see nothing (or you can return Post.objects.none())
        return Post.objects.none()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return PostCreateSerializer
        return PostSerializer

    def perform_update(self, serializer):
        post = serializer.save()
        images = self.request.FILES.getlist("images")
        for img in images:
            PostImage.objects.create(post=post, image=img)
