import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, LogOut, Trophy, Gamepad2, Award, Building2 } from "lucide-react";
import BannerAd from "@/components/ads/BannerAd";

const competitiveExams = [
  { id: "navodaya", name: "नवोदय", emoji: "🏫", description: "जवाहर नवोदय विद्यालय" },
  { id: "netarhat", name: "नेतरहाट", emoji: "🏔️", description: "नेतरहाट आवासीय विद्यालय" },
  { id: "sainik", name: "सैनिक स्कूल", emoji: "🎖️", description: "सैनिक स्कूल प्रवेश" },
  { id: "upsc", name: "UPSC", emoji: "🏛️", description: "संघ लोक सेवा आयोग" },
  { id: "bpsc", name: "BPSC", emoji: "📋", description: "बिहार लोक सेवा आयोग" },
];

const Classes = () => {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchCredits();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
    } else if (data) {
      setCredits(data.credits);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleClassSelect = (classNumber: number) => {
    navigate(`/quiz/${classNumber}`);
  };

  const handleCompetitiveExam = (examId: string) => {
    navigate(`/competitive/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow-md">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">शिक्षा क्विज़</h1>
              <p className="text-muted-foreground text-xs md:text-sm">प्रोफाइल देखें →</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-gradient-secondary px-2 md:px-4 py-1.5 md:py-2 rounded-lg">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-secondary-foreground" />
              <span className="font-bold text-sm md:text-base text-secondary-foreground">{credits}</span>
              <span className="text-xs text-secondary-foreground hidden md:inline">क्रेडिट</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} className="h-8 w-8 md:h-10 md:w-10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Banner Ad */}
        <BannerAd adSlot="6101389397" className="mb-6" />

        {/* Kids Play Section */}
        <Card 
          className="p-4 md:p-6 mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white cursor-pointer hover:scale-[1.02] transition-all"
          onClick={() => navigate("/kids-play")}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">🎮 Kids Play</h2>
              <p className="text-sm md:text-base opacity-90">अ से अनार, A से Apple, गिनती, पहाड़ा, जोड़!</p>
              <p className="text-xs opacity-75 mt-1">हिंदी वर्णमाला • English ABC • गिनती 1-100 • पहाड़ा 1-20</p>
            </div>
          </div>
        </Card>

        {/* Primary Classes (1-5) */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">📚</span>
            प्राथमिक कक्षा (1-5)
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((classNum) => (
              <Card
                key={classNum}
                className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer group hover:scale-105 border-2 hover:border-primary"
                onClick={() => handleClassSelect(classNum)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl md:text-2xl font-bold text-white">{classNum}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm md:text-base">कक्षा {classNum}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">क्विज़ शुरू करें</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Secondary Classes (6-10) */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">🎓</span>
            माध्यमिक कक्षा (6-10)
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[6, 7, 8, 9, 10].map((classNum) => (
              <Card
                key={classNum}
                className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer group hover:scale-105 border-2 hover:border-accent"
                onClick={() => handleClassSelect(classNum)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl md:text-2xl font-bold text-white">{classNum}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm md:text-base">कक्षा {classNum}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">क्विज़ शुरू करें</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Competitive Exams Section */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-500" />
            </span>
            प्रतियोगिता परीक्षा
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {competitiveExams.map((exam) => (
              <Card
                key={exam.id}
                className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer group hover:scale-105 border-2 hover:border-amber-500"
                onClick={() => handleCompetitiveExam(exam.id)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl md:text-3xl">{exam.emoji}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm md:text-base">{exam.name}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">{exam.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="p-3 md:p-6 bg-gradient-success text-white">
            <h3 className="font-bold text-sm md:text-lg mb-1">✅ सही</h3>
            <p className="text-xs md:text-sm opacity-90">+10 क्रेडिट</p>
          </Card>
          <Card className="p-3 md:p-6 bg-gradient-to-br from-destructive to-red-600 text-white">
            <h3 className="font-bold text-sm md:text-lg mb-1">❌ गलत</h3>
            <p className="text-xs md:text-sm opacity-90">-10 क्रेडिट</p>
          </Card>
          <Card className="p-3 md:p-6 bg-gradient-primary text-white">
            <h3 className="font-bold text-sm md:text-lg mb-1">📖 विषय</h3>
            <p className="text-xs md:text-sm opacity-90">सभी विषय</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Classes;