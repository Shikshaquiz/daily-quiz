import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";

const Auth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone number (should be 10 digits)
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

      const fullPhone = `+91${cleanPhone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      setOtpSent(true);
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const fullPhone = `+91${cleanPhone}`;

      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "सफल लॉगिन",
        description: "आपका स्वागत है!",
      });
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            शिक्षा क्विज़ ऐप
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            सीखें, खेलें और क्रेडिट जीतें
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                मोबाइल नंबर
              </label>
              <Input
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                required
                className="text-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "भेजा जा रहा है..." : "OTP भेजें"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                OTP दर्ज करें
              </label>
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="text-lg text-center tracking-widest"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "सत्यापित किया जा रहा है..." : "OTP सत्यापित करें"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
              }}
            >
              नंबर बदलें
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Auth;