from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views.user_views import UserProfileView, UserCreate, UserListView
from .views.otp_views import SendOTPView, VerifyOTPView
from .views.stock_views import StockCreateView, StockUpdateView, StockListView, StockDeleteView, StockProfileView

urlpatterns = [
    # envia o codigo OTP por email
    path('user/send-otp/', SendOTPView.as_view(), name='send_otp'),
    # verifica se o código OTP é válido
    path('user/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('user/register/', UserCreate.as_view(), name='register'),
    
    # usuarios autenticados
    path("user/profile/", UserProfileView.as_view(), name="user_profile"),
    
    # endpoints de autenticação JWT
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),

    # endpoints pros ativos
    path('stock/create/', StockCreateView.as_view(), name='stock_create'),
    path('stock/update/<int:pk>/', StockUpdateView.as_view(), name='stock_update'),
    path('stock/list/', StockListView.as_view(), name='stock_list'),
    path('stock/delete/<int:pk>/', StockDeleteView.as_view(), name='stock_delete'),
    path('stock/profile/<str:name>/', StockProfileView.as_view(), name='stock_profile'),
    
    # usando para testes, apagar dps
    path('user/list/', UserListView.as_view(), name='list_users'),
]
