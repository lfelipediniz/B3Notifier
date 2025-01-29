import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen">
      <Button 
        className="absolute top-4 right-4" 
        variant="outline" 
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
      
      {/* esquerda */}
      <div className="w-1/2 bg-[hsl(var(--grey))] text-white flex flex-col justify-between p-8">
        <h1 className="text-3xl font-bold">B3Notifier</h1>
        <div className="flex-grow"></div>
        <p className="text-sm text-[hsl(var(--lighgrey))]">
          Um sistema feito para ajudar investidores na B3, acompanhando as
          cotações, enviando alertas personalizados e notificando por email
          quando surgirem boas oportunidades de compra ou venda!
        </p>
      </div>
      {/* direita */}
      <div className="flex items-center justify-center w-1/2">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Crie uma conta</h2>
            <p className="text-center text-[hsl(var(--lightgrey))]">
              Adicione o seu email que irá receber as notificações do mercado
            </p>
            <Input type="email" placeholder="nome@exemplo.com" className="w-full" />
            <Button className="w-full bg-[hsl(var(--grey))] text-white">Enviar</Button>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-[hsl(var(--midwhite))]"></div>
              <span className="px-4 text-[hsl(var(--lightgrey))] text-sm font-medium">OU CONTINUE COM</span>
              <div className="flex-grow h-px bg-[hsl(var(--midwhite))]"></div>
            </div>
            <Button variant="outline" className="w-full">Google</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;