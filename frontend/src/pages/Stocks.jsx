import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Pencil, Plus, Search } from "lucide-react";
import StockCard from "@/components/StockCard";
import FilterPopover from "@/components/FilterPopover";
import AddStockModal from "@/components/AddStockModal";
import EditStockModal from "@/components/EditStockModal";

const stocks = [
  { ticker: "ITUB4", price: 29.0, buy: 25.0, sell: 30.0 },
  { ticker: "MGLU3", price: 29.0, buy: 25.0, sell: 30.0 },
  { ticker: "ITUB4", price: 29.0, buy: 25.0, sell: 30.0 },
  { ticker: "ITUB4", price: 29.0, buy: 25.0, sell: 30.0 },
];

const Stocks = () => {
  const [filters, setFilters] = useState({
    nearSell: false,
    nearBuy: false,
  });

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleEditClick = (stock) => {
    setSelectedStock(stock);
    setIsEditStockModalOpen(true);
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ativos Monitorados</h1>
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={16} /> Última Atualização há 3 min
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
        <Badge variant="outline" className="flex items-center gap-3">
          <Clock size={16} /> Última Atualização há 3 min
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input placeholder="Pesquisar Ativos..." className="pl-10" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stocks.map((stock, index) => (
          <StockCard
            key={index}
            {...stock}
            isEditMode={isEditMode}
            onEdit={() => handleEditClick(stock)}
            showEditIcon={isEditMode}
          />
        ))}
      </div>

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
