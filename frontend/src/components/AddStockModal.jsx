import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Search, Clock } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockCard from "./StockCard";
import { addStock, fetchStockQuote, getStocks, addAlert } from "@/api";
import { format, toZonedTime } from "date-fns-tz";

const timeIntervals = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
];

const AddStockModal = ({ isOpen, onClose, onStockAdded }) => {
  const [selectedTime, setSelectedTime] = useState(timeIntervals[0].value);
  const [assetName, setAssetName] = useState("");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [monitoredStocks, setMonitoredStocks] = useState([]);

  // busca os ativos monitorados do usuário
  useEffect(() => {
    if (isOpen) {
      getStocks()
        .then((data) => setMonitoredStocks(data))
        .catch((err) =>
          console.error("Erro ao buscar ativos monitorados:", err)
        );
    }
  }, [isOpen]);

  // busca a cotação do ativo digitado
  const handleSearch = async () => {
    if (!assetName.trim()) {
      setStockData(null);
      return;
    }
    setFetchingQuote(true);
    try {
      const response = await fetchStockQuote(assetName, selectedTime);
      setStockData(response);
    } catch (error) {
      console.error("Erro ao buscar cotação do ativo:", error);
      setStockData(null);
    } finally {
      setFetchingQuote(false);
    }
  };

  // normaliza o nome do ativo para o formato esperado pela api
  // Exemplo: "itub4" vira "ITUB4.SA"
  const getNormalizedAssetName = (name) => {
    const trimmed = name.trim().toUpperCase();
    return trimmed.endsWith(".SA") ? trimmed : trimmed + ".SA";
  };

  // verifica se o ativo buscado já está sendo monitorado
  const stockAlreadyMonitored =
    stockData &&
    monitoredStocks &&
    monitoredStocks.some(
      (stock) => stock.name.toLowerCase() === stockData.name.toLowerCase()
    );

  const handleAddStock = async () => {
    if (!assetName.trim() || !stockData) return;
    setLoading(true);
    const normalizedAssetName = getNormalizedAssetName(assetName);
    const data = {
      name: normalizedAssetName,
      periodicity: selectedTime,
    };

    try {
      const response = await addStock(data);
      if (onStockAdded) onStockAdded(response);

      // criando um alerta de adiçao
      const now = new Date();
      const timeZone = "America/Sao_Paulo";
      const zonedDate = toZonedTime(now, timeZone);

      const alert_date = format(zonedDate, "yyyy-MM-dd", { timeZone });
      const alert_time = format(zonedDate, "HH:mm", { timeZone });
      console.log(alert_date, alert_time);

      const alertData = {
        asset_name: normalizedAssetName,
        alert_type: "addition",
        alert_date,
        alert_time,
      };

      await addAlert(alertData);
      onClose();
    } catch (error) {
      console.error(
        "Erro ao adicionar ativo:",
        error.response ? error.response.data : error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-[hsl(var(--background))] rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[hsl(var(--foreground))]" />
            <DialogTitle className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Adicionar Ativo
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            Adicione o ativo que deseja monitorar
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center w-full mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute text-[hsl(var(--lightgrey))] -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <Input
              placeholder="Pesquisar Ativos..."
              className="pl-10"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <Button
            onClick={handleSearch}
            className="ml-2 bg-[hsl(var(--lightgrey))]"
          >
            Pesquisar
          </Button>
        </div>

        {assetName && (
          <div className="mb-4">
            {fetchingQuote ? (
              <p>Buscando cotação...</p>
            ) : stockData ? (
              <StockCard
                ticker={stockData.name}
                price={Number(stockData.current_price)}
                buy={Number(stockData.buy_limit)}
                sell={Number(stockData.sell_limit)}
                periodicity={`${selectedTime}`}
              />
            ) : (
              <p>Ativo não encontrado.</p>
            )}
          </div>
        )}

        <div className="relative mt-4">
          <Select
            value={selectedTime}
            onValueChange={(value) => setSelectedTime(Number(value))}
          >
            <SelectTrigger className="flex items-center w-full gap-2 px-4 py-2">
              <Clock className="w-4 h-4 text-[hsl(var(--lightgrey))]" />{" "}
              <SelectValue placeholder="Selecione o tempo..." />
            </SelectTrigger>
            <SelectContent className="w-48">
              {timeIntervals.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {stockData && stockAlreadyMonitored ? (
          <div className="mt-4 border-t pt-4 border-[hsl(var(--border))]">
            <p className="text-center text-[hsl(var(--foreground))]">
              Este ativo já está sendo monitorado.
            </p>
          </div>
        ) : (
          <div className="mt-4 border-t pt-4 border-[hsl(var(--border))] flex justify-between items-center">
            <Button
              onClick={handleAddStock}
              disabled={loading || stockAlreadyMonitored}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddStockModal;
