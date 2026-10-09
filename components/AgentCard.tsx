import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import type { Agent } from "@/lib/types";
import { getStorageUrl } from "@/lib/storage";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatPhoneDisplay } from "@/lib/format";
import { ExpandableText } from "./ExpandableText";

interface AgentCardProps {
  agent: Agent | null;
  context?: string; // property title or opportunity title for WhatsApp message
}

export function AgentCard({ agent, context }: AgentCardProps) {
  if (!agent) return null;

  const photoUrl = getStorageUrl(agent.photo_path);
  const waMessage = context
    ? `Hello, I'm interested in "${context}". Please get in touch with me.`
    : "Hello, I'd like to enquire about your services.";

  return (
    <div className="rounded-xl border border-line bg-bg p-6 shadow-sm">
      <h3 className="font-display text-lg text-ink mb-4">
        {agent.is_primary
          ? "Your Realtor"
          : agent.role === "Investment Lead"
            ? "Speak to an Advisor"
            : "Your Contact"}
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 bg-surface rounded-full border border-line overflow-hidden">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={agent.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xl font-display">
              {agent.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-ink">{agent.name}</p>
          <p className="text-sm text-muted">{agent.role}</p>
        </div>
      </div>

      {agent.bio && (
        <ExpandableText text={agent.bio} className="mt-4 text-sm text-muted leading-relaxed" />
      )}

      <div className="mt-2">
        {agent.phone && (
          <a
            href={`tel:${agent.phone.replace(/\s/g, "")}`}
            className="flex min-h-11 items-center gap-2 break-all text-sm text-ink hover:text-accent transition-colors"
          >
            <Phone size={14} className="text-accent" />
            {formatPhoneDisplay(agent.phone)}
          </a>
        )}
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="flex min-h-11 items-center gap-2 break-all text-sm text-ink hover:text-accent transition-colors"
          >
            <Mail size={14} className="text-accent" />
            {agent.email}
          </a>
        )}
      </div>

      <div className="mt-4">
        <WhatsAppButton
          phone={agent.whatsapp ?? agent.phone ?? undefined}
          message={waMessage}
          label="WhatsApp"
          variant="solid"
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}