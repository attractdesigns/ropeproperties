import { getSiteSettings, HERO_DEFAULTS } from "@/lib/settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-2">Site settings</h1>
      <p className="text-sm text-muted mb-6">
        The big image and wording at the top of the homepage.
      </p>

      <div className="bg-white border border-line p-4">
        <SiteSettingsForm
          settings={settings}
          defaults={{
            heading: HERO_DEFAULTS.heading,
            subheading: HERO_DEFAULTS.subheading,
          }}
        />
      </div>
    </div>
  );
}
