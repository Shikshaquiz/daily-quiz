import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Trophy, Brain, User, LogOut, Crown, Medal } from "lucide-react";
import BannerAd from "@/components/ads/BannerAd";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  username: string;
  credits: number;
  level: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  const getLevelFromPoints = (points: number): number => {
    if (points <= 0) return 1;
    const level = Math.floor(points / 100) + 1;
    return Math.min(level, 50);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      }
    });

    fetchLeaderboard();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCredits = async (userId: string) => {
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();
    if (data) setUserCredits(data.credits);
  };

  const fetchLeaderboard = async () => {
    const { data: creditsData } = await supabase
      .from("user_credits")
      .select("user_id, credits")
      .order("credits", { ascending: false })
      .limit(10);

    if (creditsData && creditsData.length > 0) {
      const userIds = creditsData.map(c => c.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const leaderboardData: LeaderboardUser[] = creditsData.map((credit, index) => {
        const profile = profilesData?.find(p => p.id === credit.user_id);
        return {
          id: credit.user_id,
          username: profile?.username || `Player ${index + 1}`,
          credits: credit.credits,
          level: getLevelFromPoints(credit.credits)
        };
      });

      setLeaderboard(leaderboardData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header - Like Classes page */}
      <Card className="mx-4 mt-4 p-4 border-border/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">शिक्षा क्विज़</h1>
              <p className="text-sm text-muted-foreground">कक्षा चुनें</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <>
                <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                  <Trophy className="h-4 w-4" />
                  <span>{userCredits}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Button onClick={() => navigate("/auth")} size="sm">
                लॉगिन करें
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Banner Ad */}
      <div className="mx-4 mt-4">
        <BannerAd adSlot="6101389397" />
      </div>

      {/* Leaderboard Section */}
      <Card className="mx-4 mt-4 p-4 border-border/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">🏆 Top 10 Leaders</h2>
        </div>
        
        {leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                  index === 1 ? "bg-gray-500/10 border border-gray-500/30" :
                  index === 2 ? "bg-amber-600/10 border border-amber-600/30" :
                  "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Trophy className="h-4 w-4" />
                  <span>{user.credits}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            अभी कोई लीडरबोर्ड डेटा नहीं है
          </p>
        )}
      </Card>

      <div className="container mx-auto px-4 py-8">
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <Card className="p-6 text-center border-border/50">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">सभी विषय</h3>
            <p className="text-sm text-muted-foreground">
              गणित, विज्ञान, हिंदी, अंग्रेज़ी और सामाजिक विज्ञान
            </p>
          </Card>

          <Card className="p-6 text-center border-border/50">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">AI से बने प्रश्न</h3>
            <p className="text-sm text-muted-foreground">
              हर बार नए और रोचक प्रश्न
            </p>
          </Card>

          <Card className="p-6 text-center border-border/50">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
              <Trophy className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">क्रेडिट जीतें</h3>
            <p className="text-sm text-muted-foreground">
              सही उत्तर पर +10, गलत पर -10 क्रेडिट
            </p>
          </Card>
        </div>

        {/* Profile/Classes Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate(isLoggedIn ? "/classes" : "/auth")}
            size="lg"
            className="px-8 py-6 text-lg shadow-lg"
          >
            {isLoggedIn ? "कक्षा चुनें" : "अभी शुरू करें"}
          </Button>
          
          {isLoggedIn && (
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              size="lg"
              className="ml-4 px-8 py-6 text-lg"
            >
              <User className="h-5 w-5 mr-2" />
              प्रोफाइल
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;