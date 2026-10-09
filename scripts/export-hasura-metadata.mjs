#!/usr/bin/env node
// Exports the live project's Hasura metadata into hasura/metadata.json,
// pretty-printed so diffs are reviewable. Run after changing permissions
// or relationships in the Nhost/Hasura console.
//
// Requires NEXT_PUBLIC_NHOST_SUBDOMAIN, NEXT_PUBLIC_NHOST_REGION and
// NHOST_ADMIN_SECRET in the environment (e.g. via `.env.local`, loaded
// by your shell or a tool like `dotenv-cli`).

import { writeFileSync } from "node:fs";

const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
const region = process.env.NEXT_PUBLIC_NHOST_REGION;
const adminSecret = process.env.NHOST_ADMIN_SECRET;

if (!subdomain || !region || !adminSecret) {
  console.error(
    "Missing NEXT_PUBLIC_NHOST_SUBDOMAIN, NEXT_PUBLIC_NHOST_REGION or NHOST_ADMIN_SECRET."
  );
  process.exit(1);
}

const res = await fetch(`https://${subdomain}.hasura.${region}.nhost.run/v1/metadata`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": adminSecret,
  },
  body: JSON.stringify({ type: "export_metadata", args: {} }),
});

if (!res.ok) {
  console.error(`Export failed: HTTP ${res.status}`);
  console.error(await res.text());
  process.exit(1);
}

const metadata = await res.json();
writeFileSync("hasura/metadata.json", JSON.stringify(metadata, null, 2) + "\n");
console.log("Wrote hasura/metadata.json");
