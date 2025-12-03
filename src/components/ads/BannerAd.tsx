import { useEffect, useState } from "react";

interface BannerAdProps {
  adSlot: string;
  className?: string;
}

const BannerAd = ({ adSlot, className = "" }: BannerAdProps) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('lovable.app') ||
                        window.location.hostname.includes('lovableproject.com');

  useEffect(() => {
    // Don't try to load ads in development
    if (isDevelopment) return;

    const timer = setTimeout(() => {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isDevelopment]);

  // Show placeholder in development
  if (isDevelopment) {
    return (
      <div className={`${className} bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center`}>
        <p className="text-muted-foreground text-sm">📢 Ad Space (Banner)</p>
        <p className="text-muted-foreground text-xs">Ads will show on published domain</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8672607257761570"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default BannerAd;
