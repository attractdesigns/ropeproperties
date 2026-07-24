import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-2">Testimonials</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Client quotes shown on the home and about pages. Only publish words a client
        has actually agreed to — these carry your name.
      </p>

      <div className="bg-white border border-line mb-8">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-lg text-ink">Add New Testimonial</h2>
        </div>
        <div className="p-4">
          <TestimonialForm />
        </div>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase">Client</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Location</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Quote</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Order</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Active</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No testimonials yet.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id} className="hover:bg-surface">
                  <td className="p-3 text-sm font-medium text-ink">{t.client_name}</td>
                  <td className="p-3 text-sm text-muted">{t.location ?? "—"}</td>
                  <td className="p-3 text-sm text-muted max-w-md truncate">{t.quote}</td>
                  <td className="p-3 text-sm text-muted">{t.sort_order}</td>
                  <td className="p-3 text-sm">{t.is_active ? "✓" : "—"}</td>
                  <td className="p-3">
                    <DeleteButton
                      id={t.id}
                      type="testimonial"
                      title={`testimonial from ${t.client_name}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
