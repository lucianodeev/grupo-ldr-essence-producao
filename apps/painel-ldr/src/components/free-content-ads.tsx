import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

import { isFreeContentRoute } from "@/lib/library-sales-card-i18n";

const ADSENSE_CLIENT = "ca-pub-4298173894748549";
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_FREE_CONTENT_SLOT?.trim();

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type FreeContentAdsProps = {
  placement: "top" | "bottom";
};

export function FreeContentAds({ placement }: FreeContentAdsProps) {
  const { pathname } = useLocation();
  const initialized = useRef(false);
  const enabled = isFreeContentRoute(pathname) && Boolean(ADSENSE_SLOT);

  useEffect(() => {
    initialized.current = false;
  }, [pathname, placement]);

  useEffect(() => {
    if (!enabled || initialized.current || typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {
      // AdSense can fail silently before account/site approval. Keep the page usable.
    }
  }, [enabled, pathname, placement]);

  if (!enabled) return null;

  return (
    <aside
      aria-label="Publicidade"
      className={placement === "top" ? "mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6" : "mx-auto w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6"}
    >
      <ins
        className="adsbygoogle block min-h-[90px] w-full overflow-hidden rounded-xl"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
