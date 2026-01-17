import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Trophy, User, LogOut, Crown, Medal, ChevronDown, ChevronRight, TrendingUp, Target, Award, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import BannerAd from "@/components/ads/BannerAd";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  username: string;
  credits: number;
  level: number;
}

interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const classGroups = [
  { name: "कक्षा 1-5", classes: [1, 2, 3, 4, 5] },
  { name: "कक्षा 6-10", classes: [6, 7, 8, 9, 10] }
];

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 });
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [username, setUsername] = useState("");

  const getLevelFromPoints = (points: number): number => {
    if (points <= 0) return 1;
    const level = Math.floor(points / 100) + 1;
    return Math.min(level, 50);
  };

  const currentLevel = getLevelFromPoints(userCredits);
  const pointsForNextLevel = currentLevel * 100;
  const progressToNextLevel = Math.min((userCredits % 100) / 100 * 100, 100);
  const accuracy = userStats.totalQuestions > 0 ? ((userStats.correctAnswers / userStats.totalQuestions) * 100).toFixed(1) : "0";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserCredits(session.user.id);
        fetchUserStats(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserId(session.user.id);
        fetchUserCredits(session.user.id);
        fetchUserStats(session.user.id);
        fetchUserProfile(session.user.id);
      }
    });

    fetchLeaderboard();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle();
    if (data) setUsername(data.username || "User");
  };

  const fetchUserStats = async (userId: string) => {
    const { data } = await supabase
      .from("quiz_history")
      .select("is_correct")
      .eq("user_id", userId);
    
    if (data) {
      const correct = data.filter(q => q.is_correct).length;
      setUserStats({
        totalQuestions: data.length,
        correctAnswers: correct,
        incorrectAnswers: data.length - correct
      });
    }
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

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
      {/* Header */}
      <Card className="mx-4 mt-4 p-4 border-border/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">शिक्षा क्विज़</h1>
              <p className="text-sm text-muted-foreground">प्रोफाइल देखें →</p>
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

      {/* Main Content: Profile + Classes side by side */}
      <div className="mx-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Profile Section */}
        <Card className="p-4 border-border/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{isLoggedIn ? username : "Guest"}</h2>
              <p className="text-sm text-muted-foreground">
                {isLoggedIn ? `Level ${currentLevel}` : "लॉगिन करें"}
              </p>
            </div>
            {isLoggedIn && (
              <Button onClick={() => navigate("/profile")} variant="ghost" size="sm" className="ml-auto">
                प्रोफाइल →
              </Button>
            )}
          </div>

          {isLoggedIn ? (
            <>
              {/* Level Progress */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    Level {currentLevel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userCredits} / {pointsForNextLevel} pts
                  </span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg text-center">
                  <Target className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{userStats.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground">सही</p>
                </div>
                <div className="p-2 bg-red-500/10 rounded-lg text-center">
                  <Award className="h-4 w-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-600">{userStats.incorrectAnswers}</p>
                  <p className="text-xs text-muted-foreground">गलत</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{accuracy}%</p>
                  <p className="text-xs text-muted-foreground">सटीकता</p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg text-center">
                  <Trophy className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-600">{userStats.totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">कुल प्रश्न</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Button onClick={() => navigate("/auth")}>लॉगिन करें</Button>
            </div>
          )}
        </Card>

        {/* Right: Classes Section */}
        <Card className="p-4 border-border/50 shadow-lg">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            कक्षा चुनें
          </h2>
          
          <div className="space-y-2">
            {classGroups.map((group) => (
              <Collapsible 
                key={group.name} 
                open={openGroups.includes(group.name)}
                onOpenChange={() => toggleGroup(group.name)}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <span className="font-medium text-foreground">{group.name}</span>
                  {openGroups.includes(group.name) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1 pl-2">
                  {group.classes.map((classNum) => (
                    <Button
                      key={classNum}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        if (isLoggedIn) {
                          navigate(`/quiz/${classNum}`);
                        } else {
                          navigate("/auth");
                        }
                      }}
                    >
                      कक्षा {classNum}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Competitive Exams */}
            <Button
              variant="outline"
              className="w-full mt-2 border-primary/50 text-primary"
              onClick={() => {
                if (isLoggedIn) {
                  navigate("/competitive-quiz");
                } else {
                  navigate("/auth");
                }
              }}
            >
              🏆 प्रतियोगिता परीक्षा
            </Button>
          </div>
        </Card>
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


      {/* Kids Play Button */}
      <div className="mx-4 mt-4">
        <Button
          onClick={() => navigate("/kids-play")}
          className="w-full py-6 text-lg"
          variant="outline"
        >
          🎮 Kids Play - बच्चों के लिए
        </Button>
      </div>

      {/* Admin Panel Button */}
      <div className="mx-4 mt-4 mb-8">
        <Button
          onClick={() => navigate("/admin")}
          className="w-full py-4 text-lg"
          variant="secondary"
        >
          ⚙️ Admin Panel
        </Button>
      </div>
    </div>
  );
};

export default Index;