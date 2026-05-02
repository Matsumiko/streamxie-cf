import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Scroll, Cookie, Sparkle, Lightning } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

type StaticPageProps = {
  page: "privacy" | "terms" | "cookies" | "about" | "streaming-tips";
};

const content = {
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    updated: "Last updated: May 2026",
    color: "from-blue-500/20 to-background",
    sections: [
      {
        heading: "Information We Collect",
        body: "When you create an account, streamXie stores your account profile (name and email), authentication session metadata, and account activity data such as My List items, watch progress, search history, and avatar selection.",
      },
      {
        heading: "How We Use Information",
        body: "Your data is used only to provide core product features: sign in, persistent watch continuity, saved titles, search history, and profile personalization. streamXie does not sell personal data and does not use account data for advertising targeting.",
      },
      {
        heading: "Sessions and Security",
        body: "streamXie uses secure, HttpOnly session cookies for authentication. Session tokens are opaque and validated server-side. We apply login protection controls such as failed-attempt tracking and temporary lock windows.",
      },
      {
        heading: "Infrastructure and Processors",
        body: "streamXie uses Cloudflare Pages and Functions for application delivery and API execution, D1 for auth/session records, Turso for account state storage, TMDB for metadata, and selected provider APIs for stream source discovery.",
      },
      {
        heading: "Your Rights",
        body: "You can sign out at any time and request account data changes or deletion by contacting the project maintainer. Local browser data may still be cleared directly from browser settings.",
      },
      {
        heading: "Contact",
        body: "For privacy questions or data requests, contact the project maintainer through the repository linked in the About page.",
      },
    ],
  },
  terms: {
    icon: Scroll,
    title: "Terms of Use",
    updated: "Last updated: May 2026",
    color: "from-violet-500/20 to-background",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By using streamXie, you agree to these Terms and to applicable laws governing access, account usage, and online conduct.",
      },
      {
        heading: "Use of the Platform",
        body: "You may use streamXie for lawful personal use. You may not abuse authentication flows, attempt unauthorized access, scrape private account data, or interfere with platform availability.",
      },
      {
        heading: "Third-Party Content and Streams",
        body: "Metadata and playback source links may originate from third-party services. streamXie does not guarantee uninterrupted availability, accuracy, legality, or regional accessibility of third-party stream endpoints.",
      },
      {
        heading: "Intellectual Property",
        body: "The streamXie codebase, brand identity, and interface design are protected by applicable intellectual property laws. Unauthorized commercial redistribution is prohibited.",
      },
      {
        heading: "Disclaimer",
        body: "streamXie is provided &#39;as is&#39; and &#39;as available&#39; without warranties of any kind. The service may change, be interrupted, or be discontinued at any time.",
      },
      {
        heading: "Changes to Terms",
        body: "We may update these Terms as the platform evolves. Continued use after an update constitutes acceptance of the revised Terms.",
      },
    ],
  },
  cookies: {
    icon: Cookie,
    title: "Cookie Settings",
    updated: "Last updated: May 2026",
    color: "from-amber-500/20 to-background",
    sections: [
      {
        heading: "What We Store",
        body: "streamXie uses a first-party secure session cookie (`sx_session`) for account authentication, plus local browser storage for client-side experience preferences and cached UI state.",
      },
      {
        heading: "Essential Storage",
        body: "Essential storage supports account continuity and playback UX. Typical keys include My List identifiers, watch progress entries, recent searches, and avatar preference. Signed-in account data is also synchronized to server-side storage.",
      },
      {
        heading: "Analytics",
        body: "streamXie does not use third-party advertising trackers. Operational logs and security telemetry may be processed to protect account and API integrity.",
      },
      {
        heading: "Advertising",
        body: "streamXie does not run first-party ad targeting and does not use advertising cookies for cross-site personalization.",
      },
      {
        heading: "Managing Your Storage",
        body: "You can clear local browser storage in your browser settings and end account sessions by signing out. Server-side account data follows the retention and deletion process described in the Privacy Policy.",
      },
      {
        heading: "Third-Party Scripts",
        body: "streamXie may load approved third-party resources required for functionality (for example, metadata APIs, fonts, and provider embeds). Each service applies its own data handling policy.",
      },
    ],
  },
  about: {
    icon: Sparkle,
    title: "About streamXie",
    updated: "Version 1.2 — 2026",
    color: "from-primary/20 to-background",
    sections: [
      {
        heading: "What is streamXie?",
        body: "streamXie is a streaming discovery and playback-orchestration web application focused on fast metadata browsing and provider-based watch routing.",
      },
      {
        heading: "Design Philosophy",
        body: "Dark by default, seamless by design. streamXie was built with a cinema-first aesthetic: deep dark backgrounds, vivid accent gradients, motion-aware interactions, and a content-forward layout. Every decision prioritizes the content over the chrome.",
      },
      {
        heading: "Data Sources",
        body: "streamXie uses TMDB for catalog metadata and selected provider APIs for stream endpoint discovery. streamXie does not host media files directly.",
      },
      {
        heading: "Technology",
        body: "Built with React 18, TypeScript, Tailwind CSS, and Cloudflare Pages Functions. Account authentication uses opaque server-side sessions backed by D1, and account state synchronization is stored in Turso.",
      },
      {
        heading: "Features",
        body: "Core features include TMDB-based browsing, provider-specific discovery lanes, command palette search, account-backed My List, synced watch progress, and in-page multi-source playback selection.",
      },
      {
        heading: "Credits",
        body: "Designed and developed by the streamXie project team. For source code, issue tracking, and release notes, visit the official repository.",
      },
    ],
  },
  "streaming-tips": {
    icon: Lightning,
    title: "Streaming Comfort Tips",
    updated: "Last updated: May 2026",
    color: "from-emerald-500/20 to-background",
    sections: [
      {
        heading: "Recommended Browser Extensions",
        body: "<strong>uBlock Origin / uBlock Origin Lite</strong> - blocks ads, trackers, and malicious scripts.<br/><strong>Skip Redirect</strong> - skips intermediary redirect pages.<br/><strong>FastForward</strong> - bypasses shortener/wait pages.<br/><strong>Popup Blocker (Strict)</strong> - blocks forced popups/popunders/new tabs.<br/><strong>SponsorBlock</strong> - skips sponsor/intro/outro segments on YouTube.<br/><strong>Video Speed Controller</strong> - controls HTML5 playback speed.<br/><strong>Dark Reader</strong> - enables dark mode on most websites.<br/><strong>ClearURLs</strong> - removes URL tracking parameters.<br/><strong>Video Background Play Fix</strong> - helps keep video playing in background on Firefox Android."
      },
      {
        heading: "Android Browsers That Support Extensions",
        body: "<strong>Firefox for Android (Recommended)</strong> - strongest extension support and best compatibility for content-filtering/privacy extensions.<br/><strong>Kiwi Browser</strong> - supports many desktop Chrome extensions through the Chrome Web Store.<br/><strong>Yandex Browser</strong> - supports selected Chromium extensions."
      },
      {
        heading: "Practical Setup Order",
        body: "1) Install ad/privacy layer first: uBlock Origin (or Lite).<br/>2) Add navigation helpers: Skip Redirect + FastForward.<br/>3) Add anti-popup protection: Popup Blocker strict mode.<br/>4) Optional UX layer: SponsorBlock, Video Speed Controller, Dark Reader."
      },
      {
        heading: "Important Notes",
        body: "Extension support can change by browser version and OS update. Keep your browser and extensions updated. If one extension conflicts with playback, disable it per-site and test again before removing your full protection stack."
      },
    ],
  },
};

export const StaticPage = ({ page }: StaticPageProps) => {
  const info = content[page];
  const Icon = info.icon;

  useDocumentMeta(`${info.title} | streamXie`, info.sections[0]?.body.slice(0, 120) ?? "");

  return (
    <>
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-b ${info.color} pt-[72px]`}>
        <PageContainer className="relative pb-10 pt-12">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={15} weight="bold" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-lg">
              <Icon size={24} weight="fill" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">{info.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{info.updated}</p>
            </div>
          </motion.div>
        </PageContainer>
      </div>

      {/* Sections */}
      <PageContainer className="py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {info.sections.map((section, i) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="group"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{section.heading}</h2>
                  <p
                    className="mt-2 text-sm leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                </div>
              </div>
              {i < info.sections.length - 1 && (
                <div className="mt-8 border-t border-border/50" />
              )}
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </>
  );
};
