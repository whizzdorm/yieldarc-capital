import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Repeat, Network, Unlock, Wallet, ArrowDown, TrendingUp, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.32_0.06_258)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.58_0.09_185/0.25),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.4_0.1_260/0.4),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Boring, reliable compounding
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Optimize Your Yield.<br className="hidden sm:block" /> <span className="text-teal">Secure Your Future.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Deposit USDC or ETH. Auto-compound across the best DeFi protocols. Withdraw anytime.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-teal text-teal-foreground hover:bg-teal/90">
              <Link to="/dashboard">Launch App</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/docs">Read Docs</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/50">No lock-up periods. No hidden fees.</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-[#F7F9FA] dark:bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { v: "$127.4M", l: "Total Value Locked" },
            { v: "24.8%", l: "Average APY" },
            { v: "42,891", l: "Active Users" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-8 text-center">
              <div className="text-3xl font-bold text-navy dark:text-foreground sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for compounding</h2>
          <p className="mt-3 text-muted-foreground">Simple deposits. Non-stop optimization behind the scenes.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Repeat, title: "Auto-Compound", body: "Your rewards are automatically reinvested to maximize compounding." },
            { icon: Network, title: "Multi-Protocol", body: "Optimizes across Aave, Compound, Morpho, and more." },
            { icon: Unlock, title: "No Lock-ups", body: "Deposit and withdraw anytime. No fees, no penalties." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal/10 text-teal">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy dark:text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-[#F7F9FA] dark:bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Four steps between you and passive yield.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { icon: Wallet, title: "Connect Wallet" },
              { icon: ArrowDown, title: "Deposit" },
              { icon: TrendingUp, title: "Earn Yield" },
              { icon: LogOut, title: "Withdraw Anytime" },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-xl border border-border bg-card p-6 text-center shadow-card">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal text-teal-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                <div className="mt-1 font-semibold">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Trusted &amp; Secured</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["Audited by CertiK", "Secured by OpenZeppelin", "Backed by Paradigm", "Insurance Fund: $2.5M"].map((b) => (
            <div key={b} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-teal" /> {b}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-[#F7F9FA] dark:bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10">
            {[
              { q: "What is YieldArc?", a: "YieldArc is a non-custodial yield aggregator. You deposit assets into a vault; smart contracts route the funds across the highest-yielding, most reliable DeFi lending markets and auto-compound the rewards." },
              { q: "How is the APY calculated?", a: "APY is a rolling 7-day average of net yield generated by each vault after fees, annualized. It's an estimate — actual yield depends on live market conditions." },
              { q: "Is my money safe?", a: "YieldArc is non-custodial: you always control your funds. Contracts are audited by leading firms and covered by a $2.5M insurance fund. Risks remain — read the docs before depositing." },
              { q: "What are the fees?", a: "0.5% performance fee on profits only. No deposit fees. No withdrawal fees." },
              { q: "How do I withdraw?", a: "Open the vault, click Withdraw, and confirm the transaction in your wallet. There are no lock-ups or withdrawal fees." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  );
}
