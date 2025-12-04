import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, User, Mail, Lock, Phone } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/classes");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/classes");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        toast({
          title: "गलत फोन नंबर",
          description: "कृपया 10 अंकों का मान्य फोन नंबर दर्ज करें",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!password) {
        toast({ title: "त्रुटि", description: "कृपया पासवर्ड दर्ज करें", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Sign in with phone-based email
      const authEmail = `${cleanPhone}@phone.local`;
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (error) throw error;

      toast({
        title: "सफल लॉगिन",
        description: "आपका स्वागत है!",
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      toast({
        title: "त्रुटि",
        description: "गलत फोन नंबर या पासवर्ड। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      
      // Validations
      if (!username.trim()) {
        toast({ title: "त्रुटि", description: "कृपया उपयोगकर्ता नाम दर्ज करें", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast({ title: "त्रुटि", description: "कृपया वैध ईमेल दर्ज करें", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (cleanPhone.length !== 10) {
        toast({
          title: "गलत फोन नंबर",
          description: "कृपया 10 अंकों का मान्य फोन नंबर दर्ज करें",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast({ title: "त्रुटि", description: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "त्रुटि", description: "पासवर्ड मेल नहीं खाते", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Sign up with phone-based email
      const authEmail = `${cleanPhone}@phone.local`;
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            phone_number: cleanPhone,
            full_name: username,
            username: username,
            email: email,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "खाता बनाया गया",
        description: "आपका स्वागत है! अब लॉगिन करें।",
      });

      // Switch to signin tab
      setActiveTab("signin");
      setPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      console.error("Error during signup:", error);
      if (error.message?.includes("already registered")) {
        toast({
          title: "फोन नंबर पंजीकृत है",
          description: "यह नंबर पहले से पंजीकृत है। कृपया साइन इन करें।",
          variant: "destructive",
        });
        setActiveTab("signin");
      } else {
        toast({
          title: "त्रुटि",
          description: error.message || "साइन अप में समस्या आई",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">शिक्षा क्विज़</h1>
          <p className="text-muted-foreground mt-1">ज्ञान का सफर शुरू करें</p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">साइन इन</TabsTrigger>
              <TabsTrigger value="signup">साइन अप</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">मोबाइल नंबर</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      maxLength={10}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">पासवर्ड</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSignIn}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />लॉगिन हो रहा है...</>
                  ) : (
                    "लॉगिन करें"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">उपयोगकर्ता नाम</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="आपका नाम"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ईमेल</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">मोबाइल नंबर</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      maxLength={10}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">पासवर्ड</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">पासवर्ड पुष्टि करें</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="******"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSignUp}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />खाता बनाया जा रहा है...</>
                  ) : (
                    "खाता बनाएं"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
