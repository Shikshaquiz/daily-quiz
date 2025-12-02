import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, User, Mail, Lock, Phone, ArrowLeft } from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot";
type AuthStep = "form" | "otp" | "reset";
type SignInMethod = "password" | "otp";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("form");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password");
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
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

  const resetForm = () => {
    setPhoneNumber("");
    setOtp("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setStep("form");
  };

  const handlePasswordLogin = async () => {
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

      // Try to sign in with phone-based email and password
      const email = `${cleanPhone}@phone.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "सफल लॉगिन",
        description: "आपका स्वागत है!",
      });
    } catch (error: any) {
      console.error("Error during password login:", error);
      toast({
        title: "त्रुटि",
        description: "गलत फोन नंबर या पासवर्ड। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (forMode: AuthMode) => {
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

      // For signup, validate additional fields
      if (forMode === "signup") {
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
      }

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: cleanPhone }
      });

      if (error) throw new Error(error.message || "OTP भेजने में समस्या आई");
      if (data?.error) throw new Error(data.error);

      setStep("otp");
      toast({
        title: "OTP भेजा गया",
        description: "कृपया अपने फोन पर प्राप्त OTP दर्ज करें",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "त्रुटि",
        description: error.message || "OTP भेजने में समस्या आई",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");

      const bodyData: any = { phone: cleanPhone, otp };
      
      // For signup, include additional data
      if (mode === "signup") {
        bodyData.isSignup = true;
        bodyData.username = username;
        bodyData.email = email;
        bodyData.password = password;
      }

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: bodyData
      });

      if (error) throw new Error(error.message || "OTP सत्यापन में समस्या आई");
      if (data?.error) throw new Error(data.error);

      if (mode === "forgot") {
        // Move to password reset step
        setStep("reset");
        toast({
          title: "OTP सत्यापित",
          description: "कृपया नया पासवर्ड दर्ज करें",
        });
      } else if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        toast({
          title: mode === "signup" ? "खाता बनाया गया" : "सफल लॉगिन",
          description: "आपका स्वागत है!",
        });
      } else {
        throw new Error("Session not received");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "त्रुटि",
        description: error.message || "OTP सत्यापन में समस्या आई",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    try {
      if (newPassword.length < 6) {
        toast({ title: "त्रुटि", description: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए", variant: "destructive" });
        setLoading(false);
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, "");

      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { phone: cleanPhone, newPassword }
      });

      if (error) throw new Error(error.message || "पासवर्ड रीसेट में समस्या आई");
      if (data?.error) throw new Error(data.error);

      toast({
        title: "पासवर्ड रीसेट सफल",
        description: "कृपया नए पासवर्ड से लॉगिन करें",
      });
      
      setMode("signin");
      resetForm();
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "त्रुटि",
        description: error.message || "पासवर्ड रीसेट में समस्या आई",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSignIn = () => (
    <div className="space-y-4">
      {step === "form" ? (
        <>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={signInMethod === "password" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSignInMethod("password")}
            >
              पासवर्ड
            </Button>
            <Button
              type="button"
              variant={signInMethod === "otp" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSignInMethod("otp")}
            >
              OTP
            </Button>
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
          {signInMethod === "password" && (
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
          )}
          <Button
            onClick={signInMethod === "password" ? handlePasswordLogin : () => handleSendOTP("signin")}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{signInMethod === "password" ? "लॉगिन हो रहा है..." : "भेजा जा रहा है..."}</>
            ) : (
              signInMethod === "password" ? "लॉगिन करें" : "OTP भेजें"
            )}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => { setMode("forgot"); resetForm(); }}
          >
            पासवर्ड भूल गए?
          </Button>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">OTP दर्ज करें</label>
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center tracking-widest text-lg"
            />
          </div>
          <Button
            onClick={handleVerifyOTP}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />सत्यापित हो रहा है...</> : "OTP सत्यापित करें"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("form")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएं
          </Button>
        </>
      )}
    </div>
  );

  const renderSignUp = () => (
    <div className="space-y-4">
      {step === "form" ? (
        <>
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
            onClick={() => handleSendOTP("signup")}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />भेजा जा रहा है...</> : "OTP भेजें"}
          </Button>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">OTP दर्ज करें</label>
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center tracking-widest text-lg"
            />
          </div>
          <Button
            onClick={handleVerifyOTP}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />सत्यापित हो रहा है...</> : "खाता बनाएं"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("form")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएं
          </Button>
        </>
      )}
    </div>
  );

  const renderForgotPassword = () => (
    <div className="space-y-4">
      {step === "form" ? (
        <>
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
          <Button
            onClick={() => handleSendOTP("forgot")}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />भेजा जा रहा है...</> : "OTP भेजें"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => { setMode("signin"); resetForm(); }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> लॉगिन पर वापस जाएं
          </Button>
        </>
      ) : step === "otp" ? (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">OTP दर्ज करें</label>
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center tracking-widest text-lg"
            />
          </div>
          <Button
            onClick={handleVerifyOTP}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />सत्यापित हो रहा है...</> : "OTP सत्यापित करें"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("form")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएं
          </Button>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">नया पासवर्ड</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="नया पासवर्ड"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={handleResetPassword}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />रीसेट हो रहा है...</> : "पासवर्ड रीसेट करें"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            शिक्षा क्विज़ ऐप
          </h1>
          <p className="text-muted-foreground text-center text-sm mt-1">
            सीखें, खेलें और क्रेडिट जीतें
          </p>
        </div>

        {mode === "forgot" ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">पासवर्ड रीसेट करें</h2>
            {renderForgotPassword()}
          </div>
        ) : (
          <Tabs value={mode} onValueChange={(v) => { setMode(v as AuthMode); resetForm(); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">साइन इन</TabsTrigger>
              <TabsTrigger value="signup">साइन अप</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">{renderSignIn()}</TabsContent>
            <TabsContent value="signup">{renderSignUp()}</TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default Auth;