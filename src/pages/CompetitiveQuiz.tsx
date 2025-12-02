import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import InterstitialAd from "@/components/ads/InterstitialAd";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  explanation: string;
}

const examInfo: Record<string, { name: string; emoji: string; description: string }> = {
  navodaya: { name: "नवोदय", emoji: "🏫", description: "जवाहर नवोदय विद्यालय प्रवेश परीक्षा" },
  netarhat: { name: "नेतरहाट", emoji: "🏔️", description: "नेतरहाट आवासीय विद्यालय प्रवेश परीक्षा" },
  sainik: { name: "सैनिक स्कूल", emoji: "🎖️", description: "सैनिक स्कूल प्रवेश परीक्षा" },
  upsc: { name: "UPSC", emoji: "🏛️", description: "संघ लोक सेवा आयोग प्रारंभिक परीक्षा" },
  bpsc: { name: "BPSC", emoji: "📋", description: "बिहार लोक सेवा आयोग प्रारंभिक परीक्षा" },
};

const CompetitiveQuiz = () => {
  const { examId } = useParams<{ examId: string }>();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const exam = examId ? examInfo[examId] : null;

  useEffect(() => {
    checkAuth();
    fetchCredits();
    if (examId) {
      loadQuestion();
    }
  }, [examId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setCredits(data.credits);
    }
  };

  const loadQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke('generate-quiz', {
        body: { examType: examId }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate question');
      }

      setQuestion(response.data);
    } catch (err) {
      console.error("Error loading question:", err);
      setError("प्रश्न लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const creditsChange = correct ? 10 : -10;
    const newCredits = Math.max(0, credits + creditsChange);

    // Update credits
    await supabase
      .from("user_credits")
      .update({ credits: newCredits })
      .eq("user_id", user.id);

    // Save quiz history
    await supabase.from("quiz_history").insert({
      user_id: user.id,
      class_number: 0, // 0 for competitive exams
      subject: `${exam?.name || examId} - ${question.subject}`,
      question: question.question,
      correct_answer: question.correctAnswer,
      user_answer: selectedAnswer,
      is_correct: correct,
      credits_earned: creditsChange,
    });

    setCredits(newCredits);

    toast({
      title: correct ? "✅ सही जवाब!" : "❌ गलत जवाब!",
      description: correct ? `+10 क्रेडिट मिले!` : `-10 क्रेडिट`,
      variant: correct ? "default" : "destructive",
    });
  };

  const handleNext = () => {
    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    
    // Show ad after every 4 questions
    if (newCount % 4 === 0) {
      setShowAd(true);
    } else {
      loadQuestion();
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);
    loadQuestion();
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-destructive">अमान्य परीक्षा</p>
          <Button onClick={() => navigate("/classes")} className="mt-4">वापस जाएं</Button>
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/classes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <span>{exam.emoji}</span> {exam.name}
              </h1>
              <p className="text-muted-foreground text-xs">{exam.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-secondary px-3 py-1.5 rounded-lg">
            <Trophy className="w-4 h-4 text-secondary-foreground" />
            <span className="font-bold text-secondary-foreground">{credits}</span>
          </div>
        </div>

        {/* Quiz Content */}
        {loading ? (
          <Card className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">प्रश्न लोड हो रहा है...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadQuestion}>पुनः प्रयास करें</Button>
          </Card>
        ) : question ? (
          <Card className="p-6">
            {/* Subject Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {question.subject}
              </span>
            </div>

            {/* Question */}
            <h2 className="text-lg md:text-xl font-semibold mb-6">{question.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isCorrect && isCorrect !== false && setSelectedAnswer(option)}
                  disabled={isCorrect !== null}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isCorrect !== null
                      ? option === question.correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : option === selectedAnswer && !isCorrect
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : "border-border"
                      : selectedAnswer === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {isCorrect !== null && option === question.correctAnswer && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                    )}
                    {isCorrect !== null && option === selectedAnswer && !isCorrect && option !== question.correctAnswer && (
                      <XCircle className="ml-auto h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Result & Explanation */}
            {isCorrect !== null && (
              <Card className={`p-4 mb-6 ${isCorrect ? "bg-green-50 dark:bg-green-950 border-green-500" : "bg-red-50 dark:bg-red-950 border-red-500"}`}>
                <p className="font-semibold mb-2">
                  {isCorrect ? "✅ बहुत बढ़िया!" : "❌ गलत जवाब"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>व्याख्या:</strong> {question.explanation}
                </p>
              </Card>
            )}

            {/* Action Button */}
            {isCorrect === null ? (
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
              >
                जवाब सबमिट करें
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleNext}>
                अगला प्रश्न →
              </Button>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default CompetitiveQuiz;
