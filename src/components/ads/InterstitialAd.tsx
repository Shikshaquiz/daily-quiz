import { useEffect } from "react";

interface InterstitialAdProps {
  adSlot: string;
  onAdClosed?: () => void;
}

const InterstitialAd = ({ adSlot, onAdClosed }: InterstitialAdProps) => {
  useEffect(() => {
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
          // Fallback: Show regular ad
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          setTimeout(() => {
            if (onAdClosed) onAdClosed();
          }, 3000);
        }
      } catch (e) {
        console.error("AdSense error:", e);
        if (onAdClosed) onAdClosed();
      }
    };

    showAd();
  }, [adSlot, onAdClosed]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-4 rounded-lg max-w-md">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-8672607257761570"
          data-ad-slot={adSlot}
          data-ad-format="auto"
        />
      </div>
    </div>
  );
};

export default InterstitialAd;
