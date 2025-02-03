import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock, Search, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import FilterPopover from "@/components/FilterPopover";

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const filters = [];
  const handleFilterChange = (newFilters) => {
    console.log("Filtros atualizados:", newFilters);
  };

  const alerts = [
    {
      id: 1,
      title: "ITUB4 adicionado",
      description: "O ativo foi adicionado à sua lista de ativos monitorados",
      time: "14:20h",
      date: "28/01/2025",
    },
    {
      id: 2,
      title: "MGLU3 adicionado",
      description: "O ativo foi adicionado à sua lista de ativos monitorados",
      time: "14:20h",
      date: "28/01/2025",
    },
    {
      id: 3,
      title: "ITUB4: Momento ideal para compra",
      description: "O preço do ITUB4 caiu abaixo do limite inferior de R$25,00",
      time: "10:24h",
      date: "28/01/2025",
      highlight: true,
    },
    {
      id: 4,
      title: "PETR4 adicionado",
      description: "O ativo foi adicionado à sua lista de ativos monitorados",
      time: "16:00h",
      date: "27/01/2025",
    },
  ];

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.date]) acc[alert.date] = [];
    acc[alert.date].push(alert);
    return acc;
  }, {});

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ativos Monitorados</h1>
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={16} /> Última atualização: 10 min
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <FilterPopover filters={filters} onFilterChange={handleFilterChange} />
        <div className="relative w-full max-w-md">
          <Search
            className="absolute text-[hsl(var(--lightgrey))] left-3 top-1/2 transform -translate-y-1/2"
            size={20}
          />
          <Input
            placeholder="Pesquisar Alertas..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedAlerts).map((date, index) => (
          <div key={date}>
            {index > 0 && <Separator className="my-4" />}
            <h2 className="text-sm text-[hsl(var(--lightgrey))] font-medium text-center mb-2">{date}</h2>
            <div className="space-y-4">
              {groupedAlerts[date].map((alert) => (
                <Alert
                  key={alert.id}
                  className={`border ${alert.highlight ? "border-[hsl(var(--green))]" : "border-[hsl(var(--midwhite))]"}`}
                >
                  <Bell className="h-5 w-5" />
                  <div className="flex flex-col">
                    <AlertTitle className={alert.highlight ? "text-[hsl(var(--green))] font-semibold" : ""}>
                      {alert.title}
                    </AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                    <span className="text-sm text-[hsl(var(--lightgrey))] mt-1">{alert.time}</span>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
