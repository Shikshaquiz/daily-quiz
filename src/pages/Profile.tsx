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
  ArrowLeft, 
  Copy, 
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string;
  referral_code: string | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  rupees: number;
  upi_id: string;
  status: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);

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

  const shareReferralCode = () => {
    if (profile?.referral_code && navigator.share) {
      navigator.share({
        title: "शिक्षा क्विज़ ऐप",
        text: `मेरा रेफरल कोड ${profile.referral_code} है। इस कोड का उपयोग करके साइन अप करें और 50 पॉइंट्स पाएं!`,
        url: window.location.origin,
      });
    } else {
      copyReferralCode();
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 pb-20">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">मेरी प्रोफाइल</h1>
        </div>
      </div>

      {/* Profile Card - Overlapping header */}
      <div className="px-4 -mt-16">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
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
            <Button onClick={shareReferralCode} className="w-full" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              दोस्तों को शेयर करें
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              हर सफल रेफरल पर 50 पॉइंट्स मिलेंगे
            </p>
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
  );
};

export default Profile;
