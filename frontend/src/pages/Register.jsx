import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ScanSearch } from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@/components/ui/toast";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // logs para conferir o que esta sendo feito
  const showToast = (title, description, type = "default") => {
    setToast({ title, description, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNextStep = () => {
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast("Erro", "Insira um email válido!", "error");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      showToast("Erro", "Código inválido!", "error");
      return;
    }
    handleNextStep();
  };

  const handleCreateAccount = () => {
    if (formData.username.length > 20) {
      showToast(
        "Erro",
        "Nome de usuário deve ter no máximo 20 caracteres!",
        "error"
      );
      return;
    }
    if (formData.password.length > 20) {
      showToast("Erro", "A senha deve ter no máximo 20 caracteres.", "error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Erro", "As senhas não coincidem!", "error");
      return;
    }
    showToast("Sucesso", "Conta criada com sucesso!", "success");
  };

  // repassando o mesmo card pra nao duplicar codigo
  const renderCardSteps = () => (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Crie uma conta</h2>

        {/* step 1 - enviar o email pra verificacao */}
        {step === 1 && (
          <>
            <p className="text-center text-[hsl(var(--lightgrey))]">
              Adicione o seu email que irá receber as notificações do mercado
            </p>
            <Input
              type="email"
              placeholder="nome@exemplo.com"
              className="w-full"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Button
              className="w-full bg-[hsl(var(--grey))] text-white"
              onClick={handleNextStep}
            >
              Enviar
            </Button>
          </>
        )}

        {/* step 2 - validacao do email com codigo de verificacao */}
        {step === 2 && (
          <>
            <p className="text-center text-[hsl(var(--foreground))]">
              Enviamos um código de verificação para o seu email
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                pattern="[0-9]*"
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  // tira os char não numéricos (codigo apenas com numeros)
                }}
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    // mapeando o array para nao ter que inserir individualmente
                    // https://ui.shadcn.com/docs/components/input-otp
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full bg-[hsl(var(--grey))] text-white"
              onClick={handleVerifyOTP}
            >
              Verificar
            </Button>

            {/* botao unico de voltar para o passo anterior, caso o email inserido foi incorreto */}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handlePrevStep}
            >
              Voltar
            </Button>
          </>
        )}

        {/* step 3 - add informacoes finais */}
        {step === 3 && (
          <>
            <p className="text-center text-[hsl(var(--foreground))]">
              Email verificado! Insira os dados da conta
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

            <Input
              type="password"
              placeholder="Repita a senha"
              className="w-full"
              maxLength={20}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <Button
              className="w-full bg-[hsl(var(--grey))] text-white"
              onClick={handleCreateAccount}
            >
              Criar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ToastProvider>
      <div className="relative min-h-screen">
        <Button
          className="absolute hidden top-4 right-4 md:block"
          variant="outline"
          onClick={() => navigate("/login")}
        >
          Login
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
            Já tem conta?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Faça login
            </span>
          </p>

          {/* card com steps no mobile */}
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
            {/* Card com steps no desktop */}
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

export default Register;
