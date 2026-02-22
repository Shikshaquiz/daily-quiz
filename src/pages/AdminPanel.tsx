import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, GraduationCap, FileText, HelpCircle, Loader2, Upload, Sparkles, Eye, LayoutDashboard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AdminClass {
  id: string;
  class_number: number;
  board_type: string;
  created_at: string;
}

interface AdminSubject {
  id: string;
  class_id: string;
  name: string;
  name_hindi: string;
  emoji: string;
  pdf_url?: string | null;
  created_at: string;
}

interface AdminChapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  name: string;
  name_hindi: string;
  pdf_url?: string | null;
  created_at: string;
}

interface ChapterQuestion {
  id: string;
  chapter_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  created_at: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data states
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [questions, setQuestions] = useState<ChapterQuestion[]>([]);
  
  // Dialog states
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  
  // Form states for Classes
  const [classNumber, setClassNumber] = useState("");
  const [boardType, setBoardType] = useState("ncert");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  
  // Form states for Subjects
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectNameHindi, setSubjectNameHindi] = useState("");
  const [subjectEmoji, setSubjectEmoji] = useState("📚");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectPdfFile, setSubjectPdfFile] = useState<File | null>(null);
  const [uploadingSubjectPdf, setUploadingSubjectPdf] = useState(false);
  const subjectPdfInputRef = useRef<HTMLInputElement>(null);
  
  // Form states for Chapters
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterNameHindi, setChapterNameHindi] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  // Form states for Questions
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  
  // AI Generation states
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedAiChapterId, setSelectedAiChapterId] = useState("");
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState("10");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  // Subject AI Generation states
  const [subjectAiDialogOpen, setSubjectAiDialogOpen] = useState(false);
  const [selectedAiSubjectId, setSelectedAiSubjectId] = useState("");
  const [generatingSubjectQuestions, setGeneratingSubjectQuestions] = useState(false);
  const [generatedSubjectQuestions, setGeneratedSubjectQuestions] = useState<GeneratedQuestion[]>([]);
  const [subjectGenerationProgress, setSubjectGenerationProgress] = useState(0);
  const [numSubjectQuestionsToGenerate, setNumSubjectQuestionsToGenerate] = useState("10");
  const [selectedTargetChapterId, setSelectedTargetChapterId] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin role:", error);
          return false;
        }
        return !!data;
      } catch (err) {
        console.error("Admin role check exception:", err);
        return false;
      }
    };

    const sync = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!mounted) return;
      
      if (session?.user) {
        setIsAuthed(true);
        const adminStatus = await checkAdminRole(session.user.id);
        if (mounted) {
          setIsAdmin(adminStatus);
          setAuthChecking(false);
        }
      } else {
        setIsAuthed(false);
        setIsAdmin(false);
        setAuthChecking(false);
      }
    };

    setAuthChecking(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Admin auth getSession error:", error);
        }
        sync(session);
      })
      .catch((err) => {
        console.error("Admin auth getSession exception:", err);
        sync(null);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthed && isAdmin) {
      seedClassesAndFetch();
    }
  }, [isAuthed, isAdmin]);

  // Auto-seed classes 1-10 for both boards if they don't exist
  const seedClassesAndFetch = async () => {
    try {
      const { data: existingClasses } = await supabase
        .from("admin_classes" as any)
        .select("class_number, board_type");
      
      const existing = new Set(
        ((existingClasses as any[]) || []).map((c: any) => `${c.class_number}-${c.board_type}`)
      );

      const toInsert: { class_number: number; board_type: string }[] = [];
      for (let i = 1; i <= 10; i++) {
        for (const board of ["ncert", "bihar"]) {
          if (!existing.has(`${i}-${board}`)) {
            toInsert.push({ class_number: i, board_type: board });
          }
        }
      }

      if (toInsert.length > 0) {
        await supabase.from("admin_classes" as any).insert(toInsert);
      }
    } catch (err) {
      console.error("Error seeding classes:", err);
    }
    await fetchAllData();
  };

  // State for expanded class in classes tab
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [quickSubjectClassId, setQuickSubjectClassId] = useState<string | null>(null);

  const fetchAllData = async () => {
    await Promise.all([
      fetchClasses(),
      fetchSubjects(),
      fetchChapters(),
      fetchQuestions()
    ]);
  };

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from("admin_classes" as any)
      .select("*")
      .order("class_number", { ascending: true });
    
    if (error) {
      console.error("Error fetching classes:", error);
      return;
    }
    setClasses((data as unknown as AdminClass[]) || []);
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("admin_subjects" as any)
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.error("Error fetching subjects:", error);
      return;
    }
    setSubjects((data as unknown as AdminSubject[]) || []);
  };

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from("admin_chapters" as any)
      .select("*")
      .order("chapter_number", { ascending: true });
    
    if (error) {
      console.error("Error fetching chapters:", error);
      return;
    }
    setChapters((data as unknown as AdminChapter[]) || []);
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("chapter_questions" as any)
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }
    setQuestions((data as unknown as ChapterQuestion[]) || []);
  };

  // Class CRUD operations
  const handleSaveClass = async () => {
    if (!classNumber) {
      toast.error("कक्षा नंबर डालें");
      return;
    }

    if (editingClassId) {
      const { error } = await supabase
        .from("admin_classes" as any)
        .update({ class_number: parseInt(classNumber), board_type: boardType })
        .eq("id", editingClassId);
      
      if (error) {
        toast.error("अपडेट करने में त्रुटि");
        return;
      }
      toast.success("कक्षा अपडेट हो गई");
    } else {
      const { error } = await supabase
        .from("admin_classes" as any)
        .insert({ class_number: parseInt(classNumber), board_type: boardType });
      
      if (error) {
        toast.error("जोड़ने में त्रुटि");
        return;
      }
      toast.success("कक्षा जोड़ दी गई");
    }

    resetClassForm();
    fetchClasses();
  };

  const handleEditClass = (cls: AdminClass) => {
    setClassNumber(cls.class_number.toString());
    setBoardType(cls.board_type);
    setEditingClassId(cls.id);
    setClassDialogOpen(true);
  };

  const handleDeleteClass = async (id: string) => {
    const { error } = await supabase.from("admin_classes" as any).delete().eq("id", id);
    if (error) {
      toast.error("हटाने में त्रुटि");
      return;
    }
    toast.success("कक्षा हटा दी गई");
    fetchClasses();
  };

  const resetClassForm = () => {
    setClassNumber("");
    setBoardType("ncert");
    setEditingClassId(null);
    setClassDialogOpen(false);
  };

  // Subject CRUD operations
  const handleSaveSubject = async () => {
    if (!selectedClassId || !subjectName) {
      toast.error("सभी फ़ील्ड भरें");
      return;
    }

    let pdfUrl = null;
    
    // Upload PDF if selected
    if (subjectPdfFile) {
      setUploadingSubjectPdf(true);
      try {
        const fileExt = subjectPdfFile.name.split('.').pop();
        const fileName = `subjects/${selectedClassId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chapter-pdfs')
          .upload(fileName, subjectPdfFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error("Subject PDF upload error:", uploadError);
          toast.error("PDF अपलोड करने में त्रुटि");
          setUploadingSubjectPdf(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('chapter-pdfs')
          .getPublicUrl(fileName);
        
        pdfUrl = urlData.publicUrl;
        console.log("Subject PDF uploaded:", pdfUrl);
      } catch (err) {
        console.error("Subject PDF upload exception:", err);
        toast.error("PDF अपलोड में समस्या");
        setUploadingSubjectPdf(false);
        return;
      }
      setUploadingSubjectPdf(false);
    }

    const subjectData: any = {
      class_id: selectedClassId,
      name: subjectName,
      name_hindi: subjectNameHindi || subjectName,
      emoji: subjectEmoji
    };
    
    if (pdfUrl) {
      subjectData.pdf_url = pdfUrl;
    }

    if (editingSubjectId) {
      const { error } = await supabase
        .from("admin_subjects" as any)
        .update(subjectData)
        .eq("id", editingSubjectId);
      
      if (error) {
        toast.error("अपडेट करने में त्रुटि");
        return;
      }
      toast.success("विषय अपडेट हो गया");
    } else {
      const { error } = await supabase.from("admin_subjects" as any).insert(subjectData);
      
      if (error) {
        toast.error("जोड़ने में त्रुटि");
        return;
      }
      toast.success("विषय जोड़ दिया गया");
    }

    resetSubjectForm();
    fetchSubjects();
  };

  const handleEditSubject = (subject: AdminSubject) => {
    setSelectedClassId(subject.class_id);
    setSubjectName(subject.name);
    setSubjectNameHindi(subject.name_hindi);
    setSubjectEmoji(subject.emoji);
    setEditingSubjectId(subject.id);
    setSubjectPdfFile(null);
    setSubjectDialogOpen(true);
  };

  const handleDeleteSubject = async (id: string) => {
    const { error } = await supabase.from("admin_subjects" as any).delete().eq("id", id);
    if (error) {
      toast.error("हटाने में त्रुटि");
      return;
    }
    toast.success("विषय हटा दिया गया");
    fetchSubjects();
  };

  const resetSubjectForm = () => {
    setSelectedClassId("");
    setSubjectName("");
    setSubjectNameHindi("");
    setSubjectEmoji("📚");
    setEditingSubjectId(null);
    setSubjectPdfFile(null);
    if (subjectPdfInputRef.current) {
      subjectPdfInputRef.current.value = "";
    }
    setSubjectDialogOpen(false);
  };

  // Chapter CRUD operations
  const handleSaveChapter = async () => {
    if (!selectedSubjectId || !chapterNumber || !chapterName) {
      toast.error("सभी फ़ील्ड भरें");
      return;
    }

    let pdfUrl = null;
    
    // Upload PDF if selected
    if (pdfFile) {
      setUploadingPdf(true);
      try {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${selectedSubjectId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chapter-pdfs')
          .upload(fileName, pdfFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error("PDF upload error:", uploadError);
          toast.error("PDF अपलोड करने में त्रुटि");
          setUploadingPdf(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('chapter-pdfs')
          .getPublicUrl(fileName);
        
        pdfUrl = urlData.publicUrl;
        console.log("PDF uploaded:", pdfUrl);
      } catch (err) {
        console.error("PDF upload exception:", err);
        toast.error("PDF अपलोड में समस्या");
        setUploadingPdf(false);
        return;
      }
      setUploadingPdf(false);
    }

    const chapterData: any = {
      subject_id: selectedSubjectId,
      chapter_number: parseInt(chapterNumber),
      name: chapterName,
      name_hindi: chapterNameHindi || chapterName
    };
    
    if (pdfUrl) {
      chapterData.pdf_url = pdfUrl;
    }

    if (editingChapterId) {
      const { error } = await supabase
        .from("admin_chapters" as any)
        .update(chapterData)
        .eq("id", editingChapterId);
      
      if (error) {
        toast.error("अपडेट करने में त्रुटि");
        return;
      }
      toast.success("अध्याय अपडेट हो गया");
    } else {
      const { error } = await supabase.from("admin_chapters" as any).insert(chapterData);
      
      if (error) {
        toast.error("जोड़ने में त्रुटि");
        return;
      }
      toast.success("अध्याय जोड़ दिया गया");
    }

    resetChapterForm();
    fetchChapters();
  };

  const handleEditChapter = (chapter: AdminChapter) => {
    setSelectedSubjectId(chapter.subject_id);
    setChapterNumber(chapter.chapter_number.toString());
    setChapterName(chapter.name);
    setChapterNameHindi(chapter.name_hindi);
    setEditingChapterId(chapter.id);
    setPdfFile(null);
    setChapterDialogOpen(true);
  };

  const handleDeleteChapter = async (id: string) => {
    const { error } = await supabase.from("admin_chapters" as any).delete().eq("id", id);
    if (error) {
      toast.error("हटाने में त्रुटि");
      return;
    }
    toast.success("अध्याय हटा दिया गया");
    fetchChapters();
  };

  const resetChapterForm = () => {
    setSelectedSubjectId("");
    setChapterNumber("");
    setChapterName("");
    setChapterNameHindi("");
    setEditingChapterId(null);
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
    setChapterDialogOpen(false);
  };

  // AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!selectedAiChapterId) {
      toast.error("अध्याय चुनें");
      return;
    }

    const chapter = chapters.find(c => c.id === selectedAiChapterId);
    if (!chapter) {
      toast.error("अध्याय नहीं मिला");
      return;
    }

    const subject = subjects.find(s => s.id === chapter.subject_id);
    const cls = classes.find(c => c.id === subject?.class_id);

    setGeneratingQuestions(true);
    setGenerationProgress(10);
    setGeneratedQuestions([]);

    try {
      setGenerationProgress(30);
      
      const { data, error } = await supabase.functions.invoke('generate-questions-from-pdf', {
        body: {
          pdfUrl: chapter.pdf_url || null,
          chapterName: chapter.name,
          subjectName: subject?.name || "Unknown",
          className: cls ? `Class ${cls.class_number}` : "Unknown",
          numQuestions: parseInt(numQuestionsToGenerate)
        }
      });

      setGenerationProgress(80);

      if (error) {
        console.error("AI generation error:", error);
        toast.error("प्रश्न बनाने में त्रुटि");
        setGeneratingQuestions(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setGeneratingQuestions(false);
        return;
      }

      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setGenerationProgress(100);
        toast.success(`${data.questions.length} प्रश्न बनाए गए!`);
      } else {
        toast.error("कोई प्रश्न नहीं बने");
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("AI सेवा में त्रुटि");
    }

    setGeneratingQuestions(false);
  };

  const handleSaveGeneratedQuestions = async () => {
    if (generatedQuestions.length === 0) {
      toast.error("कोई प्रश्न नहीं है");
      return;
    }

    if (!selectedAiChapterId) {
      toast.error("अध्याय चुनें");
      return;
    }

    try {
      const questionsToInsert = generatedQuestions.map(q => ({
        chapter_id: selectedAiChapterId,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correct_answer || "",
        difficulty: q.difficulty || "medium"
      }));

      console.log("Saving questions:", questionsToInsert);

      const { data, error } = await supabase
        .from("chapter_questions" as any)
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error("Save error:", error);
        toast.error(`सेव में त्रुटि: ${error.message}`);
        return;
      }

      console.log("Saved successfully:", data);
      toast.success(`${generatedQuestions.length} प्रश्न सेव हो गए!`);
      setGeneratedQuestions([]);
      setAiDialogOpen(false);
      setSelectedAiChapterId("");
      fetchQuestions();
    } catch (err) {
      console.error("Save exception:", err);
      toast.error("प्रश्न सेव करने में समस्या");
    }
  };

  const chaptersWithPdf = chapters.filter(c => c.pdf_url);
  const subjectsWithPdf = subjects.filter(s => s.pdf_url);

  // Subject AI Question Generation
  const handleGenerateSubjectQuestions = async () => {
    if (!selectedAiSubjectId) {
      toast.error("विषय चुनें");
      return;
    }

    const subject = subjects.find(s => s.id === selectedAiSubjectId);
    if (!subject) {
      toast.error("विषय नहीं मिला");
      return;
    }

    const cls = classes.find(c => c.id === subject.class_id);

    setGeneratingSubjectQuestions(true);
    setSubjectGenerationProgress(10);
    setGeneratedSubjectQuestions([]);

    try {
      setSubjectGenerationProgress(30);
      
      const { data, error } = await supabase.functions.invoke('generate-questions-from-pdf', {
        body: {
          pdfUrl: subject.pdf_url || null,
          chapterName: subject.name,
          subjectName: subject.name,
          className: cls ? `Class ${cls.class_number}` : "Unknown",
          numQuestions: parseInt(numSubjectQuestionsToGenerate)
        }
      });

      setSubjectGenerationProgress(80);

      if (error) {
        console.error("AI generation error:", error);
        toast.error("प्रश्न बनाने में त्रुटि");
        setGeneratingSubjectQuestions(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setGeneratingSubjectQuestions(false);
        return;
      }

      if (data.questions && data.questions.length > 0) {
        setGeneratedSubjectQuestions(data.questions);
        setSubjectGenerationProgress(100);
        toast.success(`${data.questions.length} प्रश्न बनाए गए!`);
      } else {
        toast.error("कोई प्रश्न नहीं बने");
      }
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("AI सेवा में त्रुटि");
    }

    setGeneratingSubjectQuestions(false);
  };

  const handleSaveSubjectGeneratedQuestions = async () => {
    if (generatedSubjectQuestions.length === 0) {
      toast.error("कोई प्रश्न नहीं है");
      return;
    }

    if (!selectedTargetChapterId) {
      toast.error("प्रश्न सेव करने के लिए अध्याय चुनें");
      return;
    }

    try {
      const questionsToInsert = generatedSubjectQuestions.map(q => ({
        chapter_id: selectedTargetChapterId,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correct_answer || "",
        difficulty: q.difficulty || "medium"
      }));

      console.log("Saving subject questions:", questionsToInsert);

      const { data, error } = await supabase
        .from("chapter_questions" as any)
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error("Save error:", error);
        toast.error(`सेव में त्रुटि: ${error.message}`);
        return;
      }

      console.log("Saved successfully:", data);
      toast.success(`${generatedSubjectQuestions.length} प्रश्न सेव हो गए!`);
      setGeneratedSubjectQuestions([]);
      setSubjectAiDialogOpen(false);
      setSelectedAiSubjectId("");
      setSelectedTargetChapterId("");
      fetchQuestions();
    } catch (err) {
      console.error("Save exception:", err);
      toast.error("प्रश्न सेव करने में समस्या");
    }
  };

  const getChaptersForSubject = (subjectId: string) => {
    return chapters.filter(c => c.subject_id === subjectId);
  };

  // Question CRUD operations
  const handleSaveQuestion = async () => {
    if (!selectedChapterId || !questionText || !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
      toast.error("सभी फ़ील्ड भरें");
      return;
    }

    const questionData = {
      chapter_id: selectedChapterId,
      question: questionText,
      options: [option1, option2, option3, option4],
      correct_answer: correctAnswer,
      difficulty: difficulty
    };

    if (editingQuestionId) {
      const { error } = await supabase
        .from("chapter_questions" as any)
        .update(questionData)
        .eq("id", editingQuestionId);
      
      if (error) {
        toast.error("अपडेट करने में त्रुटि");
        return;
      }
      toast.success("प्रश्न अपडेट हो गया");
    } else {
      const { error } = await supabase.from("chapter_questions" as any).insert(questionData);
      
      if (error) {
        toast.error("जोड़ने में त्रुटि");
        return;
      }
      toast.success("प्रश्न जोड़ दिया गया");
    }

    resetQuestionForm();
    fetchQuestions();
  };

  const handleEditQuestion = (question: ChapterQuestion) => {
    setSelectedChapterId(question.chapter_id);
    setQuestionText(question.question);
    setOption1(question.options[0] || "");
    setOption2(question.options[1] || "");
    setOption3(question.options[2] || "");
    setOption4(question.options[3] || "");
    setCorrectAnswer(question.correct_answer);
    setDifficulty(question.difficulty);
    setEditingQuestionId(question.id);
    setQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await supabase.from("chapter_questions" as any).delete().eq("id", id);
    if (error) {
      toast.error("हटाने में त्रुटि");
      return;
    }
    toast.success("प्रश्न हटा दिया गया");
    fetchQuestions();
  };

  const resetQuestionForm = () => {
    setSelectedChapterId("");
    setQuestionText("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCorrectAnswer("");
    setDifficulty("medium");
    setEditingQuestionId(null);
    setQuestionDialogOpen(false);
  };

  // Helper functions
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `Class ${cls.class_number} (${cls.board_type.toUpperCase()})` : "Unknown";
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.emoji} ${subject.name}` : "Unknown";
  };

  const getChapterName = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? `Chapter ${chapter.chapter_number}: ${chapter.name}` : "Unknown";
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🔒 Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Admin panel खोलने के लिए पहले लॉगिन करना ज़रूरी है।
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/auth")} className="flex-1">
                लॉगिन करें
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                होम
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🚫 Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              आपके पास Admin Panel का access नहीं है। सिर्फ admin users ही इस page को देख सकते हैं।
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                होम जाएं
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">🔧 Admin Panel</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">डैशबोर्ड</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">कक्षाएं</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">विषय</span>
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">अध्याय</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">प्रश्न</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{classes.length}</p>
                  <p className="text-sm text-muted-foreground">कुल कक्षाएं</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-sm text-muted-foreground">कुल विषय</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{chapters.length}</p>
                  <p className="text-sm text-muted-foreground">कुल अध्याय</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground">{questions.length}</p>
                  <p className="text-sm text-muted-foreground">कुल प्रश्न</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>📊 विषय-वार प्रश्न</CardTitle>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">कोई विषय नहीं</p>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((subject) => {
                      const subjectChapters = chapters.filter(c => c.subject_id === subject.id);
                      const subjectQuestionCount = subjectChapters.reduce((sum, ch) => 
                        sum + questions.filter(q => q.chapter_id === ch.id).length, 0
                      );
                      const cls = classes.find(c => c.id === subject.class_id);
                      return (
                        <div key={subject.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{subject.emoji} {subject.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cls ? `कक्षा ${cls.class_number}` : ''} • {subjectChapters.length} अध्याय
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary">{subjectQuestionCount}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>📚 कक्षाएं (Quiz से जुड़ी)</CardTitle>
                <p className="text-sm text-muted-foreground">Quiz में दिखने वाली सभी कक्षाएं यहां हैं। विषय जोड़ें और PDF अपलोड करें।</p>
              </CardHeader>
              <CardContent>
                {["ncert", "bihar"].map((board) => {
                  const boardClasses = classes
                    .filter(c => c.board_type === board)
                    .sort((a, b) => a.class_number - b.class_number);
                  
                  return (
                    <div key={board} className="mb-6">
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        {board === "ncert" ? "📘" : "📗"} {board === "ncert" ? "NCERT" : "Bihar Board"}
                      </h3>
                      <div className="grid gap-3">
                        {boardClasses.map((cls) => {
                          const classSubjects = subjects.filter(s => s.class_id === cls.id);
                          const isExpanded = expandedClassId === cls.id;
                          const totalQuestions = classSubjects.reduce((sum, sub) => {
                            const subChapters = chapters.filter(c => c.subject_id === sub.id);
                            return sum + subChapters.reduce((s, ch) => s + questions.filter(q => q.chapter_id === ch.id).length, 0);
                          }, 0);
                          
                          return (
                            <div key={cls.id} className="border rounded-lg overflow-hidden">
                              <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-primary">{cls.class_number}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">कक्षा {cls.class_number}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {classSubjects.length} विषय • {totalQuestions} प्रश्न
                                      {classSubjects.filter(s => s.pdf_url).length > 0 && (
                                        <span className="ml-1 text-green-600">• 📄 {classSubjects.filter(s => s.pdf_url).length} PDF</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQuickSubjectClassId(cls.id);
                                      setSelectedClassId(cls.id);
                                      setSubjectDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> विषय जोड़ें
                                  </Button>
                                  <span className="text-muted-foreground">{isExpanded ? "▲" : "▼"}</span>
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="border-t p-4 bg-muted/30">
                                  {classSubjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                      कोई विषय नहीं। "विषय जोड़ें" बटन से विषय और PDF जोड़ें।
                                    </p>
                                  ) : (
                                    <div className="grid gap-2">
                                      {classSubjects.map((subject) => {
                                        const subChapters = chapters.filter(c => c.subject_id === subject.id);
                                        const subQuestionCount = subChapters.reduce((s, ch) => s + questions.filter(q => q.chapter_id === ch.id).length, 0);
                                        return (
                                          <div key={subject.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                            <div>
                                              <p className="font-medium flex items-center gap-2">
                                                {subject.emoji} {subject.name}
                                                {subject.pdf_url ? (
                                                  <a href={subject.pdf_url} target="_blank" rel="noopener noreferrer" className="text-green-600 text-xs flex items-center gap-1">
                                                    <FileText className="h-3 w-3" /> PDF ✓
                                                  </a>
                                                ) : (
                                                  <span className="text-xs text-amber-500">⚠️ PDF नहीं</span>
                                                )}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {subject.name_hindi} • {subChapters.length} अध्याय • {subQuestionCount} प्रश्न
                                              </p>
                                            </div>
                                            <div className="flex gap-1">
                                              <Button variant="ghost" size="icon" onClick={() => handleEditSubject(subject)}>
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(subject.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>📖 विषय प्रबंधन</CardTitle>
                <div className="flex gap-2">
                  {/* Subject AI Dialog */}
                  <Dialog open={subjectAiDialogOpen} onOpenChange={setSubjectAiDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" disabled={subjects.length === 0}>
                        <Sparkles className="h-4 w-4 mr-2" /> AI से प्रश्न
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>🤖 विषय से प्रश्न बनाएं</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>विषय चुनें</Label>
                          <Select value={selectedAiSubjectId} onValueChange={(val) => {
                            setSelectedAiSubjectId(val);
                            setSelectedTargetChapterId("");
                            setGeneratedSubjectQuestions([]);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="विषय चुनें" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.emoji} {subject.name} - {getClassName(subject.class_id)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedAiSubjectId && (
                          <div>
                            <Label>प्रश्न किस अध्याय में सेव करें?</Label>
                            <Select value={selectedTargetChapterId} onValueChange={setSelectedTargetChapterId}>
                              <SelectTrigger>
                                <SelectValue placeholder="अध्याय चुनें (प्रश्न सेव करने के लिए)" />
                              </SelectTrigger>
                              <SelectContent>
                                {getChaptersForSubject(selectedAiSubjectId).map((chapter) => (
                                  <SelectItem key={chapter.id} value={chapter.id}>
                                    Ch {chapter.chapter_number}: {chapter.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getChaptersForSubject(selectedAiSubjectId).length === 0 && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ इस विषय में कोई अध्याय नहीं है। पहले अध्याय जोड़ें।
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <Label>कितने प्रश्न बनाने हैं?</Label>
                          <Select value={numSubjectQuestionsToGenerate} onValueChange={setNumSubjectQuestionsToGenerate}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 प्रश्न</SelectItem>
                              <SelectItem value="20">20 प्रश्न</SelectItem>
                              <SelectItem value="50">50 प्रश्न</SelectItem>
                              <SelectItem value="100">100 प्रश्न</SelectItem>
                              <SelectItem value="200">200 प्रश्न</SelectItem>
                              <SelectItem value="300">300 प्रश्न</SelectItem>
                              <SelectItem value="400">400 प्रश्न</SelectItem>
                              <SelectItem value="500">500 प्रश्न</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          onClick={handleGenerateSubjectQuestions} 
                          className="w-full"
                          disabled={generatingSubjectQuestions || !selectedAiSubjectId}
                        >
                          {generatingSubjectQuestions ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              प्रश्न बन रहे हैं...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              प्रश्न बनाएं
                            </>
                          )}
                        </Button>

                        {generatingSubjectQuestions && (
                          <div className="space-y-2">
                            <Progress value={subjectGenerationProgress} className="h-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              PDF का विश्लेषण हो रहा है...
                            </p>
                          </div>
                        )}

                        {generatedSubjectQuestions.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{generatedSubjectQuestions.length} प्रश्न बने:</h3>
                              <Button 
                                onClick={handleSaveSubjectGeneratedQuestions}
                                disabled={!selectedTargetChapterId}
                              >
                                सभी प्रश्न सेव करें
                              </Button>
                            </div>
                            {!selectedTargetChapterId && (
                              <p className="text-xs text-amber-600">
                                ⚠️ प्रश्न सेव करने के लिए ऊपर अध्याय चुनें
                              </p>
                            )}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {generatedSubjectQuestions.map((q, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium text-sm">
                                    {idx + 1}. {q.question}
                                  </p>
                                  <div className="mt-2 grid grid-cols-2 gap-1">
                                    {q.options.map((opt, optIdx) => (
                                      <span 
                                        key={optIdx}
                                        className={`text-xs px-2 py-1 rounded ${
                                          opt === q.correct_answer 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                            : "bg-background"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    कठिनाई: {q.difficulty}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetSubjectForm()}>
                        <Plus className="h-4 w-4 mr-2" /> नया विषय
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingSubjectId ? "विषय संपादित करें" : "नया विषय जोड़ें"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>कक्षा चुनें</Label>
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                          <SelectTrigger>
                            <SelectValue placeholder="कक्षा चुनें" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                Class {cls.class_number} ({cls.board_type.toUpperCase()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>विषय नाम (English)</Label>
                        <Input
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder="Mathematics"
                        />
                      </div>
                      <div>
                        <Label>विषय नाम (Hindi)</Label>
                        <Input
                          value={subjectNameHindi}
                          onChange={(e) => setSubjectNameHindi(e.target.value)}
                          placeholder="गणित"
                        />
                      </div>
                      <div>
                        <Label>Emoji</Label>
                        <Input
                          value={subjectEmoji}
                          onChange={(e) => setSubjectEmoji(e.target.value)}
                          placeholder="📐"
                        />
                      </div>
                      <div>
                        <Label>PDF अपलोड करें (Optional)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            ref={subjectPdfInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setSubjectPdfFile(e.target.files?.[0] || null)}
                            className="flex-1"
                          />
                          {subjectPdfFile && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <FileText className="h-4 w-4" /> {subjectPdfFile.name.slice(0, 20)}...
                            </span>
                          )}
                        </div>
                        {editingSubjectId && subjects.find(s => s.id === editingSubjectId)?.pdf_url && (
                          <p className="text-xs text-muted-foreground mt-1">
                            पहले से PDF अपलोड है। नया अपलोड करने पर पुराना replace हो जाएगा।
                          </p>
                        )}
                      </div>
                      <Button onClick={handleSaveSubject} className="w-full" disabled={uploadingSubjectPdf}>
                        {uploadingSubjectPdf ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> अपलोड हो रहा है...
                          </>
                        ) : (
                          editingSubjectId ? "अपडेट करें" : "जोड़ें"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई विषय नहीं मिला</p>
                ) : (
                  <div className="grid gap-3">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {subject.emoji} {subject.name}
                            {subject.pdf_url && (
                              <a 
                                href={subject.pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="PDF देखें"
                              >
                                <FileText className="h-4 w-4" />
                              </a>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {subject.name_hindi} • {getClassName(subject.class_id)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditSubject(subject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(subject.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>📑 अध्याय प्रबंधन</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" disabled={chapters.length === 0}>
                        <Sparkles className="h-4 w-4 mr-2" /> AI से प्रश्न बनाएं
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>🤖 AI से प्रश्न बनाएं</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>अध्याय चुनें</Label>
                          <Select value={selectedAiChapterId} onValueChange={setSelectedAiChapterId}>
                            <SelectTrigger>
                              <SelectValue placeholder="अध्याय चुनें" />
                            </SelectTrigger>
                            <SelectContent>
                              {chapters.map((chapter) => (
                                <SelectItem key={chapter.id} value={chapter.id}>
                                  Ch {chapter.chapter_number}: {chapter.name} - {getSubjectName(chapter.subject_id)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>कितने प्रश्न बनाने हैं?</Label>
                          <Select value={numQuestionsToGenerate} onValueChange={setNumQuestionsToGenerate}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 प्रश्न</SelectItem>
                              <SelectItem value="20">20 प्रश्न</SelectItem>
                              <SelectItem value="50">50 प्रश्न</SelectItem>
                              <SelectItem value="100">100 प्रश्न</SelectItem>
                              <SelectItem value="200">200 प्रश्न</SelectItem>
                              <SelectItem value="300">300 प्रश्न</SelectItem>
                              <SelectItem value="400">400 प्रश्न</SelectItem>
                              <SelectItem value="500">500 प्रश्न</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          onClick={handleGenerateQuestions} 
                          className="w-full"
                          disabled={generatingQuestions || !selectedAiChapterId}
                        >
                          {generatingQuestions ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              प्रश्न बन रहे हैं...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              प्रश्न बनाएं
                            </>
                          )}
                        </Button>

                        {generatingQuestions && (
                          <div className="space-y-2">
                            <Progress value={generationProgress} className="h-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              PDF का विश्लेषण हो रहा है...
                            </p>
                          </div>
                        )}

                        {generatedQuestions.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{generatedQuestions.length} प्रश्न बने:</h3>
                              <Button onClick={handleSaveGeneratedQuestions}>
                                सभी प्रश्न सेव करें
                              </Button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {generatedQuestions.map((q, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium text-sm">
                                    {idx + 1}. {q.question}
                                  </p>
                                  <div className="mt-2 grid grid-cols-2 gap-1">
                                    {q.options.map((opt, optIdx) => (
                                      <span 
                                        key={optIdx}
                                        className={`text-xs px-2 py-1 rounded ${
                                          opt === q.correct_answer 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                            : "bg-background"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    कठिनाई: {q.difficulty}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetChapterForm()}>
                        <Plus className="h-4 w-4 mr-2" /> नया अध्याय
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingChapterId ? "अध्याय संपादित करें" : "नया अध्याय जोड़ें"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>विषय चुनें</Label>
                          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                            <SelectTrigger>
                              <SelectValue placeholder="विषय चुनें" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.emoji} {subject.name} - {getClassName(subject.class_id)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>अध्याय नंबर</Label>
                          <Input
                            type="number"
                            min="1"
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(e.target.value)}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label>अध्याय नाम (English)</Label>
                          <Input
                            value={chapterName}
                            onChange={(e) => setChapterName(e.target.value)}
                            placeholder="Numbers"
                          />
                        </div>
                        <div>
                          <Label>अध्याय नाम (Hindi)</Label>
                          <Input
                            value={chapterNameHindi}
                            onChange={(e) => setChapterNameHindi(e.target.value)}
                            placeholder="संख्याएं"
                          />
                        </div>
                        <div>
                          <Label>PDF अपलोड करें (Optional)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              ref={pdfInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                              className="flex-1"
                            />
                            {pdfFile && (
                              <span className="text-xs text-green-600">
                                ✓ {pdfFile.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF अपलोड करने से AI प्रश्न बना सकेगा
                          </p>
                        </div>
                        <Button onClick={handleSaveChapter} className="w-full" disabled={uploadingPdf}>
                          {uploadingPdf ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              PDF अपलोड हो रहा है...
                            </>
                          ) : (
                            editingChapterId ? "अपडेट करें" : "जोड़ें"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {chapters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई अध्याय नहीं मिला</p>
                ) : (
                  <div className="grid gap-3">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">अध्याय {chapter.chapter_number}: {chapter.name}</p>
                            {chapter.pdf_url && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                📄 PDF
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {chapter.name_hindi} • {getSubjectName(chapter.subject_id)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {chapter.pdf_url && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(chapter.pdf_url!, '_blank')}
                              title="PDF देखें"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEditChapter(chapter)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteChapter(chapter.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>❓ प्रश्न प्रबंधन</CardTitle>
                <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetQuestionForm()}>
                      <Plus className="h-4 w-4 mr-2" /> नया प्रश्न
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingQuestionId ? "प्रश्न संपादित करें" : "नया प्रश्न जोड़ें"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>अध्याय चुनें</Label>
                        <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                          <SelectTrigger>
                            <SelectValue placeholder="अध्याय चुनें" />
                          </SelectTrigger>
                          <SelectContent>
                            {chapters.map((chapter) => (
                              <SelectItem key={chapter.id} value={chapter.id}>
                                Ch {chapter.chapter_number}: {chapter.name} - {getSubjectName(chapter.subject_id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>प्रश्न</Label>
                        <Textarea
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="प्रश्न यहां लिखें..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>विकल्प A</Label>
                          <Input
                            value={option1}
                            onChange={(e) => setOption1(e.target.value)}
                            placeholder="विकल्प A"
                          />
                        </div>
                        <div>
                          <Label>विकल्प B</Label>
                          <Input
                            value={option2}
                            onChange={(e) => setOption2(e.target.value)}
                            placeholder="विकल्प B"
                          />
                        </div>
                        <div>
                          <Label>विकल्प C</Label>
                          <Input
                            value={option3}
                            onChange={(e) => setOption3(e.target.value)}
                            placeholder="विकल्प C"
                          />
                        </div>
                        <div>
                          <Label>विकल्प D</Label>
                          <Input
                            value={option4}
                            onChange={(e) => setOption4(e.target.value)}
                            placeholder="विकल्प D"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>सही उत्तर</Label>
                        <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                          <SelectTrigger>
                            <SelectValue placeholder="सही उत्तर चुनें" />
                          </SelectTrigger>
                          <SelectContent>
                            {option1 && <SelectItem value={option1}>{option1}</SelectItem>}
                            {option2 && <SelectItem value={option2}>{option2}</SelectItem>}
                            {option3 && <SelectItem value={option3}>{option3}</SelectItem>}
                            {option4 && <SelectItem value={option4}>{option4}</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>कठिनाई स्तर</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">आसान (Easy)</SelectItem>
                            <SelectItem value="medium">मध्यम (Medium)</SelectItem>
                            <SelectItem value="hard">कठिन (Hard)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveQuestion} className="w-full">
                        {editingQuestionId ? "अपडेट करें" : "जोड़ें"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई प्रश्न नहीं मिला</p>
                ) : (
                  <div className="grid gap-3">
                    {questions.map((question) => (
                      <div key={question.id} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {question.options.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 text-xs rounded ${
                                    opt === question.correct_answer
                                      ? "bg-success/20 text-success"
                                      : "bg-background"
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {getChapterName(question.chapter_id)} • {question.difficulty}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(question)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
