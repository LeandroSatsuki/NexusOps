const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erro inesperado." }));
    throw new Error(error.message ?? "Falha na requisição.");
  }
  return res.json() as Promise<T>;
}

export function priorityLabel(priority: string) {
  return { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta", CRITICA: "Crítica" }[priority] ?? priority;
}

export function statusLabel(status: string) {
  return (
    {
      NOVO: "Novo",
      TRIAGEM: "Triagem",
      EM_ANDAMENTO: "Em andamento",
      AGUARDANDO_USUARIO: "Aguardando usuário",
      AGUARDANDO_TERCEIRO: "Aguardando terceiro",
      RESOLVIDO: "Resolvido",
      FECHADO: "Fechado",
      CANCELADO: "Cancelado"
    }[status] ?? status
  );
}

