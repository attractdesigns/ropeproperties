"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { REALTOR_NAME } from "@/lib/site";

const typeOptions = [
  { value: "all", label: "All property types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "duplex", label: "Duplex" },
  { value: "terrace", label: "Terrace" },
  { value: "bungalow", label: "Bungalow" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const selectClass = "mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

interface ImmersiveHeroProps {
  cities: string[];
  heading: string;
  subheading: string;
  imageUrl: string;
}

export function ImmersiveHero({ cities, heading, subheading, imageUrl }: ImmersiveHeroProps) {
  const router = useRouter();
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [bedrooms, setBedrooms] = useState("any");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city !== "all") params.set("city", city);
    if (type !== "all") params.set("type", type);
    if (bedrooms !== "any") params.set("bedrooms", bedrooms);
    router.push(`/listings${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="bg-surface">
      <div className="relative isolate flex min-h-[570px] items-end overflow-hidden bg-alpine-void pb-20 pt-32 sm:min-h-[620px] sm:pb-32 lg:min-h-[680px]">
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-alpine-void/90 via-alpine-void/65 to-alpine-void/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-alpine-void/70 via-transparent to-alpine-void/30" />
        <div className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              <MapPin size={15} aria-hidden /> Lagos · Abuja · Beyond
            </p>
            <h1 className="font-display text-[clamp(2.8rem,8vw,5.6rem)] leading-[1.08] text-white">
              {heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{subheading}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#property-search" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-accent-tint">
                Find a property <ArrowRight size={17} aria-hidden />
              </a>
              <Link href="/contact" className="inline-flex min-h-12 items-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                Talk to {REALTOR_NAME}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="property-search" className="relative z-10 mx-auto max-w-[1200px] scroll-mt-24 px-4 pb-12 sm:-mt-16 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="rounded-2xl border border-line bg-white p-5 shadow-[0_18px_50px_-24px_rgba(23,25,28,0.3)] sm:p-6 lg:p-7">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">Start your search</p>
              <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">Find the right place</h2>
            </div>
            <Link href="/invest" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent-deep underline underline-offset-4 hover:text-ink sm:mt-0">Looking to invest?</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <label className="text-sm font-medium text-ink">Location
              <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                <option value="all">All locations</option>
                {cities.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-ink">Property type
              <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-ink">Bedrooms
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={selectClass}>
                <option value="any">Any bedrooms</option>
                {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}+ bedrooms</option>)}
              </select>
            </label>
            <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-span-2 lg:col-span-1 lg:w-auto">
              <Search size={18} aria-hidden /> Search listings
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
