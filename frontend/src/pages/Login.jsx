import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScanSearch } from "lucide-react";

import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";

const API_BASE_URL = "http://127.0.0.1:8000/api/user"; // apenas pra testar localmente, dps trabalhamos pra producao

const Login = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // logs para conferir o que esta sendo feito
  const showToast = (title, description, type = "default") => {
    setToast({ title, description, type });
    setTimeout(() => setToast(null), 3000);
  };

  // autentica o usuário e obter o token JWT
  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      showToast("Erro", "Preencha todos os campos!", "error");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, {
        username: formData.username,
        password: formData.password,
      });

      // armazena os tokens no localStorage
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

      showToast("Sucesso", "Login realizado com sucesso!", "success");

      // redireicona para pagina principal
      navigate("/stocks");
    } catch (error) {
      showToast("Erro", "Usuário ou senha incorretos!", "error");
    }
  };

  // repassando o mesmo card pra nao duplicar codigo
  const renderCardSteps = () => (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Entrar</h2>
        <>
          <p className="text-center text-[hsl(var(--foreground))]">
            Entre com seu nome de usuário e senha
          </p>
          <Input
            type="text"
            placeholder="Nome de usuário"
            className="w-full"
            maxLength={20}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <Input
            type="password"
            placeholder="Senha"
            className="w-full"
            maxLength={20}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <Button
            className="w-full bg-[hsl(var(--grey))] text-white"
            onClick={handleLogin} 
          >
            Entrar
          </Button>
        </>
      </CardContent>
    </Card>
  );

  return (
    <ToastProvider>
      <div className="relative min-h-screen">
        <Button
          className="absolute hidden top-4 right-4 md:block"
          variant="outline"
          onClick={() => navigate("/register")}
        >
          Criar Conta
        </Button>

        {/* MOBILE - tudo em coluna e sem bg grey */}
        <div className="flex flex-col items-center justify-center p-8 space-y-6 md:hidden">
          <h1 className="text-3xl font-bold">B3Notifier</h1>
          <p className="text-center text-[hsl(var(--lightgrey))]">
            Um sistema feito para ajudar investidores na B3, acompanhando as
            cotações, enviando alertas personalizados e notificando por email
            quando surgirem boas oportunidades de compra ou venda!
          </p>
          <p className="text-sm text-center">
            Não tem conta?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Crie uma agora!
            </span>
          </p>
          {renderCardSteps()}
        </div>

        {/* DESKTOP - divisão esquerda/direita e bg grey */}
        <div className="hidden min-h-screen md:flex">
          {/* esquerda */}
          <div className="w-1/2 bg-[hsl(var(--grey))] text-white flex flex-col justify-between p-8">
            <div className="flex items-center gap-2">
              <ScanSearch size={35} className="text-[hsl(var(--white))]" />
              <h1 className="text-3xl font-bold">B3Notifier</h1>
            </div>
            <div className="flex-grow"></div>
            <p className="text-sm text-[hsl(var(--lightgrey))]">
              Um sistema feito para ajudar investidores na B3, acompanhando as
              cotações, enviando alertas personalizados e notificando por email
              quando surgirem boas oportunidades de compra ou venda!
            </p>
          </div>

          {/* direita */}
          <div className="flex items-center justify-center w-1/2">
            {renderCardSteps()}
          </div>
        </div>

        {/* alertas */}
        {toast && (
          <Toast
            variant={toast.type}
            className="fixed bottom-4 right-4 z-50 w-[320px]"
          >
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};

export default Login;
