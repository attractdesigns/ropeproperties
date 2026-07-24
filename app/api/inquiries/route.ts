import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InquiryInsert, InquiryKind } from "@/lib/types";
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

    // Basic validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Honeypot check
    if (body.company) {
      // Bot filled the honeypot — silently succeed
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();

    // `kind` is client-supplied and the column has a CHECK constraint, so
    // anything unrecognised falls back to 'contact' instead of erroring.
    const kind: InquiryKind = VALID_KINDS.includes(body.kind)
      ? body.kind
      : "contact";

    const inquiry: InquiryInsert = {
      kind,
      name: String(body.name),
      phone: String(body.phone),
      email: body.email ?? null,
      message: body.message ?? null,
      preferred_date: body.preferred_date ?? null,
      property_id: body.property_id ?? null,
      opportunity_id: body.opportunity_id ?? null,
    };

    const { error } = await supabase.from("inquiries").insert(inquiry);

    if (error) {
      console.error("Inquiry insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit inquiry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}