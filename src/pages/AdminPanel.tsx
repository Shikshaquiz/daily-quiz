import { useState, useEffect } from "react";
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
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, GraduationCap, FileText, HelpCircle, Loader2 } from "lucide-react";

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
  created_at: string;
}

interface AdminChapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  name: string;
  name_hindi: string;
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

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");
  
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
  
  // Form states for Chapters
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterNameHindi, setChapterNameHindi] = useState("");
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  
  // Form states for Questions
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAllData();
    }
  }, [loading]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

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

    const subjectData = {
      class_id: selectedClassId,
      name: subjectName,
      name_hindi: subjectNameHindi || subjectName,
      emoji: subjectEmoji
    };

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
    setSubjectDialogOpen(false);
  };

  // Chapter CRUD operations
  const handleSaveChapter = async () => {
    if (!selectedSubjectId || !chapterNumber || !chapterName) {
      toast.error("सभी फ़ील्ड भरें");
      return;
    }

    const chapterData = {
      subject_id: selectedSubjectId,
      chapter_number: parseInt(chapterNumber),
      name: chapterName,
      name_hindi: chapterNameHindi || chapterName
    };

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
    setChapterDialogOpen(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
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

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>📚 कक्षाएं प्रबंधन</CardTitle>
                <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetClassForm()}>
                      <Plus className="h-4 w-4 mr-2" /> नई कक्षा
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingClassId ? "कक्षा संपादित करें" : "नई कक्षा जोड़ें"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>कक्षा नंबर</Label>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={classNumber}
                          onChange={(e) => setClassNumber(e.target.value)}
                          placeholder="1-12"
                        />
                      </div>
                      <div>
                        <Label>बोर्ड</Label>
                        <Select value={boardType} onValueChange={setBoardType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ncert">NCERT</SelectItem>
                            <SelectItem value="bihar">Bihar Board</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveClass} className="w-full">
                        {editingClassId ? "अपडेट करें" : "जोड़ें"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई कक्षा नहीं मिली</p>
                ) : (
                  <div className="grid gap-3">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">कक्षा {cls.class_number}</p>
                          <p className="text-sm text-muted-foreground">{cls.board_type.toUpperCase()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClass(cls)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(cls.id)}>
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

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>📖 विषय प्रबंधन</CardTitle>
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
                      <Button onClick={handleSaveSubject} className="w-full">
                        {editingSubjectId ? "अपडेट करें" : "जोड़ें"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई विषय नहीं मिला</p>
                ) : (
                  <div className="grid gap-3">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{subject.emoji} {subject.name}</p>
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
                      <Button onClick={handleSaveChapter} className="w-full">
                        {editingChapterId ? "अपडेट करें" : "जोड़ें"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {chapters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">कोई अध्याय नहीं मिला</p>
                ) : (
                  <div className="grid gap-3">
                    {chapters.map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">अध्याय {chapter.chapter_number}: {chapter.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {chapter.name_hindi} • {getSubjectName(chapter.subject_id)}
                          </p>
                        </div>
                        <div className="flex gap-2">
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
