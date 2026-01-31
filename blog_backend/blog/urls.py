from django.urls import path
from .views import PostListCreateView, PostRUDView,RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("posts/", PostListCreateView.as_view(), name="post-list-create"),
    path("posts/<int:pk>/", PostRUDView.as_view(), name="post-rud"),
]
