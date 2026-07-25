// Database types for RopeProperties

export type PropertyStatus = "draft" | "for_sale" | "for_rent" | "sold" | "let";
export type PropertyType =
  | "apartment"
  | "house"
  | "duplex"
  | "terrace"
  | "bungalow"
  | "land"
  | "commercial";
export type PricePeriod = "total" | "per_year";
export type InvestmentStatus = "draft" | "open" | "closing_soon" | "closed";
export type InvestmentType =
  | "off_plan"
  | "land_banking"
  | "buy_to_let"
  | "development"
  | "flip";
export type InquiryKind = "contact" | "viewing" | "investment";

// NOTE: these are `type` aliases, not `interface`s, on purpose. postgrest-js
// requires each table's Row/Insert/Update to satisfy Record<string, unknown>,
// and TypeScript only grants that implicit index signature to type aliases —
// an interface here makes the whole schema fail its constraint and silently
// collapses every query result to `never`.
export type PartnerCompany = {
  id: string;
  name: string;
  logo_path: string | null;
  website_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export type Agent = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_path: string | null;
  bio: string | null;
  sort_order: number;
  is_active: boolean;
  /** The realtor the site is built around. At most one agent has this set. */
  is_primary: boolean;
}

/** Single-row table (id is always 1) holding editable homepage hero content. */
export type SiteSettings = {
  id: number;
  updated_at: string;
  hero_image_path: string | null;
  hero_heading: string | null;
  hero_subheading: string | null;
}

export type Testimonial = {
  id: string;
  created_at: string;
  client_name: string;
  location: string | null;
  quote: string;
  sort_order: number;
  is_active: boolean;
}

export type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  sort_order: number;
  alt: string | null;
}

export type Property = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  description: string;
  status: PropertyStatus;
  property_type: PropertyType;
  price: number;
  price_period: PricePeriod;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parking: number | null;
  size_sqm: number | null;
  city: string;
  neighbourhood: string | null;
  address: string | null;
  features: string[];
  map_embed_url: string | null;
  is_featured: boolean;
  is_investment: boolean;
  investment_note: string | null;
  partner_id: string | null;
  agent_id: string | null;
}

// Property with related data (for display)
export type PropertyWithRelations = Property & {
  property_images: PropertyImage[];
  agents: Agent | null;
  partner_companies: PartnerCompany | null;
};

export type InvestmentImage = {
  id: string;
  opportunity_id: string;
  storage_path: string;
  sort_order: number;
  alt: string | null;
}

export type InvestmentOpportunity = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  description: string;
  status: InvestmentStatus;
  investment_type: InvestmentType;
  city: string;
  neighbourhood: string | null;
  roi_range: string | null;
  min_entry: number | null;
  duration: string | null;
  map_embed_url: string | null;
  is_featured: boolean;
  agent_id: string | null;
}

export type InvestmentWithRelations = InvestmentOpportunity & {
  investment_images: InvestmentImage[];
  agents: Agent | null;
};

export type Inquiry = {
  id: string;
  created_at: string;
  kind: InquiryKind;
  property_id: string | null;
  opportunity_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferred_date: string | null;
  is_read: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database schema type for Supabase
//
// Mirrors the shape `supabase gen types typescript` emits. postgrest-js checks
// this against its GenericSchema constraint: every table needs a Relationships
// tuple and the schema needs Views/Functions/Enums/CompositeTypes. If any of
// those are missing the constraint fails silently and every query resolves to
// `never`, so keep this in sync with supabase/migrations when the schema changes.
//
// Insert types leave columns with a DB default or a NULL default optional.
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyInsert = Pick<Property, "title" | "slug" | "city" | "property_type"> &
  Partial<Omit<Property, "id" | "created_at" | "updated_at" | "title" | "slug" | "city" | "property_type">>;

export type InvestmentInsert = Pick<
  InvestmentOpportunity,
  "title" | "slug" | "city" | "investment_type"
> &
  Partial<
    Omit<
      InvestmentOpportunity,
      "id" | "created_at" | "updated_at" | "title" | "slug" | "city" | "investment_type"
    >
  >;

export type InquiryInsert = Pick<Inquiry, "kind" | "name" | "phone"> &
  Partial<Omit<Inquiry, "id" | "created_at" | "kind" | "name" | "phone">>;

export interface Database {
  public: {
    Tables: {
      partner_companies: {
        Row: PartnerCompany;
        Insert: Pick<PartnerCompany, "name"> & Partial<Omit<PartnerCompany, "id" | "name">>;
        Update: Partial<Omit<PartnerCompany, "id">>;
        Relationships: [];
      };
      agents: {
        Row: Agent;
        Insert: Pick<Agent, "name"> & Partial<Omit<Agent, "id" | "name">>;
        Update: Partial<Omit<Agent, "id">>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<Omit<SiteSettings, "id">>;
        Relationships: [];
      };
      testimonials: {
        Row: Testimonial;
        Insert: Pick<Testimonial, "client_name" | "quote"> &
          Partial<Omit<Testimonial, "id" | "created_at" | "client_name" | "quote">>;
        Update: Partial<Omit<Testimonial, "id" | "created_at">>;
        Relationships: [];
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: Partial<Omit<Property, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "properties_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partner_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: PropertyImage;
        Insert: Pick<PropertyImage, "property_id" | "storage_path"> &
          Partial<Omit<PropertyImage, "id" | "property_id" | "storage_path">>;
        Update: Partial<Omit<PropertyImage, "id">>;
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      investment_opportunities: {
        Row: InvestmentOpportunity;
        Insert: InvestmentInsert;
        Update: Partial<Omit<InvestmentOpportunity, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "investment_opportunities_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      investment_images: {
        Row: InvestmentImage;
        Insert: Pick<InvestmentImage, "opportunity_id" | "storage_path"> &
          Partial<Omit<InvestmentImage, "id" | "opportunity_id" | "storage_path">>;
        Update: Partial<Omit<InvestmentImage, "id">>;
        Relationships: [
          {
            foreignKeyName: "investment_images_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "investment_opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: Inquiry;
        Insert: InquiryInsert;
        Update: Partial<Omit<Inquiry, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "investment_opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}