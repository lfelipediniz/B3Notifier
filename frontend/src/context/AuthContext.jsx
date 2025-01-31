import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getUserProfile, loginUser, logout as apiLogout } from "../api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("access_token");
  });

  const [user, setUser] = useState(null);

  // carrega o perfil do usuario se estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // ve se existe mudanca no localStorage
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("access_token"));
    };

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // busca os dados do usuario autenticado
  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao obter perfil do usuário:", error);
      logout();
    }
  };

  // captura do token e perfil do usuário
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.access) {
        setIsAuthenticated(true);
        await fetchUserProfile(); // carrega dps de autenticar
      }
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  // removendo tokens e limpando o estado
  const logout = () => {
    apiLogout(); // remove tokens e headers
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
