import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InterstitialAdProps {
  adSlot: string;
  onAdClosed?: () => void;
}

const InterstitialAd = ({ adSlot, onAdClosed }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(3);
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname.includes('lovable.app') ||
                        window.location.hostname.includes('lovableproject.com');

  useEffect(() => {
    if (isDevelopment) {
      // In development, show countdown then auto-close
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onAdClosed) onAdClosed();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    // Production: try to show real ad
    const showAd = () => {
      try {
        const adBreak = (window as any).adBreak;
        if (adBreak) {
          adBreak({
            type: 'preroll',
            adBreakDone: () => {
              if (onAdClosed) onAdClosed();
            },
          });
        } else {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setTimeout(() => {
            if (onAdClosed) onAdClosed();
          }, 5000);
        }
      } catch (e) {
        console.error("AdSense error:", e);
        if (onAdClosed) onAdClosed();
      }
    };

    showAd();
  }, [adSlot, onAdClosed, isDevelopment]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-xl max-w-md w-[90%] text-center shadow-xl">
        {isDevelopment ? (
          <>
            <div className="mb-4">
              <p className="text-lg font-semibold mb-2">📺 Interstitial Ad</p>
              <p className="text-muted-foreground text-sm mb-4">
                Real ads will show on your published domain
              </p>
              <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-8 mb-4">
                <p className="text-muted-foreground">Ad Content Area</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Auto-closing in {countdown}s...
            </p>
            <Button onClick={onAdClosed} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" /> Skip
            </Button>
          </>
        ) : (
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "250px" }}
            data-ad-client="ca-pub-8672607257761570"
            data-ad-slot={adSlot}
            data-ad-format="auto"
          />
        )}
      </div>
    </div>
  );
};

export default InterstitialAd;
