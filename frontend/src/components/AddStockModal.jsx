import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Search, Clock, CircleArrowRight } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockCard from "./StockCard";

const timeIntervals = ["5 min", "10 min", "15 min", "30 min", "1 hora"];

const AddStockModal = ({ isOpen, onClose }) => {
  const [selectedTime, setSelectedTime] = useState(timeIntervals[0]);
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

        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input placeholder="Pesquisar Ativos..." className="pl-10" />
        </div>

        <StockCard ticker="ITUB4" price={29.0} buy={25.0} sell={30.0} />
        {/* seletor de tempo */}
        <div className="relative mt-4">
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="flex items-center w-full gap-2 px-4 py-2">
              <Clock className="w-4 h-4 text-[hsl(var(--lightgrey))]" />{" "}
              <SelectValue placeholder="Selecione o tempo..." />
            </SelectTrigger>
            <SelectContent className="w-48">
              {timeIntervals.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CircleArrowRight
          size={30}
          className="text-[hsl(var(--lightgrey))] mx-auto cursor-pointer"
        />

        <div className="mt-4 border-t pt-4 border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4 text-[hsl(var(--foreground))]" />
              <Button
                variant="link"
                className="text-[hsl(var(--foreground))] ml-[-12px]"
              >
                Adicionar e Editar
              </Button>
            </div>
            <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockModal;
