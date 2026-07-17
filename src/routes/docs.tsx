import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — YieldArc" },
      { name: "description", content: "Learn how YieldArc's non-custodial yield aggregator works, its vaults, security, and fees." },
    ],
  }),
  component: DocsPage,
});

const sections = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "YieldArc is a non-custodial yield aggregation protocol that automatically optimizes your deposits across the top DeFi lending protocols. By leveraging smart contract automation, YieldArc ensures your assets are always in the highest-yielding pool while minimizing gas costs through batch compounding.",
      "The core primitive is a vault: a smart contract you deposit into, which routes your capital into carefully selected lending markets and liquid staking protocols. Rewards are harvested and reinvested for you on a schedule tuned to gas costs and yield opportunity.",
      "YieldArc is non-custodial. You always retain ownership of your assets, and can withdraw at any time.",
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    body: [
      "1. Connect your wallet.",
      "2. Choose a vault that matches your asset and risk preference.",
      "3. Approve the token so the vault can move funds on your behalf.",
      "4. Deposit into the vault.",
      "5. Watch your yield grow — and withdraw anytime.",
    ],
  },
  {
    id: "vaults",
    title: "Vaults",
    body: [
      "Each vault implements a single strategy for a single asset (or a curated group). Vaults are labelled Low, Medium, or High risk based on the underlying protocols and their historical reliability.",
      "Low Risk: blue-chip lending markets like Aave v3 and Compound v3.",
      "Medium Risk: newer money markets, liquid staking derivatives, and multi-hop strategies.",
      "High Risk: liquidity provision and leveraged strategies with materially higher volatility.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "YieldArc contracts have been audited by leading security firms. Our multi-sig governance ensures no single party can upgrade contracts without community consensus.",
      "A dedicated insurance fund covers a portion of losses in the event of a smart contract exploit. Nothing in DeFi is ever risk-free — please do your own research.",
    ],
  },
  {
    id: "fees",
    title: "Fees",
    body: [
      "0.5% performance fee on profits only. No deposit fees. No withdrawal fees.",
      "Fees fund ongoing security audits, insurance, protocol development, and operations.",
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    body: [
      "Q: Is my money safe? A: YieldArc is non-custodial and audited, but DeFi carries risk. Only deposit what you can afford to lose.",
      "Q: How often does the vault compound? A: Compounding frequency is optimized per vault based on gas costs and yield opportunity — typically daily.",
      "Q: Are there any lock-ups? A: No. Withdraw anytime.",
    ],
  },
];

function DocsPage() {
  const [active, setActive] = useState(sections[0].id);
  const current = sections.find((s) => s.id === active)!;
  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentation</p>
          <nav className="mt-3 flex flex-row flex-wrap gap-1 lg:flex-col">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`rounded-md px-3 py-2 text-left text-sm transition ${
                  active === s.id
                    ? "bg-teal/10 font-medium text-teal"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>
        <article className="max-w-3xl">
          <h1 className="text-3xl font-bold">{current.title}</h1>
          <div className="mt-6 space-y-4 text-muted-foreground">
            {current.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
