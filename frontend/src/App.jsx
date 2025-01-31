import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import Stocks from "./pages/Stocks";
import Header from "./components/Header";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper />
      </Router>
    </AuthProvider>
  );
}

// mostra o header apenas se o usuario estiver autenticado ou nao estiver nas rotas de login e registro
function AuthWrapper() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register"];

  return (
    <>
      {isAuthenticated && !hideHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<RequireAuth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stocks" element={<Stocks />} />
      </Routes>
    </>
  );
}

// redireciona pra rota correta com base no estado de autenticacao
function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/stocks" replace /> : <Navigate to="/register" replace />;
}

export default App;
