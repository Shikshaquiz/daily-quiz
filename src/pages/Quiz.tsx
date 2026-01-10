import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trophy, CheckCircle, XCircle } from "lucide-react";
import InterstitialAd from "@/components/ads/InterstitialAd";
import BannerAd from "@/components/ads/BannerAd";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  explanation: string;
}

const boardNames: Record<string, string> = {
  ncert: "NCERT",
  bihar: "Bihar Board"
};

const Quiz = () => {
  const { classNumber, boardType } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [credits, setCredits] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentBoard = boardType || "ncert";
  const boardDisplayName = boardNames[currentBoard] || "NCERT";

  useEffect(() => {
    checkAuth();
    fetchCredits();
    loadQuestion();
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

    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setCredits(data.credits);
    }
  };

  const loadQuestion = async () => {
    setQuestionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          classNumber: parseInt(classNumber || "1"),
          boardType: currentBoard
        }
      });

      if (error) throw error;

      setQuestion(data);
    } catch (error: any) {
      console.error("Error loading question:", error);
      toast({
        title: "त्रुटि",
        description: "प्रश्न लोड करने में समस्या आई",
        variant: "destructive",
      });
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    const creditsEarned = isCorrect ? 10 : -10;

    // Update credits in database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update credits
    const { data: currentCredits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (currentCredits) {
      await supabase
        .from("user_credits")
        .update({ credits: currentCredits.credits + creditsEarned })
        .eq("user_id", user.id);

      setCredits(currentCredits.credits + creditsEarned);
    }

    // Save quiz history
    await supabase.from("quiz_history").insert({
      user_id: user.id,
      class_number: parseInt(classNumber || "1"),
      subject: question.subject,
      question: question.question,
      user_answer: selectedAnswer,
      correct_answer: question.correctAnswer,
      is_correct: isCorrect,
      credits_earned: creditsEarned,
    });

    setShowResult(true);

    toast({
      title: isCorrect ? "सही उत्तर! 🎉" : "गलत उत्तर",
      description: isCorrect ? "+10 क्रेडिट मिले" : "-10 क्रेडिट कटे",
      variant: isCorrect ? "default" : "destructive",
    });
  };

  const handleNext = () => {
    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    
    // Show ad after every 4 questions
    if (newCount % 4 === 0) {
      setShowAd(true);
    } else {
      setSelectedAnswer(null);
      setShowResult(false);
      loadQuestion();
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);
    setSelectedAnswer(null);
    setShowResult(false);
    loadQuestion();
  };

  if (loading || questionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-lg">प्रश्न लोड नहीं हो सका</p>
          <Button onClick={() => navigate("/classes")} className="mt-4">
            वापस जाएं
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {showAd && (
        <InterstitialAd 
          adSlot="8396380249" 
          onAdClosed={handleAdClosed}
        />
      )}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/classes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            वापस
          </Button>
          <div className="flex items-center gap-2 bg-gradient-secondary px-4 py-2 rounded-lg">
            <Trophy className="w-5 h-5 text-secondary-foreground" />
            <span className="font-bold text-secondary-foreground">{credits}</span>
          </div>
        </div>

        {/* Banner Ad */}
        <BannerAd adSlot="6101389397" className="mb-6" />

        {/* Question Card */}
        <Card className="p-4 md:p-8 mb-6 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
                कक्षा {classNumber}
              </span>
              <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs md:text-sm font-medium">
                {boardDisplayName}
              </span>
              <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs md:text-sm font-medium">
                {question.subject}
              </span>
            </div>
            <h2 className="text-base md:text-2xl font-bold mb-4 md:mb-6">{question.question}</h2>
          </div>

          <div className="space-y-2 md:space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-3 md:p-4 rounded-lg text-left transition-all border-2 ${
                    showCorrect
                      ? "bg-success/10 border-success"
                      : showWrong
                      ? "bg-destructive/10 border-destructive"
                      : isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base font-medium">{option}</span>
                    {showCorrect && <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-success" />}
                    {showWrong && <XCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-sm md:text-base font-medium mb-2">व्याख्या:</p>
              <p className="text-xs md:text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}
        </Card>

        {/* Banner Ad */}
        <BannerAd adSlot="6101389397" className="mb-6" />

        {/* Action Button */}
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6"
          >
            उत्तर जमा करें
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-success hover:opacity-90 transition-opacity text-lg py-6"
          >
            अगला प्रश्न
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;