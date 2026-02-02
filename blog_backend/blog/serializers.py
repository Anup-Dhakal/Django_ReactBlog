from rest_framework import serializers
from .models import Post, PostImage
from django.contrib.auth.models import User

class PostImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ["id", "image", "uploaded_at"]

    def get_image(self, obj):
        # This returns the real URL from the storage backend.
        # With Cloudinary enabled, this becomes https://res.cloudinary.com/...
        if obj.image:
            return obj.image.url
        return None


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
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        user = User(username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user
