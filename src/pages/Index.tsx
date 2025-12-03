import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Trophy, Brain, User } from "lucide-react";
import BannerAd from "@/components/ads/BannerAd";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Profile Button */}
      {isLoggedIn && (
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-lg">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            शिक्षा क्विज़ ऐप
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            कक्षा 1 से 10 तक के छात्रों के लिए शैक्षिक क्विज़
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg"
          >
            शुरू करें
          </Button>
        </div>

        {/* Banner Ad */}
        <div className="max-w-5xl mx-auto mt-12">
          <BannerAd adSlot="6101389397" />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">सभी विषय</h3>
            <p className="text-white/80">
              गणित, विज्ञान, हिंदी, अंग्रेज़ी और सामाजिक विज्ञान
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI से बने प्रश्न</h3>
            <p className="text-white/80">
              हर बार नए और रोचक प्रश्न
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">क्रेडिट जीतें</h3>
            <p className="text-white/80">
              सही उत्तर पर +10, गलत पर -10 क्रेडिट
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            कैसे काम करता है?
          </h2>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">फोन नंबर से लॉगिन करें</h4>
                  <p className="text-white/80">OTP के साथ सुरक्षित लॉगिन</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">अपनी कक्षा चुनें</h4>
                  <p className="text-white/80">कक्षा 1 से 10 तक</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">प्रश्नों के उत्तर दें</h4>
                  <p className="text-white/80">MCQ प्रश्न और तुरंत परिणाम</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">क्रेडिट जीतें</h4>
                  <p className="text-white/80">हर सही जवाब के लिए पुरस्कार पाएं</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 shadow-lg"
          >
            अभी शुरू करें
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;