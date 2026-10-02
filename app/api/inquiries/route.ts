import { NextRequest, NextResponse } from "next/server";
import { gql } from "@/lib/nhost/gql";
import type { InquiryKind } from "@/lib/types";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const VALID_KINDS: InquiryKind[] = ["contact", "viewing", "investment"];

export async function POST(request: NextRequest) {
  try {
    const { allowed, retryAfter } = rateLimit(clientIp(request.headers));
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    // Honeypot
    if (body.company) {
      return NextResponse.json({ success: true });
    }

    const kind: InquiryKind = VALID_KINDS.includes(body.kind) ? body.kind : "contact";

    await gql(`
      mutation InsertInquiry($object: inquiries_insert_input!) {
        insert_inquiries_one(object: $object) { id }
      }
    `, {
      object: {
        kind,
        name: String(body.name),
        phone: String(body.phone),
        email: body.email ?? null,
        message: body.message ?? null,
        preferred_date: body.preferred_date ?? null,
        property_id: body.property_id ?? null,
        opportunity_id: body.opportunity_id ?? null,
        is_read: false,
      },
    }, { admin: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
