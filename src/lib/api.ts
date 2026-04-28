const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
import Cookies from "js-cookie";

function getToken() {
  if (typeof window === "undefined") return null;
  return Cookies.get("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// Auth
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{
      message: string;
      user: { id: string; name: string; email: string };
    }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// Tasks
export type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
};

export type TasksResponse = {
  tasks: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const tasksApi = {
  getAll: (params?: { status?: string; page?: number; sort?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.sort) q.set("sort", params.sort);
    return request<TasksResponse>(`/tasks?${q.toString()}`);
  },
  create: (body: { title: string; description: string; status: string }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{ title: string; description: string; status: string }>,
  ) =>
    request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, { method: "DELETE" }),
};
