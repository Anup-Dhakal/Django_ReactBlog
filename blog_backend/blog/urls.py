from django.urls import path
from .views import PostListCreateView, PostDetailView, PostRUDView

urlpatterns = [
    path("posts/", PostListCreateView.as_view(), name="post-list-create"),
    path("posts/<int:pk>/", PostRUDView.as_view(), name="post-rud"),
]
