import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockCard from "./StockCard";
import CurrencyInput from "react-currency-input-field";

const timeIntervals = ["5 min", "10 min", "15 min", "30 min", "1 hora"];

const EditStockModal = ({ isOpen, onClose }) => {
  const [selectedTime, setSelectedTime] = useState(timeIntervals[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-[hsl(var(--background))] rounded-lg shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[hsl(var(--foreground))]" />
            <DialogTitle className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Editar Ativo
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            Edite as configurações do ativo, redefina os limites e ajuste a
            periodicidade
          </DialogDescription>
        </DialogHeader>

        <CurrencyInput
          placeholder="R$ 20,00"
          prefix="R$ "
          decimalSeparator=","
          groupSeparator="."
          decimalsLimit={2}
          className="w-full px-4 py-2 border border-[hsl(var(--red))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none"
        />

        <CurrencyInput
          placeholder="R$ 30,00"
          prefix="R$ "
          decimalSeparator=","
          groupSeparator="."
          decimalsLimit={2}
          className="w-full px-4 py-2 border border-[hsl(var(--green))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none"
        />

        {/* seletor de tempo */}
        <div className="relative mt-4">
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="flex items-center w-full gap-2 px-4 py-2">
              <Clock className="w-4 h-4 text-gray-500" />{" "}
              {/* Ícone à esquerda */}
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

        <StockCard ticker="ITUB4" price={29.0} buy={25.0} sell={30.0} />

        <div className="mt-4 border-t pt-4 border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              Alterar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockModal;
