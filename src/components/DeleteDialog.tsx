"use client";
import { useState } from "react";
import { toast } from "sonner";
import { tasksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteDialog({ open, taskId, taskTitle, onClose, onDeleted }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await tasksApi.delete(taskId);
      toast.success("Task deleted");
      onDeleted();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm" style={{ background: "hsl(20 12% 7%)", borderColor: "hsl(20 10% 16%)" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "Syne, sans-serif" }}>Delete Task</DialogTitle>
          <DialogDescription style={{ color: "hsl(40 10% 55%)" }}>
            Are you sure you want to delete <span className="font-medium" style={{ color: "hsl(40 20% 95%)" }}>&quot;{taskTitle}&quot;</span>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            style={{ borderColor: "hsl(20 10% 16%)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 font-semibold"
            style={{ background: "hsl(0 72% 51%)", color: "white" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1" /> Delete</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
