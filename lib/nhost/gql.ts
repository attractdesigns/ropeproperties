import { createAdminClient } from "./admin";
import { createClient } from "./client";

type GqlVars = Record<string, unknown>;

/**
 * Run a server-side GraphQL query against Nhost. By default uses the admin
 * client (bypasses Hasura permissions). Pass { admin: false } to use the
 * public endpoint with the request's session.
 *
 * Throws on GraphQL errors so callers can rely on the returned data shape.
 */
export async function gql<T = unknown>(
  query: string,
  variables?: GqlVars,
  options?: { admin?: boolean }
): Promise<T> {
  const nhost = options?.admin === false ? createClient() : createAdminClient();
  const res = await nhost.graphql.request<T>({ query, variables });

  const errors = res.body?.errors;
  if (errors && errors.length > 0) {
    const message = errors.map((e: { message: string }) => e.message).join("; ");
    throw new Error(`GraphQL error: ${message}`);
  }

  const data = res.body?.data;
  if (!data) {
    throw new Error("GraphQL returned no data");
  }

  return data;
}
