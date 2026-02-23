import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Database, Sparkles, Share2, MessageCircle, Send } from "lucide-react";
import InterstitialAd from "@/components/ads/InterstitialAd";
import BannerAd from "@/components/ads/BannerAd";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  explanation: string;
  source?: "database" | "ai";
}

interface DBQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  chapter_id: string;
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
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [dbQuestions, setDbQuestions] = useState<DBQuestion[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentBoard = boardType || "ncert";
  const boardDisplayName = boardNames[currentBoard] || "NCERT";

  useEffect(() => {
    checkAuth();
    fetchCredits();
    fetchDatabaseQuestions();
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

  // Auto-generate questions for a subject via AI and save to DB
  const autoGenerateAndSaveQuestions = async (
    subjectId: string,
    subjectName: string,
    classNum: number,
    board: string
  ) => {
    try {
      toast({
        title: "प्रश्न बनाए जा रहे हैं...",
        description: `${subjectName} के लिए AI से प्रश्न generate हो रहे हैं। कृपया प्रतीक्षा करें।`,
      });

      // First, create a default chapter if none exists
      const { data: existingChapters } = await supabase
        .from("admin_chapters")
        .select("id")
        .eq("subject_id", subjectId);

      let chapterId: string;

      if (!existingChapters || existingChapters.length === 0) {
        const { data: newChapter, error: chapterError } = await supabase
          .from("admin_chapters")
          .insert({
            subject_id: subjectId,
            chapter_number: 1,
            name: `${subjectName} - General`,
            name_hindi: `${subjectName} - सामान्य`,
          })
          .select("id")
          .single();

        if (chapterError || !newChapter) {
          console.error("Error creating default chapter:", chapterError);
          return [];
        }
        chapterId = newChapter.id;
      } else {
        chapterId = existingChapters[0].id;
      }

      // Generate 10 questions using AI
      const generatedQuestions: any[] = [];
      for (let i = 0; i < 10; i++) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-quiz', {
            body: {
              classNumber: classNum,
              boardType: board,
            }
          });

          if (error || !data) continue;

          generatedQuestions.push({
            chapter_id: chapterId,
            question: data.question,
            options: data.options,
            correct_answer: data.correctAnswer,
            difficulty: "medium",
          });
        } catch (e) {
          console.error(`Error generating question ${i + 1}:`, e);
        }
      }

      if (generatedQuestions.length > 0) {
        const { data: savedQuestions, error: saveError } = await supabase
          .from("chapter_questions")
          .insert(generatedQuestions)
          .select("*");

        if (saveError) {
          console.error("Error saving generated questions:", saveError);
          return [];
        }

        toast({
          title: "प्रश्न तैयार!",
          description: `${generatedQuestions.length} प्रश्न सफलतापूर्वक बनाए गए।`,
        });

        return (savedQuestions || []).map((q: any) => ({
          ...q,
          subjectName: subjectName,
        }));
      }

      return [];
    } catch (err) {
      console.error("Error in autoGenerateAndSaveQuestions:", err);
      return [];
    }
  };

  // Fetch questions from database based on class and board
  const fetchDatabaseQuestions = async () => {
    try {
      // First, find the class ID for the given class number and board type
      const { data: classData, error: classError } = await supabase
        .from("admin_classes")
        .select("id")
        .eq("class_number", parseInt(classNumber || "1"))
        .eq("board_type", currentBoard)
        .single();

      if (classError || !classData) {
        console.log("No class found for this board type");
        setQuestionLoading(false);
        toast({
          title: "कोई प्रश्न उपलब्ध नहीं",
          description: "इस कक्षा के लिए अभी तक कोई PDF अपलोड नहीं किया गया है।",
          variant: "destructive",
        });
        return;
      }

      // Get only subjects that have PDFs uploaded
      const { data: subjects, error: subjectsError } = await supabase
        .from("admin_subjects")
        .select("id, name")
        .eq("class_id", classData.id)
        .not("pdf_url", "is", null);

      if (subjectsError || !subjects || subjects.length === 0) {
        console.log("No subjects with PDF found");
        setQuestionLoading(false);
        toast({
          title: "कोई प्रश्न उपलब्ध नहीं",
          description: "इस कक्षा के लिए कोई PDF वाला विषय नहीं मिला।",
          variant: "destructive",
        });
        return;
      }

      // Get all chapters for these subjects
      const subjectIds = subjects.map(s => s.id);
      const { data: chapters, error: chaptersError } = await supabase
        .from("admin_chapters")
        .select("id, subject_id")
        .in("subject_id", subjectIds);

      // Get all questions for existing chapters
      let allQuestions: any[] = [];
      if (chapters && chapters.length > 0) {
        const chapterIds = chapters.map(c => c.id);
        const { data: questions, error: questionsError } = await supabase
          .from("chapter_questions")
          .select("*")
          .in("chapter_id", chapterIds);

        if (!questionsError && questions) {
          // Create a map of chapter_id to subject name
          const chapterToSubject: Record<string, string> = {};
          chapters.forEach(ch => {
            const subject = subjects.find(s => s.id === ch.subject_id);
            if (subject) {
              chapterToSubject[ch.id] = subject.name;
            }
          });

          allQuestions = questions.map(q => ({
            ...q,
            subjectName: chapterToSubject[q.chapter_id] || "General"
          }));
        }
      }

      // If no questions exist but subjects with PDF exist, auto-generate
      if (allQuestions.length === 0) {
        console.log("No questions found, auto-generating from PDF subjects...");
        const classNum = parseInt(classNumber || "1");
        
        // Generate for first subject with PDF
        const firstSubject = subjects[0];
        const generated = await autoGenerateAndSaveQuestions(
          firstSubject.id,
          firstSubject.name,
          classNum,
          currentBoard
        );

        if (generated.length > 0) {
          allQuestions = generated;
        } else {
          setQuestionLoading(false);
          toast({
            title: "प्रश्न बनाने में समस्या",
            description: "AI से प्रश्न generate नहीं हो सके। कृपया बाद में प्रयास करें।",
            variant: "destructive",
          });
          return;
        }
      }

      if (allQuestions.length > 0) {
        console.log(`Total ${allQuestions.length} questions available`);
        setDbQuestions(allQuestions as any);
        loadQuestionFromDB(allQuestions as any, []);
      }
    } catch (error) {
      console.error("Error in fetchDatabaseQuestions:", error);
      loadQuestion();
    }
  };

  // Load question from database
  const loadQuestionFromDB = (questions: any[], usedIds: string[]) => {
    setQuestionLoading(true);
    
    // Filter out already used questions
    const availableQuestions = questions.filter(q => !usedIds.includes(q.id));
    
    if (availableQuestions.length === 0) {
      console.log("All database questions used");
      setQuestionLoading(false);
      toast({
        title: "सभी प्रश्न हो गए!",
        description: "इस कक्षा के सभी प्रश्न पूरे हो गए हैं।",
      });
      return;
    }

    // Pick a random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const dbQuestion = availableQuestions[randomIndex];

    // Transform to quiz format
    const quizQuestion: QuizQuestion = {
      question: dbQuestion.question,
      options: dbQuestion.options as string[],
      correctAnswer: dbQuestion.correct_answer,
      subject: dbQuestion.subjectName || "General",
      explanation: `यह प्रश्न ${dbQuestion.difficulty === 'easy' ? 'आसान' : dbQuestion.difficulty === 'medium' ? 'मध्यम' : 'कठिन'} स्तर का है।`,
      source: "database"
    };

    setQuestion(quizQuestion);
    setUsedQuestionIds([...usedIds, dbQuestion.id]);
    setQuestionLoading(false);
  };

  // Load question from AI (fallback)
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

      setQuestion({ ...data, source: "ai" });
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

  // Load next question - prefer database, fallback to AI
  const loadNextQuestion = () => {
    if (dbQuestions.length > 0) {
      loadQuestionFromDB(dbQuestions as any, usedQuestionIds);
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
      loadNextQuestion();
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);
    setSelectedAnswer(null);
    setShowResult(false);
    loadNextQuestion();
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
              {question.source && (
                <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium flex items-center gap-1 ${
                  question.source === "database" 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                }`}>
                  {question.source === "database" ? (
                    <>
                      <Database className="w-3 h-3" />
                      Database
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI
                    </>
                  )}
                </span>
              )}
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
            <div className="mt-4 md:mt-6 space-y-4">
              <div className="p-3 md:p-4 bg-muted rounded-lg">
                <p className="text-sm md:text-base font-medium mb-2">व्याख्या:</p>
                <p className="text-xs md:text-sm text-muted-foreground">{question.explanation}</p>
              </div>
              
              {/* Social Share Buttons */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-muted-foreground">शेयर करें:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                  onClick={() => {
                    const isCorrect = selectedAnswer === question.correctAnswer;
                    const message = isCorrect 
                      ? `🎉 मैंने Shiksha Quiz में कक्षा ${classNumber} का प्रश्न सही किया!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}\n\n🏆 आप भी खेलें और जीतें!`
                      : `📚 Shiksha Quiz में कक्षा ${classNumber} का प्रश्न!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}\n\n🎯 आप भी खेलें और सीखें!`;
                    const url = window.location.origin;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message + '\n\n' + url)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  onClick={() => {
                    const isCorrect = selectedAnswer === question.correctAnswer;
                    const message = isCorrect 
                      ? `🎉 मैंने Shiksha Quiz में कक्षा ${classNumber} का प्रश्न सही किया!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}\n\n🏆 आप भी खेलें!`
                      : `📚 Shiksha Quiz में कक्षा ${classNumber} का प्रश्न!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}\n\n🎯 आप भी खेलें!`;
                    const url = window.location.origin;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const isCorrect = selectedAnswer === question.correctAnswer;
                    const message = isCorrect 
                      ? `🎉 मैंने Shiksha Quiz में कक्षा ${classNumber} का प्रश्न सही किया!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}`
                      : `📚 Shiksha Quiz में कक्षा ${classNumber} का प्रश्न!\n\n❓ ${question.question}\n✅ सही जवाब: ${question.correctAnswer}`;
                    const url = window.location.origin;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'Shiksha Quiz',
                          text: message,
                          url: url,
                        });
                      } catch (err) {
                        console.log('Share cancelled');
                      }
                    } else {
                      navigator.clipboard.writeText(message + '\n\n' + url);
                      toast({
                        title: "कॉपी हो गया!",
                        description: "लिंक clipboard में कॉपी हो गया",
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
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