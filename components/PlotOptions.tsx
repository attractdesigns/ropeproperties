import type { PlotOption, PaymentTerms } from "@/lib/types";
import { formatPriceCompact } from "@/lib/format";
import { Info } from "lucide-react";

const sqm = (n: number) => `${n.toLocaleString("en-NG")} m²`;

/**
 * Plot sizes side by side. Stacked cards on phones (no sideways scrolling),
 * a conventional table from md up.
 */
export function PlotOptionsComparison({ options }: { options: PlotOption[] }) {
  if (options.length === 0) return null;
  const sorted = [...options].sort((a, b) => a.size_sqm - b.size_sqm);

  return (
    <section aria-labelledby="plot-options-heading" className="mt-8">
      <h2 id="plot-options-heading" className="font-display text-xl text-ink mb-4">
        Compare plot options
      </h2>

      <ul className="grid gap-3 md:hidden">
        {sorted.map((o) => (
          <li key={o.size_sqm} className="rounded-xl border border-line bg-bg p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-xl text-ink">{sqm(o.size_sqm)}</p>
              <p className="font-display text-xl text-accent">{formatPriceCompact(o.price)}</p>
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {o.initial_deposit != null && (
                <>
                  <dt className="text-muted">Initial deposit</dt>
                  <dd className="text-right font-medium text-ink">{formatPriceCompact(o.initial_deposit)}</dd>
                </>
              )}
              {o.suggested_use && (
                <>
                  <dt className="text-muted">Suggested use</dt>
                  <dd className="text-right text-ink">{o.suggested_use}</dd>
                </>
              )}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-line md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Plot sizes, prices, initial deposits and suggested uses</caption>
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Plot size</th>
              <th scope="col" className="px-4 py-3 font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Initial deposit</th>
              <th scope="col" className="px-4 py-3 font-medium">Suggested use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((o) => (
              <tr key={o.size_sqm}>
                <th scope="row" className="px-4 py-3 font-display text-base text-ink">{sqm(o.size_sqm)}</th>
                <td className="px-4 py-3 font-medium text-accent">{formatPriceCompact(o.price)}</td>
                <td className="px-4 py-3 text-ink">
                  {o.initial_deposit != null ? formatPriceCompact(o.initial_deposit) : "—"}
                </td>
                <td className="px-4 py-3 text-muted">{o.suggested_use ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Highlighted panel for payment/possession terms, kept apart from the prices. */
export function TermsPanel({ terms }: { terms: PaymentTerms }) {
  const highlights = terms.highlights ?? [];
  if (highlights.length === 0 && !terms.disclaimer) return null;

  return (
    <section
      aria-labelledby="terms-heading"
      className="mt-6 rounded-xl border border-accent/40 bg-accent-tint p-5"
    >
      <h2 id="terms-heading" className="font-display text-lg text-ink mb-3">
        Payment terms
      </h2>
      {highlights.length > 0 && (
        <ul className="space-y-2 text-sm text-ink">
          {highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      {terms.disclaimer && (
        <p className="mt-4 flex gap-2 border-t border-accent/30 pt-3 text-sm text-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          {terms.disclaimer}
        </p>
      )}
    </section>
  );
}
