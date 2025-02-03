import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Clock, Search, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getAlerts, getStockUpdatesInfo, getStocks } from "@/api";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState([]); 
  const [loading, setLoading] = useState(true);

  // armazena informações de update nos ativos
  const [updateInfo, setUpdateInfo] = useState({
    last_update: null,
  });

  // formata o tempo decorrido
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "Desconhecido";
    const diffInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    return `${Math.floor(diffInSeconds / 3600)} h`;
  };

  const fetchUpdateInfo = async () => {
    try {
      const data = await getStockUpdatesInfo();
      setUpdateInfo({
        last_update: data.last_update,
      });
    } catch (error) {
      console.error("Erro ao buscar informações de atualização:", error);
    }
  };

    // busca os ativos monitorados do usuario 
    useEffect(() => {
      const fetchStocks = async () => {
        try {
          const response = await getStocks();
          setStocks(response);
        } catch (error) {
          console.error("Erro ao carregar ativos:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStocks();
      fetchUpdateInfo();
  
      // atualizaçao nas infos de tempo de update
      const interval = setInterval(() => {
        fetchUpdateInfo();
      }, 60000); 
  
      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getAlerts();
        // se a resposta já for um array: response
        // caso contrário usamos response.data
        setAlerts(response.data || response || []);
      } catch (error) {
        console.error("Erro ao buscar alertas:", error);
        setAlerts([]);
      }
    };

    fetchAlerts();
  }, []);

  // converte a data pro formato brasileiro
  const formatDateBR = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // fortmando as horas vindas da api
  const formatTimeWithUnit = (timeStr) => {
    if (!timeStr) return "";
    let time = timeStr;
    if (timeStr.includes(" ")) {
      const parts = timeStr.split(" ");
      time = parts[1].substring(0, 5);
    } else {
      time = timeStr.substring(0, 5);
    }
    return `${time} h`;
  };

  // setando o conteudo do alert conforme o tipo
  const getAlertContent = (alert) => {
    switch (alert.alert_type) {
      case "buy_suggestion":
        return {
          title: `${alert.asset_name} - Momento para compra`,
          description: `O preço de ${alert.asset_name} está abaixo do limite. Considere comprar.`,
        };
      case "sell_suggestion":
        return {
          title: `${alert.asset_name} - Momento para venda`,
          description: `O preço de ${alert.asset_name} está acima do limite. Considere vender.`,
        };
      case "addition":
        return {
          title: `${alert.asset_name} adicionado`,
          description: `O ativo foi adicionado à sua lista de ativos monitorados.`,
        };
      case "removal":
        return {
          title: `${alert.asset_name} removido`,
          description: `O ativo foi removido da sua lista de ativos monitorados.`,
        };
      case "edition":
        return {
          title: `${alert.asset_name} editado`,
          description: `As informações do ativo foram atualizadas.`,
        };
      default:
        return {
          title: `${alert.asset_name}`,
          description: `Alerta sobre esse ativo!`,
        };
    }
  };

  // busca padrao
  const filteredAlerts = alerts.filter((alert) => {
    const asset = alert.asset_name?.toLowerCase() || "";
    const type = alert.alert_type?.toLowerCase() || "";
    return (
      asset.includes(searchQuery.toLowerCase()) ||
      type.includes(searchQuery.toLowerCase())
    );
  });

  // agrupando os alertas por data
  const groupedAlerts = filteredAlerts.reduce((acc, alert) => {
    const dateKey = alert.alert_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(alert);
    return acc;
  }, {});

  // estilos de cada tipo de alerta
  const getAlertStyles = (alertType) => {
    switch (alertType) {
      case "buy_suggestion":
        return { text: "text-[hsl(var(--green))]" };
      case "sell_suggestion":
        return { text: "text-[hsl(var(--red))]" };
      case "addition":
        return { text: "text-[#1E88E5]" };
      case "removal":
        return { text: "text-[#FBC02D]" };
      case "edition":
        return { text: "text-[#7B1FA2]" };
      default:
        return { text: "text-[hsl(var(--grey))]" };
    }
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ativos Monitorados</h1>
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={16} />
              Última Atualização:{" "}
              {updateInfo.last_update
                ? getTimeElapsed(updateInfo.last_update)
                : "Carregando..."}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
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
        {Object.keys(groupedAlerts).length > 0 ? (
          Object.keys(groupedAlerts).map((dateKey, index) => (
            <div key={dateKey}>
              {index > 0 && <Separator className="my-4" />}
              <h2 className="text-sm text-[hsl(var(--lightgrey))] font-medium text-center mb-2">
                {formatDateBR(dateKey)}
              </h2>
              <div className="space-y-4">
                {groupedAlerts[dateKey].map((alert) => {
                  const styles = getAlertStyles(alert.alert_type);
                  const { title, description } = getAlertContent(alert);
                  return (
                    <Alert key={alert.id} className={`border ${styles.border}`}>
                      <Bell className="h-5 w-5" />
                      <div className="flex flex-col">
                        <AlertTitle className={`${styles.text} font-semibold`}>
                          {title}
                        </AlertTitle>
                        <AlertDescription>{description}</AlertDescription>
                        <span className="text-sm text-[hsl(var(--lightgrey))] mt-1">
                          {formatTimeWithUnit(alert.alert_time)}
                        </span>
                      </div>
                    </Alert>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum alerta encontrado</p>
        )}
      </div>
    </div>
  );
};

export default Alerts;
