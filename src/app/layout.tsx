import type { Metadata } from "next";
import { Space_Grotesk, Unbounded } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import SiteFrame from "@/components/site-frame";
import { getPublicProfile, getPublicSettings } from "@/lib/data";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getPublicProfile(), getPublicSettings()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fahim-portfolio.vercel.app";
  const title = profile.seo_title || settings.seo_default_title || `${profile.name} | Portfolio`;
  const description =
    profile.seo_description || settings.seo_default_description || profile.bio;
  const ogImage = profile.og_image_url || settings.seo_default_og_image || "/opengraph-image";

  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "./" },
    title: {
      default: title,
      template: `%s | ${profile.name}`,
    },
    description,
    keywords: profile.seo_keywords,
    authors: [{ name: profile.name }],
    creator: profile.name,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: profile.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${profile.name} Portfolio` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !settings.maintenance_mode,
      follow: !settings.maintenance_mode,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([getPublicProfile(), getPublicSettings()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fahim-portfolio.vercel.app";

  const gaId = settings.analytics_ga_id || process.env.NEXT_PUBLIC_GA_ID;
  const umamiId = settings.analytics_umami_id || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiUrl =
    settings.analytics_umami_url ||
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
    "https://cloud.umami.is/script.js";

  const sameAs = Object.values(profile.socials || {}).filter(
    (v): v is string => typeof v === "string" && v.startsWith("http")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.bio,
    url: siteUrl,
    email: `mailto:${profile.email}`,
    image: profile.avatar_url || `${siteUrl}/opengraph-image`,
    sameAs,
  };

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${unbounded.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {umamiId && <Script defer src={umamiUrl} data-website-id={umamiId} />}
      </head>
      <body>
        <Providers defaultTheme={settings.default_theme}>
          <SiteFrame profile={profile} settings={settings}>
            {children}
          </SiteFrame>
        </Providers>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
