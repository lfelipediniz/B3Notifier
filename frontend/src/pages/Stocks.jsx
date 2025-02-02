import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Pencil, Plus, Search } from "lucide-react";
import StockCard from "@/components/StockCard";
import FilterPopover from "@/components/FilterPopover";
import AddStockModal from "@/components/AddStockModal";
import EditStockModal from "@/components/EditStockModal";
import { getStocks, getStockUpdatesInfo } from "@/api"; 

const Stocks = () => {
  const [filters, setFilters] = useState({
    nearSell: false,
    nearBuy: false,
  });
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stocks, setStocks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // armazena informações de update nos ativos
  const [updateInfo, setUpdateInfo] = useState({
    last_update: null,
    next_update: null,
    time_until_next_update_seconds: null
  });
  
  // checkboxes complementares
  const handleFilterChange = (filter) => {
    setFilters((prev) => {
      if (filter === "nearBuy") {
        return { nearBuy: !prev.nearBuy, nearSell: false };
      }
      if (filter === "nearSell") {
        return { nearBuy: false, nearSell: !prev.nearSell };
      }
      return prev;
    });
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleEditClick = (stock) => {
    setSelectedStock(stock);
    setIsEditStockModalOpen(true);
  };

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
        next_update: data.next_update,
        time_until_next_update_seconds: data.time_until_next_update_seconds
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // filtra os stocks pelo nome
  let displayedStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ordena pela proximidade do preço atual ao valor de compra 
  if (filters.nearBuy) {
    displayedStocks.sort((a, b) => {
      const diffA = Math.abs(a.current_price - a.lower_limit);
      const diffB = Math.abs(b.current_price - b.lower_limit);
      return diffA - diffB;
    });
  }
  // ordena pela proximidade do preço atual ao valor de venda
  else if (filters.nearSell) {
    displayedStocks = displayedStocks.filter(
      (stock) => stock.current_price <= stock.upper_limit
    );
    displayedStocks.sort((a, b) => {
      const diffA = a.upper_limit - a.current_price;
      const diffB = b.upper_limit - b.current_price;
      return diffA - diffB;
    });
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ativos Monitorados</h1>
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={16} />
              Última Atualização: {updateInfo.last_update ? getTimeElapsed(updateInfo.last_update) : "Carregando..."}
            </Badge>
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsAddStockModalOpen(true)}
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:hidden">
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock size={16} />
          Última Atualização: {updateInfo.last_update ? getTimeElapsed(updateInfo.last_update) : "Carregando..."}
        </Badge>
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsAddStockModalOpen(true)}
        >
          <Plus size={18} />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-col items-start justify-between gap-2 mb-3 sm:flex-row sm:items-center">
          <div className="flex flex-col items-start w-full gap-2 sm:flex-row sm:items-center">
            <FilterPopover
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <div className="relative w-full max-w-md">
              <Search
                className="absolute text-[hsl(var(--lightgrey))]] -translate-y-1/2 left-3 top-1/2"
                size={20}
              />
              <Input 
                placeholder="Pesquisar Ativos..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <Button
            variant={isEditMode ? "destructive" : "outline"}
            onClick={toggleEditMode}
          >
            <Pencil size={18} />{" "}
            <span className="ml-2">{isEditMode ? "Sair" : "Editar"}</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center p-4 md:hidden">
        <Button
          variant={isEditMode ? "destructive" : "outline"}
          onClick={toggleEditMode}
        >
          <Pencil size={18} />{" "}
          <span className="ml-2">{isEditMode ? "Sair" : "Editar"}</span>
        </Button>
      </div>

      {loading ? (
        <p>Carregando ativos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedStocks.length > 0 ? (
            displayedStocks.map((stock) => (
              <StockCard
                key={stock.id}
                ticker={stock.name}
                periodicity={stock.periodicity}
                price={Number(stock.current_price)}
                buy={Number(stock.lower_limit)}
                sell={Number(stock.upper_limit)}
                isEditMode={isEditMode}
                onEdit={() => handleEditClick(stock)}
                showEditIcon={isEditMode}
              />
            ))
          ) : (
            <p>Nenhum ativo monitorado encontrado</p>
          )}
        </div>
      )}

      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
      <EditStockModal
        isOpen={isEditStockModalOpen}
        stock={selectedStock}
        onClose={() => setIsEditStockModalOpen(false)}
      />
    </div>
  );
};

export default Stocks;
