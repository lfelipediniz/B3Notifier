import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const FilterPopover = ({ filters, onFilterChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter size={18} />
          <span className="ml-2">Prioridade</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-4" align="start">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <Checkbox checked={filters.nearSell} onCheckedChange={() => onFilterChange("nearSell")} />
            Perto da Venda
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={filters.nearBuy} onCheckedChange={() => onFilterChange("nearBuy")} />
            Perto da Compra
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;