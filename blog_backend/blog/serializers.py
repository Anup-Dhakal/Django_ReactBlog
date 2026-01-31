from rest_framework import serializers
from .models import Post, PostImage


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ["id", "image", "uploaded_at"]


class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "content", "created_at", "images"]


class PostCreateSerializer(serializers.ModelSerializer):
    # accept multiple images from multipart form
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Post
        fields = ["id", "title", "content", "images"]

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        post = Post.objects.create(**validated_data)
        for img in images:
            PostImage.objects.create(post=post, image=img)
        return post
