"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Menu, Minus, Plus } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/site";

const typeOptions = [
  { value: "all", label: "Any Type" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "duplex", label: "Duplex" },
  { value: "terrace", label: "Terrace" },
  { value: "bungalow", label: "Bungalow" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

// Doubles as the Buy/Rent toggle in the frame's top bar.
const intents = [
  { value: "all", label: "All" },
  { value: "for_sale", label: "Buy" },
  { value: "for_rent", label: "Rent" },
];

const fieldLabel = "block text-[9px] uppercase tracking-[0.24em] text-white/40";
const fieldValue =
  "w-full appearance-none bg-transparent text-sm text-white focus:outline-none [&>option]:text-ink";

interface ImmersiveHeroProps {
  cities: string[];
  heading: string;
  subheading: string;
  imageUrl: string;
}

export function ImmersiveHero({
  cities,
  heading,
  subheading,
  imageUrl,
}: ImmersiveHeroProps) {
  const router = useRouter();
  const [intent, setIntent] = useState("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const roomsRef = useRef<HTMLDivElement>(null);

  // The rooms popover overlays the page, so it has to yield to a click or an
  // Escape press anywhere outside it.
  useEffect(() => {
    if (!roomsOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!roomsRef.current?.contains(e.target as Node)) setRoomsOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setRoomsOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [roomsOpen]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (intent !== "all") params.set("status", intent);
    if (city !== "all") params.set("city", city);
    if (type !== "all") params.set("type", type);
    if (bedrooms > 0) params.set("bedrooms", String(bedrooms));
    if (bathrooms > 0) params.set("bathrooms", String(bathrooms));
    const qs = params.toString();
    router.push(`/listings${qs ? `?${qs}` : ""}`);
  }

  const roomsSummary =
    bedrooms === 0 && bathrooms === 0
      ? "Any rooms"
      : [
          bedrooms > 0 ? `${bedrooms}+ bed` : null,
          bathrooms > 0 ? `${bathrooms}+ bath` : null,
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <section className="relative isolate overflow-hidden bg-alpine-void">
      {/* Blurred backdrop — the same scene the framed panel looks into, so the
          frame reads as a window rather than a pasted-on card. Desktop only: on
          phones the photo itself fills the screen, leaving nothing behind. */}
      <Image
        src={imageUrl}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="hidden scale-125 object-cover blur-3xl saturate-[0.35] sm:block"
      />
      {/* Heavy blue-grey wash. The realtor can upload any photo in Admin → Site
          settings, so the scene has to resolve to the same alpine haze whatever
          that photo is — the crisp copy inside the frame carries the detail. */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,14,16,0.78) 0%, rgba(62,100,130,0.62) 28%, rgba(73,104,117,0.58) 60%, rgba(10,14,16,0.88) 100%)",
        }}
      />

      {/* Corner metadata */}
      <div
        className="absolute left-5 top-24 z-10 hidden text-[10px] uppercase leading-relaxed tracking-[0.22em] sm:block lg:left-8 alpine-rise"
        style={{ animationDelay: "120ms" }}
      >
        <span className="block text-white/40">Services /</span>
        <span className="block text-white/75">Buy &middot; Rent &middot; Invest</span>
      </div>
      <div
        className="absolute right-5 top-24 z-10 hidden text-right text-[10px] uppercase leading-relaxed tracking-[0.22em] sm:block lg:right-8 alpine-rise"
        style={{ animationDelay: "120ms" }}
      >
        <span className="block text-white/40">Field /</span>
        <span className="block text-white/75">Lagos &middot; Abuja &amp; Beyond</span>
      </div>

      {/* No horizontal padding on phones — the photo runs edge to edge there. */}
      <div className="relative mx-auto max-w-[1200px] px-0 sm:px-6 lg:px-8">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="flex min-h-[100svh] flex-col justify-center sm:pb-14 sm:pt-32">
          <p
            className="mx-auto hidden max-w-2xl px-4 text-center text-[10px] uppercase leading-loose tracking-[0.28em] text-white/65 sm:block alpine-rise"
            style={{ animationDelay: "200ms" }}
          >
            {subheading}
          </p>

          {/* Borderless at every size — depth comes from the shadow alone. On
              phones this is not a panel at all: it stretches to fill the
              screen, so the search bar lands at the bottom of the viewport. */}
          <div
            className="flex flex-1 flex-col sm:mt-8 sm:block sm:rounded-[28px] sm:bg-white/10 sm:p-3 sm:shadow-[0_50px_130px_-30px_rgba(10,14,16,0.85)] sm:backdrop-blur-2xl alpine-rise"
            style={{ animationDelay: "280ms" }}
          >
            <div className="relative flex flex-1 flex-col overflow-hidden sm:block sm:rounded-[20px]">
              <Image
                src={imageUrl}
                alt={heading}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1160px"
                className="object-cover"
              />
              {/* Scrim holds an even floor of contrast across the middle so the
                  headline stays readable over a busy photograph. */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(10,14,16,0.68) 0%, rgba(10,14,16,0.46) 32%, rgba(10,14,16,0.52) 66%, rgba(10,14,16,0.82) 100%)",
                }}
              />

              {/* In-frame bar: doubles as the Buy / Rent intent toggle. The
                  site Header is fixed at 64px, so on phones — where this bar
                  starts at the very top of the screen — it has to clear it. */}
              <div className="relative flex items-center justify-between gap-3 border-b border-white/15 px-4 pb-3.5 pt-[76px] text-[10px] uppercase tracking-[0.18em] sm:px-5 sm:py-3.5">
                <div className="flex items-center gap-4">
                  <Link
                    href="/listings"
                    className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
                  >
                    <Menu size={14} />
                    <span className="hidden sm:inline">Menu</span>
                  </Link>
                  <span className="hidden h-3 w-px bg-white/20 sm:block" />
                  <div className="flex items-center gap-1.5">
                    {intents.map((opt, i) => (
                      <span key={opt.value} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-white/25">&middot;</span>}
                        <button
                          type="button"
                          aria-pressed={intent === opt.value}
                          onClick={() => setIntent(opt.value)}
                          className={`uppercase tracking-[0.18em] transition-colors ${
                            intent === opt.value
                              ? "text-white"
                              : "text-white/40 hover:text-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/"
                  className="absolute left-1/2 hidden -translate-x-1/2 font-display text-sm italic normal-case tracking-normal text-white lg:block"
                >
                  {BUSINESS_NAME}
                </Link>

                <div className="flex items-center gap-4">
                  <Link
                    href="/contact"
                    className="hidden text-white/70 transition-colors hover:text-white sm:inline"
                  >
                    Contact
                  </Link>
                  <span className="hidden h-3 w-px bg-white/20 sm:block" />
                  <Link
                    href="/listings"
                    className="group flex items-center gap-2 text-white/70 transition-colors hover:text-white"
                  >
                    Listings
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>

              {/* Headline. On phones it absorbs the leftover height and carries
                  the subheading, which has nowhere to sit above a full-bleed
                  photo. */}
              <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[320px] sm:flex-none sm:py-20 lg:min-h-[360px]">
                <h1
                  className="max-w-3xl font-display text-4xl italic leading-[1.06] text-white sm:text-5xl lg:text-6xl alpine-rise"
                  style={{ animationDelay: "360ms" }}
                >
                  {heading}
                </h1>
                <p
                  className="mt-6 max-w-sm text-[10px] uppercase leading-loose tracking-[0.28em] text-white/65 sm:hidden alpine-rise"
                  style={{ animationDelay: "440ms" }}
                >
                  {subheading}
                </p>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="relative border-t border-white/15 bg-alpine-void/40 backdrop-blur-md alpine-rise"
                style={{ animationDelay: "440ms" }}
              >
                {/* Two-up on phones so the Search action stays above the fold;
                    four-up from lg. Dividers are per-cell borders rather than
                    `divide-*`, which follows DOM order and would misplace the
                    horizontal rule once the grid wraps. */}
                <div className="grid grid-cols-2 lg:grid-cols-4">
                  {/* City */}
                  <label className="cursor-pointer px-4 py-3.5 sm:px-5 sm:py-4">
                    <span className={fieldLabel}>City</span>
                    <span className="mt-1.5 flex items-center justify-between gap-3">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={fieldValue}
                        aria-label="City"
                      >
                        <option value="all">Any city</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="shrink-0 text-white/45" />
                    </span>
                  </label>

                  {/* Type */}
                  <label className="cursor-pointer border-l border-white/10 px-4 py-3.5 sm:px-5 sm:py-4">
                    <span className={fieldLabel}>Type</span>
                    <span className="mt-1.5 flex items-center justify-between gap-3">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={fieldValue}
                        aria-label="Property type"
                      >
                        {typeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="shrink-0 text-white/45" />
                    </span>
                  </label>

                  {/* Rooms — opens the stepper popover */}
                  <div
                    ref={roomsRef}
                    className="relative border-t border-white/10 px-4 py-3.5 sm:px-5 sm:py-4 lg:border-l lg:border-t-0"
                  >
                    <span className={fieldLabel}>Rooms</span>
                    <button
                      type="button"
                      onClick={() => setRoomsOpen((v) => !v)}
                      aria-expanded={roomsOpen}
                      className="mt-1.5 flex w-full items-center justify-between gap-3 text-left text-sm text-white"
                    >
                      {roomsSummary}
                      {roomsOpen ? (
                        <ChevronUp size={14} className="shrink-0 text-white/45" />
                      ) : (
                        <ChevronDown size={14} className="shrink-0 text-white/45" />
                      )}
                    </button>

                    {roomsOpen && (
                      // Half-width cell on phones is too narrow for the stepper
                      // rows, so the panel breaks out and centres on the cell.
                      <div className="absolute bottom-full left-1/2 z-30 mb-3 w-[260px] -translate-x-1/2 rounded-xl bg-alpine-void/95 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:left-3 lg:right-3 lg:w-auto lg:translate-x-0">
                        <Stepper
                          label="Bedrooms"
                          value={bedrooms}
                          onChange={setBedrooms}
                        />
                        <Stepper
                          label="Bathrooms"
                          value={bathrooms}
                          onChange={setBathrooms}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="group flex items-center justify-between gap-3 border-l border-t border-white/10 px-4 py-3.5 text-left transition-colors hover:bg-white/5 sm:px-5 sm:py-4 lg:border-t-0"
                  >
                    <span>
                      <span className={fieldLabel}>Ready</span>
                      <span className="mt-1.5 block text-sm uppercase tracking-[0.18em] text-white">
                        Search
                      </span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-white/5">
      <StepperButton
        label={`Decrease ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={12} />
      </StepperButton>
      <span className="flex-1 whitespace-nowrap text-center text-xs text-white/85">
        {value === 0 ? `Any ${label}` : `${value}+ ${label}`}
      </span>
      <StepperButton
        label={`Increase ${label}`}
        disabled={value >= 6}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={12} />
      </StepperButton>
    </div>
  );
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-alpine-ice hover:text-white disabled:opacity-25 disabled:hover:border-white/20 disabled:hover:text-white/70"
    >
      {children}
    </button>
  );
}
