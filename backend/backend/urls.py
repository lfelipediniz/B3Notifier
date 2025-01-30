from django.contrib import admin
from django.urls import path, include
from api.views import UserCreate, SendOTPView, VerifyOTPView, UserListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # envia o codigo OTP por email
    path("api/user/send-otp/", SendOTPView.as_view(), name="send_otp"),
    # verfica se o o codigo OTP é valido
    path("api/user/verify-otp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("api/user/register/", UserCreate.as_view(), name="register"),
    # endpoints para autenticação JWT
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),

    path("api-auth/", include("rest_framework.urls")),
    # usando para testes, apagar dps
    path("api/user/list/", UserListView.as_view(), name="list_users"),
]


