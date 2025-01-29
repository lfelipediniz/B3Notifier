import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <h2 className="text-2xl font-bold mb-4">Registrar</h2>
      <Button onClick={handleLogin}>Teste</Button>
    </div>
  );
};

export default Register;
