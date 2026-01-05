import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, 
  Share2, 
  Wallet, 
  Copy, 
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Trophy,
  GraduationCap,
  LogOut,
  TrendingUp,
  Target,
  Award,
  Zap,
  User,
  Phone,
  Mail,
  Pencil
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string;
  referral_code: string | null;
  username: string | null;
  email: string | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  rupees: number;
  upi_id: string;
  status: string;
  created_at: string;
}

interface QuizHistoryItem {
  id: string;
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  credits_earned: number;
  subject: string;
  class_number: number;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch credits
      const { data: creditsData } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditsData) {
        setCredits(creditsData.credits);
      }

      // Fetch referral count
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);

      setReferralCount(count || 0);

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (withdrawalsData) {
        setWithdrawals(withdrawalsData);
      }

      // Fetch quiz history
      const { data: quizData } = await supabase
        .from("quiz_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (quizData) {
        setQuizHistory(quizData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "कॉपी हो गया!",
        description: "रेफरल कोड क्लिपबोर्ड में कॉपी हो गया",
      });
    }
  };

  const [showShareDialog, setShowShareDialog] = useState(false);

  const getShareLink = () => {
    return `${window.location.origin}?ref=${profile?.referral_code}`;
  };

  const getShareMessage = () => {
    return `🎓 शिक्षा क्विज़ ऐप - पढ़ाई करके पैसे कमाएं!\n\n✅ सही जवाब दें = 10 पॉइंट्स\n💰 5000 पॉइंट्स = ₹5\n🎁 मेरा रेफरल कोड: ${profile?.referral_code}\n\nअभी डाउनलोड करें: ${getShareLink()}`;
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareToTelegram = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareLink())}&text=${message}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "शिक्षा क्विज़ ऐप",
          text: getShareMessage(),
          url: getShareLink(),
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(getShareMessage());
      toast({
        title: "कॉपी हो गया!",
        description: "शेयर मैसेज क्लिपबोर्ड में कॉपी हो गया",
      });
    }
  };

  // Calculate quiz statistics
  const totalQuestions = quizHistory.length;
  const correctAnswers = quizHistory.filter(q => q.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Calculate level (1-50 based on credits)
  // Level formula: Every 1000 credits = 1 level, max 50
  const calculateLevel = (points: number) => {
    const level = Math.floor(points / 1000) + 1;
    return Math.min(level, 50);
  };

  const currentLevel = calculateLevel(credits);
  const pointsForNextLevel = currentLevel >= 50 ? 0 : (currentLevel * 1000) - credits;
  const progressToNextLevel = currentLevel >= 50 ? 100 : ((credits % 1000) / 1000) * 100;

  const handleWithdraw = async () => {
    if (!upiId.trim()) {
      toast({
        title: "त्रुटि",
        description: "कृपया UPI ID दर्ज करें",
        variant: "destructive",
      });
      return;
    }

    // Basic UPI ID validation
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId.trim())) {
      toast({
        title: "त्रुटि",
        description: "कृपया सही UPI ID दर्ज करें (जैसे: name@upi)",
        variant: "destructive",
      });
      return;
    }

    if (credits < 5000) {
      toast({
        title: "अपर्याप्त पॉइंट्स",
        description: "न्यूनतम 5000 पॉइंट्स चाहिए withdrawal के लिए",
        variant: "destructive",
      });
      return;
    }

    setWithdrawing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate rupees (5000 points = ₹5)
      const withdrawAmount = 5000;
      const rupees = 5;

      // Create withdrawal request
      const { error: withdrawError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          rupees: rupees,
          upi_id: upiId.trim(),
        });

      if (withdrawError) throw withdrawError;

      // Deduct credits
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({ credits: credits - withdrawAmount })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setCredits(credits - withdrawAmount);
      setShowWithdrawDialog(false);
      setUpiId("");

      toast({
        title: "सफल!",
        description: "₹5 withdrawal request सबमिट हो गई। जल्द ही आपके UPI में भेजी जाएगी।",
      });

      fetchUserData();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "त्रुटि",
        description: "Withdrawal में समस्या हुई। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "पूर्ण";
      case "rejected":
        return "अस्वीकृत";
      case "approved":
        return "स्वीकृत";
      default:
        return "प्रतीक्षारत";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const openEditDialog = () => {
    setEditName(profile?.full_name || "");
    setEditEmail(profile?.email || "");
    setShowEditDialog(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast({
        title: "त्रुटि",
        description: "कृपया नाम दर्ज करें",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation if provided
    if (editEmail.trim() && !/^[\w.-]+@[\w.-]+\.\w+$/.test(editEmail.trim())) {
      toast({
        title: "त्रुटि",
        description: "कृपया सही ईमेल दर्ज करें",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim(),
          email: editEmail.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: editName.trim(), email: editEmail.trim() || null } : null);
      setShowEditDialog(false);

      toast({
        title: "सफल!",
        description: "प्रोफाइल अपडेट हो गई",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "त्रुटि",
        description: "प्रोफाइल अपडेट में समस्या हुई। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">शिक्षा क्विज़</h1>
              <p className="text-muted-foreground text-xs md:text-sm">मेरी प्रोफाइल</p>
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

        {/* Profile Content */}
        <div className="px-0">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* User Info Card */}
            <Card className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800 dark:text-emerald-200">व्यक्तिगत जानकारी</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={openEditDialog} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-background rounded-lg">
                    <User className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">नाम</p>
                      <p className="font-medium">{profile?.full_name || profile?.username || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-background rounded-lg">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">मोबाइल नंबर</p>
                      <p className="font-medium">{profile?.phone_number || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-background rounded-lg">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">ईमेल</p>
                      <p className="font-medium">{profile?.email || "—"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-emerald-500" />
                    प्रोफाइल अपडेट करें
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">नाम</label>
                    <Input
                      placeholder="अपना नाम दर्ज करें"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ईमेल</label>
                    <Input
                      type="email"
                      placeholder="अपना ईमेल दर्ज करें"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      maxLength={255}
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        सेव हो रहा है...
                      </>
                    ) : (
                      "सेव करें"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Points Card */}
            <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
              <DialogTrigger asChild>
                <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white cursor-pointer hover:shadow-lg transition-shadow mb-4">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          <Coins className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm opacity-90">कुल पॉइंट्स</p>
                          <p className="text-2xl font-bold">{credits.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-80">क्लिक करें</p>
                        <p className="text-xs opacity-80">विवरण के लिए</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    पॉइंट्स विवरण
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">आपके पॉइंट्स</span>
                      <span className="text-2xl font-bold text-primary">{credits.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>5000 पॉइंट्स</span>
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee className="h-3 w-3" />5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      💡 पॉइंट्स कैसे कमाएं?
                    </p>
                    <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                      <li>• सही जवाब = +10 पॉइंट्स</li>
                      <li>• रेफरल = +50 पॉइंट्स</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    न्यूनतम 5000 पॉइंट्स पर withdrawal उपलब्ध
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Level Display */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white mb-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Award className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">आपका लेवल</p>
                      <p className="text-3xl font-bold">Level {currentLevel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentLevel < 50 ? (
                      <>
                        <p className="text-xs opacity-80">अगले लेवल के लिए</p>
                        <p className="text-lg font-bold">{pointsForNextLevel} पॉइंट्स</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Zap className="h-5 w-5" />
                        <span className="font-bold">MAX LEVEL!</span>
                      </div>
                    )}
                  </div>
                </div>
                {currentLevel < 50 && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${progressToNextLevel}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 opacity-80 text-center">
                      {Math.round(progressToNextLevel)}% पूर्ण
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz Statistics */}
            <Card className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                  <span className="font-semibold text-cyan-800 dark:text-cyan-200">Quiz आँकड़े</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white dark:bg-background rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold text-blue-600">{totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">कुल सवाल</p>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-background rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
                    <p className="text-xs text-muted-foreground">सही</p>
                  </div>
                  <div className="text-center p-2 bg-white dark:bg-background rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
                    <p className="text-xs text-muted-foreground">गलत</p>
                  </div>
                </div>
                {/* Accuracy Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">सटीकता (Accuracy)</span>
                    <span className="font-bold text-cyan-600">{accuracy}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">रेफरल</span>
                  </div>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-1">{referralCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">कमाई</span>
                  </div>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200 mt-1">
                    ₹{Math.floor(credits / 1000)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Referral Section */}
        <Card className="mt-4 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              रेफरल कोड
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-lg flex items-center justify-between mb-3">
              <code className="text-lg font-mono font-bold tracking-wider text-primary">
                {profile?.referral_code || "---"}
              </code>
              <Button variant="ghost" size="sm" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  दोस्तों को शेयर करें
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    शेयर करें
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">शेयर लिंक</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-background p-2 rounded border truncate">
                        {getShareLink()}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(getShareLink());
                          toast({ title: "लिंक कॉपी हो गया!" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={shareToWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </Button>
                    <Button 
                      onClick={shareToTelegram}
                      className="w-full bg-[#0088cc] hover:bg-[#006699] text-white"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      Telegram
                    </Button>
                  </div>

                  <Button 
                    onClick={shareNative}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    अन्य ऐप में शेयर करें
                  </Button>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      🎁 हर सफल रेफरल पर 50 पॉइंट्स मिलेंगे!
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card className="mt-4 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawal योग्य</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {Math.floor(credits / 5000) * 5}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>5000 points = ₹5</p>
                  <p>न्यूनतम: 5000 points</p>
                </div>
              </div>
            </div>

            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={credits < 5000}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {credits >= 5000 ? "Withdraw ₹5" : `${5000 - credits} पॉइंट्स और कमाएं`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Withdrawal Request
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Withdrawal राशि</span>
                      <span className="font-bold">5000 पॉइंट्स</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>आपको मिलेगा</span>
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />5
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      UPI ID दर्ज करें
                    </label>
                    <Input
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      जैसे: 9876543210@paytm, name@ybl
                    </p>
                  </div>

                  <Button 
                    onClick={handleWithdraw} 
                    className="w-full"
                    disabled={withdrawing || !upiId.trim()}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Withdraw करें
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Quiz History */}
        <Card className="mt-4 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Quiz इतिहास
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">अभी तक कोई quiz नहीं खेला</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate("/classes")}
                >
                  Quiz खेलें
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {quizHistory.map((q) => (
                  <div 
                    key={q.id} 
                    className={`p-3 rounded-lg border ${
                      q.is_correct 
                        ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" 
                        : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="bg-muted px-1.5 py-0.5 rounded">कक्षा {q.class_number}</span>
                          <span className="bg-muted px-1.5 py-0.5 rounded">{q.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {q.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${
                          q.is_correct ? "text-green-600" : "text-red-600"
                        }`}>
                          {q.credits_earned > 0 ? `+${q.credits_earned}` : q.credits_earned}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <p>
                        <span className="text-muted-foreground">आपका जवाब: </span>
                        <span className={q.is_correct ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                          {q.user_answer}
                        </span>
                      </p>
                      {!q.is_correct && (
                        <p>
                          <span className="text-muted-foreground">सही जवाब: </span>
                          <span className="text-green-700 dark:text-green-300">{q.correct_answer}</span>
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(q.created_at).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <Card className="mt-4 mb-6 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Withdrawal इतिहास
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div 
                    key={w.id} 
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(w.status)}
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />{w.rupees}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.created_at).toLocaleDateString("hi-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        w.status === "completed" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
                          : w.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}>
                        {getStatusText(w.status)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[100px]">
                        {w.upi_id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
