import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — YieldArc" }, { name: "description", content: "Your YieldArc transaction history." }] }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">A record of your deposits, withdrawals, and harvests.</p>
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground shadow-card">
          No transactions yet.
        </div>
      </div>
    </AppShell>
  );
}
