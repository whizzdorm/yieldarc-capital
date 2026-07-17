import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — YieldArc" },
      { name: "description", content: "Protocol-level stats for YieldArc: TVL, yield paid, users, and integrations." },
    ],
  }),
  component: StatsPage,
});

const kpis = [
  { l: "Total Value Locked", v: "$127.4M", d: "+12.3% this week" },
  { l: "Total Yield Paid", v: "$8.2M", d: "+4.1% this week" },
  { l: "Active Users", v: "42,891", d: "+2.7% this week" },
  { l: "Protocols Integrated", v: "12", d: "+2 this quarter" },
];

const rows = [
  ["Aave v3", "$41.2M", "14,230", "16.2%", "$2.8M"],
  ["Compound v3", "$33.7M", "11,504", "14.8%", "$2.1M"],
  ["Morpho", "$22.1M", "8,112", "19.3%", "$1.9M"],
  ["Curve", "$15.4M", "5,233", "21.7%", "$1.1M"],
  ["Lido", "$12.0M", "3,812", "11.2%", "$0.3M"],
];

function StatsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Protocol Stats</h1>
        <p className="mt-2 text-muted-foreground">Real-time view into YieldArc's protocol-wide health.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.l} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{k.l}</p>
              <p className="mt-2 text-3xl font-bold">{k.v}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{k.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Protocol Breakdown</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4">Protocol</th>
                  <th className="pb-3 pr-4">TVL</th>
                  <th className="pb-3 pr-4">Users</th>
                  <th className="pb-3 pr-4">Avg APY</th>
                  <th className="pb-3">Yield Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r[0]} className="hover:bg-muted/30">
                    <td className="py-3 pr-4 font-medium">{r[0]}</td>
                    <td className="py-3 pr-4">{r[1]}</td>
                    <td className="py-3 pr-4">{r[2]}</td>
                    <td className="py-3 pr-4 font-semibold text-teal">{r[3]}</td>
                    <td className="py-3">{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
