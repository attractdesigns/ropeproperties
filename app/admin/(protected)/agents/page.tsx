import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import { AgentForm } from "@/components/admin/AgentForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export default async function AdminAgentsPage() {
  const agents = await getAgents();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Agents</h1>

      <div className="bg-white border border-line mb-8">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-lg text-ink">Add New Agent</h2>
        </div>
        <div className="p-4">
          <AgentForm />
        </div>
      </div>

      <div className="bg-white border border-line overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 text-xs font-medium text-muted uppercase">Photo</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Name</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Role</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Contact</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Active</th>
              <th className="p-3 text-xs font-medium text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No agents yet.</td>
              </tr>
            ) : (
              agents.map((agent) => {
                const photoUrl = getStorageUrl(agent.photo_path);
                return (
                  <tr key={agent.id} className="hover:bg-surface">
                    <td className="p-3">
                      <div className="relative w-10 h-10 bg-surface border border-line">
                        {photoUrl ? (
                          <Image src={photoUrl} alt={agent.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-sm font-display">
                            {agent.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-medium text-ink">{agent.name}</td>
                    <td className="p-3 text-sm text-muted">{agent.role}</td>
                    <td className="p-3 text-sm text-muted">{agent.phone ?? "—"}</td>
                    <td className="p-3 text-sm">{agent.is_active ? "✓" : "—"}</td>
                    <td className="p-3">
                      <DeleteButton id={agent.id} type="agent" title={agent.name} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}