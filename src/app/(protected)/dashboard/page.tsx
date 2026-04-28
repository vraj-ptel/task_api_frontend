"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tasksApi, type Task, type TasksResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskForm from "@/components/TaskForm";
import DeleteDialog from "@/components/DeleteDialog";
import {
    Plus, LogOut, Zap, Pencil, Trash2,
    ChevronLeft, ChevronRight, ArrowUpDown,
    CheckCircle2, Circle, Clock, LayoutGrid,
} from "lucide-react";

const STATUS_CONFIG = {
    todo: { label: "Todo", icon: Circle, color: "hsl(215 80% 60%)", bg: "hsl(215 80% 60% / 0.12)" },
    "in-progress": { label: "In Progress", icon: Clock, color: "hsl(38 95% 55%)", bg: "hsl(38 95% 55% / 0.12)" },
    done: { label: "Done", icon: CheckCircle2, color: "hsl(142 70% 45%)", bg: "hsl(142 70% 45% / 0.12)" },
};

function StatusBadge({ status }: { status: Task["status"] }) {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ color: cfg.color, background: cfg.bg }}
        >
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
    const date = new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <div
            className="group rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]"
            style={{
                background: "hsl(20 12% 7%)",
                border: "1px solid hsl(20 10% 16%)",
                boxShadow: "0 2px 8px hsl(0 0% 0% / 0.3)",
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3
                        className="font-semibold text-sm mb-1 truncate"
                        style={{
                            fontFamily: "Syne, sans-serif",
                            textDecoration: task.status === "done" ? "line-through" : "none",
                            color: task.status === "done" ? "hsl(40 10% 45%)" : "hsl(40 20% 95%)",
                        }}
                    >
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-xs line-clamp-2 mb-3" style={{ color: "hsl(40 10% 55%)" }}>
                            {task.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={task.status} />
                        <span className="text-xs" style={{ color: "hsl(40 10% 40%)" }}>{date}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={onEdit}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                        style={{ color: "hsl(40 10% 55%)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(20 10% 16%)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                        style={{ color: "hsl(40 10% 55%)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(0 72% 51% / 0.15)"; e.currentTarget.style.color = "hsl(0 72% 51%)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(40 10% 55%)"; }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-xl p-5" style={{ background: "hsl(20 12% 7%)", border: "1px solid hsl(20 10% 16%)" }}>
            <div className="skeleton h-4 w-3/4 rounded mb-2" />
            <div className="skeleton h-3 w-full rounded mb-1" />
            <div className="skeleton h-3 w-2/3 rounded mb-3" />
            <div className="skeleton h-5 w-20 rounded-full" />
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<TasksResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [sort, setSort] = useState("desc");
    const [page, setPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTask, setDeleteTask] = useState<Task | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, sort };
            if (filterStatus !== "all") params.status = filterStatus;
            const res = await tasksApi.getAll(params as Parameters<typeof tasksApi.getAll>[0]);
            setData(res);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to fetch tasks";
            if (msg === "Unauthorized") {
                router.push("/sign-in");
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    }, [page, sort, filterStatus, router]);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) { router.push("/sign-in"); return; }
        fetchTasks();
    }, [fetchTasks, router]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [filterStatus, sort]);

    const handleLogout = () => {

        Cookies.remove('token')
        router.push("/sign-in");
    };

    // Stats
    const tasks = data?.tasks ?? [];
    const total = data?.pagination.total ?? 0;
    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    return (
        <div className="min-h-screen" style={{ background: "hsl(20 14% 4%)" }}>
            {/* Background blob */}
            <div className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none opacity-30"
                style={{ background: "radial-gradient(ellipse at top right, hsl(28 95% 58% / 0.08), transparent 60%)" }} />

            {/* Navbar */}
            <nav
                className="sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between"
                style={{ background: "hsl(20 14% 4% / 0.85)", borderColor: "hsl(20 10% 16%)", backdropFilter: "blur(12px)" }}
            >
                <div className="flex items-center gap-2">
                    {/* <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(28 95% 58%)" }}>
                        <Zap className="w-3.5 h-3.5 text-black" />
                    </div> */}
                    {/* <span className="font-bold" style={{ fontFamily: "Syne, sans-serif" }}>TaskFlow</span> */}
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg"
                    style={{ color: "hsl(40 10% 55%)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(20 10% 13%)"; e.currentTarget.style.color = "hsl(40 20% 85%)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "hsl(40 10% 55%)"; }}
                >
                    <LogOut className="w-4 h-4" /> Sign out
                </button>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 animate-fade-up">
                    <div>
                        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>My Tasks</h1>
                        <p className="text-sm" style={{ color: "hsl(40 10% 55%)" }}>
                            {total} task{total !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <Button
                        onClick={() => { setEditTask(null); setFormOpen(true); }}
                        className="flex items-center gap-2 font-semibold h-9"
                        style={{ background: "hsl(28 95% 58%)", color: "hsl(20 14% 4%)" }}
                    >
                        <Plus className="w-4 h-4" /> New Task
                    </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
                    {[
                        { name: "Todo", count: todoCount, ...STATUS_CONFIG.todo },
                        { name: "In Progress", count: inProgressCount, ...STATUS_CONFIG["in-progress"] },
                        { name: "Done", count: doneCount, ...STATUS_CONFIG.done },
                    ].map(({ name, count, color, bg }) => (
                        <div
                            key={name}
                            className="rounded-xl p-4 flex items-center gap-3"
                            style={{ background: "hsl(20 12% 7%)", border: "1px solid hsl(20 10% 16%)" }}
                        >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold" style={{ background: bg, color }}>
                                {count}
                            </div>
                            <div>
                                <div className="text-xs" style={{ color: "hsl(40 10% 55%)" }}>{name}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div
                    className="flex items-center gap-3 mb-6 p-3 rounded-xl animate-fade-up"
                    style={{ background: "hsl(20 12% 7%)", border: "1px solid hsl(20 10% 16%)", animationDelay: "0.1s" }}
                >
                    <LayoutGrid className="w-4 h-4 shrink-0" style={{ color: "hsl(40 10% 55%)" }} />
                    <div className="flex gap-1.5 flex-1 flex-wrap">
                        {[
                            { value: "all", label: "All" },
                            { value: "todo", label: "📋 Todo" },
                            { value: "in-progress", label: "🔄 In Progress" },
                            { value: "done", label: "✅ Done" },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setFilterStatus(value)}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                style={{
                                    background: filterStatus === value ? "hsl(28 95% 58%)" : "transparent",
                                    color: filterStatus === value ? "hsl(20 14% 4%)" : "hsl(40 10% 55%)",
                                    border: filterStatus === value ? "none" : "1px solid hsl(20 10% 16%)",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        <ArrowUpDown className="w-3.5 h-3.5" style={{ color: "hsl(40 10% 55%)" }} />
                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger className="h-8 w-32 text-xs" style={{ borderColor: "hsl(20 10% 16%)", background: "transparent" }}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ background: "hsl(20 12% 7%)", borderColor: "hsl(20 10% 16%)" }}>
                                <SelectItem value="desc">Newest first</SelectItem>
                                <SelectItem value="asc">Oldest first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Task grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: "hsl(20 12% 7%)", border: "1px solid hsl(20 10% 16%)" }}
                        >
                            <CheckCircle2 className="w-7 h-7" style={{ color: "hsl(40 10% 40%)" }} />
                        </div>
                        <p className="font-semibold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>No tasks found</p>
                        <p className="text-sm mb-5" style={{ color: "hsl(40 10% 55%)" }}>
                            {filterStatus !== "all" ? "Try a different filter" : "Create your first task to get started"}
                        </p>
                        {filterStatus === "all" && (
                            <Button
                                onClick={() => { setEditTask(null); setFormOpen(true); }}
                                className="font-semibold"
                                style={{ background: "hsl(28 95% 58%)", color: "hsl(20 14% 4%)" }}
                            >
                                <Plus className="w-4 h-4 mr-1" /> New Task
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((task, i) => (
                            <div key={task._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                                <TaskCard
                                    task={task}
                                    onEdit={() => { setEditTask(task); setFormOpen(true); }}
                                    onDelete={() => setDeleteTask(task)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8 animate-fade-up">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            style={{ borderColor: "hsl(20 10% 16%)", background: "transparent" }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex gap-1.5">
                            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        background: p === page ? "hsl(28 95% 58%)" : "hsl(20 12% 7%)",
                                        color: p === page ? "hsl(20 14% 4%)" : "hsl(40 10% 55%)",
                                        border: p === page ? "none" : "1px solid hsl(20 10% 16%)",
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === data.pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            style={{ borderColor: "hsl(20 10% 16%)", background: "transparent" }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </main>

            {/* Modals */}
            <TaskForm
                open={formOpen}
                onClose={() => { setFormOpen(false); setEditTask(null); }}
                onSaved={fetchTasks}
                task={editTask}
            />

            {deleteTask && (
                <DeleteDialog
                    open={!!deleteTask}
                    taskId={deleteTask._id}
                    taskTitle={deleteTask.title}
                    onClose={() => setDeleteTask(null)}
                    onDeleted={fetchTasks}
                />
            )}
        </div>
    );
}
