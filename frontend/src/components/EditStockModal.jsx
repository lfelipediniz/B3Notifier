import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";



const EditStockModal = ({ isOpen, onClose }) => {
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
          Edite as configurações do ativo, redefina os limites e ajuste a periodicidade
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 border-t pt-4 border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockModal;
