import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  for_sale: { label: "For Sale", className: "bg-ink text-white" },
  for_rent: { label: "For Rent", className: "bg-accent text-white" },
  sold: { label: "Sold", className: "bg-muted text-white" },
  let: { label: "Let", className: "bg-muted text-white" },
  draft: { label: "Draft", className: "bg-surface text-muted border border-line" },
};

const investmentStatusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-accent text-white" },
  closing_soon: { label: "Closing Soon", className: "bg-accent-deep text-white" },
  closed: { label: "Closed", className: "bg-muted text-white" },
  draft: { label: "Draft", className: "bg-surface text-muted border border-line" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-surface text-muted" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function InvestmentStatusBadge({ status }: { status: string }) {
  const config = investmentStatusConfig[status] ?? { label: status, className: "bg-surface text-muted" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function InvestmentBadge() {
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-accent-tint text-accent-deep">
      ⚑ Investment
    </span>
  );
}