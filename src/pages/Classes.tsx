import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, LogOut, Trophy } from "lucide-react";

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
        <div className="flex items-center justify-between mb-8 p-4 bg-card rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">शिक्षा क्विज़</h1>
              <p className="text-muted-foreground text-sm">कक्षा चुनें</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-secondary px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-secondary-foreground" />
              <span className="font-bold text-secondary-foreground">{credits}</span>
              <span className="text-xs text-secondary-foreground">क्रेडिट</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
            <Card
              key={classNum}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group hover:scale-105 border-2"
              onClick={() => handleClassSelect(classNum)}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">{classNum}</span>
                </div>
                <div className="text-center">
                  <p className="font-semibold">कक्षा {classNum}</p>
                  <p className="text-xs text-muted-foreground">क्विज़ शुरू करें</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="p-6 bg-gradient-success text-white">
            <h3 className="font-bold text-lg mb-2">सही उत्तर</h3>
            <p className="text-sm opacity-90">+10 क्रेडिट मिलेंगे</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-destructive to-red-600 text-white">
            <h3 className="font-bold text-lg mb-2">गलत उत्तर</h3>
            <p className="text-sm opacity-90">-10 क्रेडिट कटेंगे</p>
          </Card>
          <Card className="p-6 bg-gradient-primary text-white">
            <h3 className="font-bold text-lg mb-2">सभी विषय</h3>
            <p className="text-sm opacity-90">हर बार नया प्रश्न</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Classes;