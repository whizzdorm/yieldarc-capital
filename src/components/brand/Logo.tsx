import logoAsset from "@/assets/yieldarc-logo.jpg.asset.json";

export function Logo({ className = "", showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark className="h-8 w-8" />
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-navy dark:text-foreground">Yield</span>
          <span className="text-teal">Arc</span>
        </span>
        {showTagline ? (
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Optimize your yield
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 54 L22 20 L32 40 L42 22 L54 46" stroke="var(--navy)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 54 L32 34 L44 54" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 14 L54 14 L54 28" stroke="var(--teal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 40 L54 14" stroke="var(--teal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { logoAsset };
