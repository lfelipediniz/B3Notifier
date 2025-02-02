import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ScanSearch } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // para conferir se a rota atual e a mesma que a rota passada
  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex full-width-header items-center justify-between p-4 border-b border-[hsl(var(--midwhite))] bg-[hsl(var(--white))]">
      <Link to="/stocks" className="flex items-center gap-2 cursor-pointer">
        <ScanSearch size={25} className="text-[hsl(var(--grey))]" />
        <span className="text-2xl font-semibold text-[hsl(var(--grey))]">
          B3Notifier
        </span>
      </Link>

      {/* navegacao */}
      <nav className="flex items-center gap-6 text-sm">
        <Link
          to="/stocks"
          className={`font-medium ${
            isActive("/stocks")
              ? "text-[hsl(var(--grey))]"
              : "text-[hsl(var(--lightgrey))]"
          }`}
        >
          Ativos
        </Link>

        <Link
          to="/alerts"
          className={`font-medium ${
            isActive("/alerts")
              ? "text-[hsl(var(--grey))]"
              : "text-[hsl(var(--lightgrey))]"
          }`}
        >
          Alertas
        </Link>
      </nav>

      {/* avatar aparece apenas na versao desktop */}
      {isAuthenticated && (
        <div className="items-center hidden gap-4 md:flex">
          <span className="text-sm font-medium text-[hsl(var(--grey))]">
            {user?.username || "Usuário"}
          </span>
          <Link to="/" className="cursor-pointer" onClick={logout}>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={user?.avatar}
                alt={user?.username}
              />
              <AvatarFallback className="bg-[hsl(var(--midwhite))] text-[hsl(var(--grey))]">
                {user?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      )}
      {/* botao de sair exibido no lugar do avatar no mobile */}
      {isAuthenticated && (
        <button
          onClick={logout}
          className="text-sm font-medium text-[hsl(var(--red))] cursor-pointer block md:hidden"
        >
          Sair
        </button>
      )}
    </header>
  );
};

export default Header;
