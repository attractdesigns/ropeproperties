import { gql } from "@/lib/nhost/gql";
import type { Agent, Testimonial } from "@/lib/types";

const AGENT_FIELDS = /* GraphQL */ `
  id name role phone whatsapp email photo_path bio sort_order is_active is_primary
`;

export async function getPrimaryRealtor(): Promise<Agent | null> {
  const data = await gql<{ agents: Agent[] }>(`
    query PrimaryRealtor {
      agents(
        where: { is_primary: { _eq: true }, is_active: { _eq: true } }
        limit: 1
      ) { ${AGENT_FIELDS} }
    }
  `);
  return data.agents[0] ?? null;
}

export async function getSupportStaff(): Promise<Agent[]> {
  const data = await gql<{ agents: Agent[] }>(`
    query SupportStaff {
      agents(
        where: { is_active: { _eq: true }, is_primary: { _eq: false } }
        order_by: { sort_order: asc }
      ) { ${AGENT_FIELDS} }
    }
  `);
  return data.agents;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const data = await gql<{ testimonials: Testimonial[] }>(`
    query Testimonials {
      testimonials(
        where: { is_active: { _eq: true } }
        order_by: { sort_order: asc }
      ) {
        id created_at client_name location quote sort_order is_active
      }
    }
  `);
  return data.testimonials;
}
