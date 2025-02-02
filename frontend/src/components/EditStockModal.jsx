import React, { useState, useEffect } from "react";
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
import { updateStock, deleteStock } from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const timeIntervals = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
];

const EditStockModal = ({ isOpen, onClose, stock, onStockUpdated }) => {
  const [selectedTime, setSelectedTime] = useState(
    stock ? Number(stock.periodicity) : timeIntervals[0].value
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // quando o ativo (ou o modal) mudar o estado do selectedTime é atualizado
  useEffect(() => {
    if (stock) {
      setSelectedTime(Number(stock.periodicity));
    }
  }, [stock]);

  const handleUpdateStock = async () => {
    if (!stock) return;
    setLoading(true);
    try {
      const data = { periodicity: selectedTime };
      const response = await updateStock(stock.id, data);
      if (onStockUpdated) {
        onStockUpdated(response);
      }
      onClose();
    } catch (error) {
      console.error(
        "Erro ao atualizar ativo:",
        error.response ? error.response.data : error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async () => {
    if (!stock) return;
    setDeleting(true);
    try {
      await deleteStock(stock.id);
      if (onStockUpdated) {
        onStockUpdated({ id: stock.id, deleted: true });
      }
      onClose();
    } catch (error) {
      console.error(
        "Erro ao remover ativo:",
        error.response ? error.response.data : error
      );
    } finally {
      setDeleting(false);
    }
  };

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
            periodicidade.
          </DialogDescription>
        </DialogHeader>

         {/* seletor de tempo */}
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

        {stock && (
          <StockCard
            ticker={stock.name}
            price={Number(stock.current_price)}
            buy={Number(stock.lower_limit)}
            sell={Number(stock.upper_limit)}
            periodicity={stock.periodicity}
          />
        )}

        <div className="mt-4 border-t pt-4 border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleUpdateStock}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              disabled={loading || deleting}
            >
              {loading ? "Atualizando..." : "Alterar"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  style={{ backgroundColor: "hsl(var(--red))" }}
                  className="text-[hsl(var(--primary-foreground))]"
                  disabled={deleting || loading}
                >
                  {deleting ? "Removendo..." : "Remover"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Ativo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você realmente deseja remover este ativo? Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteStock}>
                    {deleting ? "Removendo..." : "Remover"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockModal;
