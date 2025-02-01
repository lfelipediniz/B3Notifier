import React from "react";
import { Card } from "@/components/ui/card";
import { SquareArrowUp, SquareArrowDown, Clock } from "lucide-react";

const StockCard = ({ ticker, price, buy, sell }) => {
  return (
    <Card className="p-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-md rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-[hsl(var(--foreground))]">Cotação Atual</span>
        <span className="text-lg font-bold text-[hsl(var(--foreground))]">R$ {price.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between mt-2 text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span className="text-base">Periodicidade</span>
        </div>
        <span className="text-base font-medium">15min</span>
      </div>

      <div className="mt-2">
        <span className="text-2xl font-extrabold text-[hsl(var(--foreground))]">{ticker}</span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-1">
          <SquareArrowUp className="w-5 h-5 text-[hsl(var(--lightgrey))]" />
          <span className="text-base text-[hsl(var(--lightgrey))]">Comprar</span>
        </div>
        <span className="text-lg font-bold text-[hsl(var(--green))]">R$ {buy.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-1">
          <SquareArrowDown className="w-5 h-5 text-[hsl(var(--lightgrey))]" />
          <span className="text-base text-[hsl(var(--lightgrey))]">Vender</span>
        </div>
        <span className="text-lg font-bold text-[hsl(var(--red))]">R$ {sell.toFixed(2)}</span>
      </div>
    </Card>
  );
};

export default StockCard;
