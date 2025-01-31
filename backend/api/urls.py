from django.urls import path
from django.urls import include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views.otp_views import SendOTPView, VerifyOTPView
from .views.user_views import UserCreate, UserListView

urlpatterns = [
    # envia o codigo OTP por email
    path('user/send-otp/', SendOTPView.as_view(), name='send_otp'),
    # verifica se o código OTP é válido
    path('user/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('user/register/', UserCreate.as_view(), name='register'),
    
    # endpoints de autenticação JWT
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),

    # usando para testes, apagar dps
    path('user/list/', UserListView.as_view(), name='list_users'),
]
