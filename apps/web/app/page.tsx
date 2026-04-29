"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Columns3,
  Computer,
  LayoutDashboard,
  List,
  LogOut,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
  Ticket,
  Users
} from "lucide-react";
import { apiFetch, ApiSession, priorityLabel, statusLabel } from "@/lib/api";

type View = "dashboard" | "machines" | "tickets" | "users";
type TicketView = "board" | "list" | "calendar";

const statuses = ["NOVO", "TRIAGEM", "EM_ANDAMENTO", "AGUARDANDO_USUARIO", "AGUARDANDO_TERCEIRO", "RESOLVIDO", "FECHADO", "CANCELADO"];
const priorities = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];
const categories = ["Hardware", "Software", "Rede", "Acesso", "Impressora", "E-mail", "ERP", "Segurança", "Outro"];

export default function Home() {
  const [session, setSession] = useState<ApiSession | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("nexusops.session");
    if (raw) setSession(JSON.parse(raw));
    setBooted(true);
  }, []);

  if (!booted) return <div className="p-8 text-sm text-muted-foreground">Carregando NexusOps...</div>;
  if (!session) return <Login onLogin={setSession} />;
  return <AppShell session={session} onLogout={() => setSession(null)} />;
}

function Login({ onLogin }: { onLogin: (session: ApiSession) => void }) {
  const [email, setEmail] = useState("admin@nexusops.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      const data = await apiFetch<ApiSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("nexusops.session", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">NexusOps</h1>
            <p className="text-sm text-muted-foreground">Acesso interno</p>
          </div>
        </div>
        <label className="text-sm font-medium" htmlFor="login-email">E-mail</label>
        <input id="login-email" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-4 block text-sm font-medium" htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {error ? <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950">{error}</p> : null}
        <button className="mt-5 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" onClick={submit}>
          Entrar
        </button>
      </section>
    </main>
  );
}

function AppShell({ session, onLogout }: { session: ApiSession; onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "machines", label: "Máquinas", icon: Computer },
    { id: "tickets", label: "Chamados", icon: Ticket },
    { id: "users", label: "Usuários", icon: Users }
  ] as const;

  function logout() {
    apiFetch("/auth/logout", { method: "POST" }, session.accessToken).catch(() => undefined);
    localStorage.removeItem("nexusops.session");
    onLogout();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-card p-4 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity size={18} />
          </div>
          <div>
            <strong>NexusOps</strong>
            <p className="text-xs text-muted-foreground">Operação interna</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${view === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setView(item.id)}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4">
          <div>
            <h2 className="font-semibold">{nav.find((item) => item.id === view)?.label}</h2>
            <p className="text-xs text-muted-foreground">{session.user.name} · {session.user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-md border p-2" title="Alternar tema" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="rounded-md border p-2" title="Sair" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-6">
          {view === "dashboard" && <Dashboard token={session.accessToken} />}
          {view === "machines" && <Machines token={session.accessToken} />}
          {view === "tickets" && <Tickets token={session.accessToken} session={session} />}
          {view === "users" && <UsersView token={session.accessToken} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ token }: { token: string }) {
  const [data, setData] = useState<any>();
  useEffect(() => {
    apiFetch("/dashboard", {}, token).then(setData).catch(console.error);
  }, [token]);

  if (!data) return <Skeleton label="Carregando dashboard..." />;
  const cards = [
    ["Máquinas", data.cards.totalMachines, Computer],
    ["Online", data.cards.onlineMachines, CheckCircle2],
    ["Offline", data.cards.offlineMachines, AlertTriangle],
    ["Alertas abertos", data.cards.openAlerts, AlertTriangle],
    ["Tickets abertos", data.cards.openTickets, Ticket]
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value, Icon]: any) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <Icon className="mb-3 text-primary" size={20} />
            <p className="text-sm text-muted-foreground">{label}</p>
            <strong className="text-2xl">{value}</strong>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Tickets por status">
          <MetricList data={data.ticketsByStatus} formatter={statusLabel} />
        </Panel>
        <Panel title="Últimos tickets">
          <div className="space-y-2">
            {data.recentTickets.map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>{ticket.friendlyId} · {ticket.title}</span>
                <Badge>{priorityLabel(ticket.priority)}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Machines({ token }: { token: string }) {
  const [machines, setMachines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    apiFetch<any[]>(`/machines${search ? `?search=${encodeURIComponent(search)}` : ""}`, {}, token).then(setMachines).catch(console.error);
  }, [token, search]);

  return (
    <Panel title="Inventário de máquinas" action={<SearchBox value={search} onChange={setSearch} placeholder="Buscar hostname, usuário, IP, patrimônio" />}>
      <div className="overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr><th className="py-2">Hostname</th><th>Status</th><th>Usuário</th><th>IP</th><th>SO</th><th>RAM</th><th>Disco livre</th><th>Último heartbeat</th></tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id} className="border-b">
                <td className="py-3 font-medium">{machine.hostname}</td>
                <td><Badge tone={machine.status === "ONLINE" ? "green" : "amber"}>{machine.status}</Badge></td>
                <td>{machine.currentUser ?? "-"}</td>
                <td>{machine.localIp ?? "-"}</td>
                <td>{machine.osName} {machine.osVersion}</td>
                <td>{machine.totalRamMb ? `${Math.round(machine.totalRamMb / 1024)} GB` : "-"}</td>
                <td>{machine.freeStorageGb ?? "-"} GB</td>
                <td>{machine.lastHeartbeatAt ? new Date(machine.lastHeartbeatAt).toLocaleString("pt-BR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Tickets({ token, session }: { token: string; session: ApiSession }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [view, setView] = useState<TicketView>("board");
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);

  async function load() {
    const [ticketRows, machineRows] = await Promise.all([
      apiFetch<any[]>(`/tickets${search ? `?search=${encodeURIComponent(search)}` : ""}`, {}, token),
      apiFetch<any[]>("/machines", {}, token)
    ]);
    setTickets(ticketRows);
    setMachines(machineRows);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [search]);

  async function move(ticket: any, status: string) {
    await apiFetch(`/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Segment active={view === "board"} onClick={() => setView("board")} icon={<Columns3 size={15} />} label="Board" />
          <Segment active={view === "list"} onClick={() => setView("list")} icon={<List size={15} />} label="Lista" />
          <Segment active={view === "calendar"} onClick={() => setView("calendar")} icon={<CalendarDays size={15} />} label="Calendário" />
        </div>
        <div className="flex gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Pesquisar chamados" />
          <button className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => setOpenForm(true)}>
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>
      {view === "board" && <TicketBoard tickets={tickets} onMove={move} />}
      {view === "list" && <TicketList tickets={tickets} />}
      {view === "calendar" && <TicketCalendar tickets={tickets} />}
      {openForm && <TicketForm token={token} session={session} machines={machines} onClose={() => setOpenForm(false)} onCreated={load} />}
    </div>
  );
}

function TicketBoard({ tickets, onMove }: { tickets: any[]; onMove: (ticket: any, status: string) => void }) {
  const [dragging, setDragging] = useState<any>(null);
  return (
    <div className="grid gap-3 overflow-x-auto pb-2 lg:grid-cols-4 xl:grid-cols-8">
      {statuses.map((status) => {
        const rows = tickets.filter((ticket) => ticket.status === status);
        return (
          <section
            key={status}
            className="min-h-96 min-w-64 rounded-lg border bg-card p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragging && onMove(dragging, status)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{statusLabel(status)}</h3>
              <Badge>{rows.length}</Badge>
            </div>
            <div className="space-y-2">
              {rows.map((ticket) => (
                <article key={ticket.id} draggable onDragStart={() => setDragging(ticket)} className="cursor-grab rounded-md border bg-background p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">{ticket.friendlyId}</span>
                    <Badge tone={ticket.priority === "CRITICA" ? "red" : ticket.priority === "ALTA" ? "amber" : "slate"}>{priorityLabel(ticket.priority)}</Badge>
                  </div>
                  <p className="text-sm font-medium">{ticket.title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{ticket.machine?.hostname ?? "Sem máquina"} · {ticket.assignee?.name ?? "Sem responsável"}</p>
                  {ticket.dueAt ? <p className="mt-1 text-xs text-muted-foreground">Prazo {new Date(ticket.dueAt).toLocaleDateString("pt-BR")}</p> : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TicketList({ tickets }: { tickets: any[] }) {
  return (
    <Panel title="Lista de chamados">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b text-muted-foreground"><tr><th className="py-2">ID</th><th>Título</th><th>Status</th><th>Prioridade</th><th>Responsável</th><th>Máquina</th><th>Prazo</th></tr></thead>
        <tbody>{tickets.map((ticket) => <tr key={ticket.id} className="border-b"><td className="py-3 font-medium">{ticket.friendlyId}</td><td>{ticket.title}</td><td>{statusLabel(ticket.status)}</td><td>{priorityLabel(ticket.priority)}</td><td>{ticket.assignee?.name ?? "-"}</td><td>{ticket.machine?.hostname ?? "-"}</td><td>{ticket.dueAt ? new Date(ticket.dueAt).toLocaleDateString("pt-BR") : "-"}</td></tr>)}</tbody>
      </table>
    </Panel>
  );
}

function TicketCalendar({ tickets }: { tickets: any[] }) {
  const byDate = useMemo(() => {
    return tickets.reduce<Record<string, any[]>>((acc, ticket) => {
      const key = ticket.dueAt ? new Date(ticket.dueAt).toLocaleDateString("pt-BR") : "Sem prazo";
      acc[key] = [...(acc[key] ?? []), ticket];
      return acc;
    }, {});
  }, [tickets]);
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Object.entries(byDate).map(([date, rows]) => (
        <Panel key={date} title={date}>
          <div className="space-y-2">{rows.map((ticket) => <div key={ticket.id} className="rounded-md border p-3 text-sm">{ticket.friendlyId} · {ticket.title}</div>)}</div>
        </Panel>
      ))}
    </div>
  );
}

function TicketForm({ token, session, machines, onClose, onCreated }: { token: string; session: ApiSession; machines: any[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIA", category: "Software", machineId: "" });
  async function create() {
    await apiFetch("/tickets", { method: "POST", body: JSON.stringify({ ...form, requesterId: session.user.id, machineId: form.machineId || undefined }) }, token);
    await onCreated();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-10 bg-black/30 p-4">
      <section className="ml-auto h-full w-full max-w-xl overflow-auto rounded-lg bg-card p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Novo chamado</h3>
        <input className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="mt-3 h-32 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((p) => <option key={p} value={p}>{priorityLabel(p)}</option>)}</select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })}><option value="">Sem máquina</option>{machines.map((m) => <option key={m.id} value={m.id}>{m.hostname}</option>)}</select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border px-3 py-2 text-sm" onClick={onClose}>Cancelar</button>
          <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={create}>Criar chamado</button>
        </div>
      </section>
    </div>
  );
}

function UsersView({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SOLICITANTE");
  async function load() {
    setUsers(await apiFetch<any[]>("/users", {}, token));
  }
  useEffect(() => { load().catch(console.error); }, []);
  async function create() {
    await apiFetch("/users", { method: "POST", body: JSON.stringify({ name, email, role, password }) }, token);
    setName(""); setEmail(""); setPassword(""); setRole("SOLICITANTE"); await load();
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Panel title="Cadastrar usuário">
        <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Senha inicial" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}><option>ADMIN</option><option>TECNICO</option><option>GESTOR</option><option>SOLICITANTE</option></select>
        <button className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={create}>Criar</button>
      </Panel>
      <Panel title="Usuários">
        <div className="space-y-2">{users.map((user) => <div key={user.id} className="flex items-center justify-between rounded-md border p-3 text-sm"><span>{user.name}<br /><small className="text-muted-foreground">{user.email}</small></span><Badge>{user.role}</Badge></div>)}</div>
      </Panel>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-lg border bg-card p-4"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold">{title}</h3>{action}</div>{children}</section>;
}

function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" | "red" }) {
  const tones = { slate: "border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200", green: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950", amber: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950", red: "border-red-300 bg-red-50 text-red-700 dark:bg-red-950" };
  return <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"><Search size={15} /><input className="w-56 bg-transparent outline-none" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function Segment({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return <button className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "bg-card"}`} onClick={onClick}>{icon}{label}</button>;
}

function MetricList({ data, formatter }: { data: Record<string, number>; formatter: (key: string) => string }) {
  return <div className="space-y-2">{Object.entries(data).map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-md border p-3 text-sm"><span>{formatter(key)}</span><strong>{value}</strong></div>)}</div>;
}

function Skeleton({ label }: { label: string }) {
  return <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">{label}</div>;
}
