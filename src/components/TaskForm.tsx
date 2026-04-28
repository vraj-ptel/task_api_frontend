"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { tasksApi, type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  task?: Task | null;
}

export default function TaskForm({ open, onClose, onSaved, task }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo" });

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, description: task.description, status: task.status });
    } else {
      setForm({ title: "", description: "", status: "todo" });
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      if (task) {
        await tasksApi.update(task._id, form);
        toast.success("Task updated!");
      } else {
        await tasksApi.create(form);
        toast.success("Task created!");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" style={{ background: "hsl(20 12% 7%)", borderColor: "hsl(20 10% 16%)" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "Syne, sans-serif" }}>
            {task ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description <span style={{ color: "hsl(40 10% 55%)" }}>(optional)</span></Label>
            <Textarea
              placeholder="Add more context..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "hsl(20 12% 7%)", borderColor: "hsl(20 10% 16%)" }}>
                <SelectItem value="todo">📋 Todo</SelectItem>
                <SelectItem value="in-progress">🔄 In Progress</SelectItem>
                <SelectItem value="done">✅ Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
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
              type="submit"
              disabled={loading}
              className="flex-1 font-semibold"
              style={{ background: "hsl(28 95% 58%)", color: "hsl(20 14% 4%)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
