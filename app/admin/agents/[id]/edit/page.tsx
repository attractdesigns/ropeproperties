import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { gql } from "@/lib/nhost/gql";
import { AgentForm } from "@/components/admin/AgentForm";
import type { Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAgent(id: string): Promise<Agent | null> {
  const data = await gql<{ agents: Agent[] }>(`
    query EditAgent($id: uuid!) {
      agents(where: { id: { _eq: $id } }, limit: 1) {
        id name role phone whatsapp email photo_path bio sort_order is_active is_primary
      }
    }
  `, { id });
  return data.agents[0] ?? null;
}

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();

  return (
    <div>
      <Link href="/admin/agents" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={14} /> Back to agents
      </Link>

      <h1 className="font-display text-2xl text-ink mb-6">
        Edit {agent.name}
        {agent.is_primary && (
          <span className="ml-3 align-middle text-xs uppercase tracking-wide bg-accent-tint text-accent-deep px-2 py-1">
            Primary realtor
          </span>
        )}
      </h1>

      <div className="bg-white border border-line p-4">
        <AgentForm agent={agent} />
      </div>
    </div>
  );
}
