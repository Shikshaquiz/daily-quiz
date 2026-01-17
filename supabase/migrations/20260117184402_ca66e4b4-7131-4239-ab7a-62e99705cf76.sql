-- Create admin_classes table
CREATE TABLE public.admin_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_number INTEGER NOT NULL,
  board_type TEXT NOT NULL DEFAULT 'ncert',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_subjects table
CREATE TABLE public.admin_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.admin_classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hindi TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_chapters table
CREATE TABLE public.admin_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.admin_subjects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_hindi TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter_questions table
CREATE TABLE public.chapter_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.admin_chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_questions ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Anyone can view classes" ON public.admin_classes FOR SELECT USING (true);
CREATE POLICY "Anyone can view subjects" ON public.admin_subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapters" ON public.admin_chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON public.chapter_questions FOR SELECT USING (true);

-- Admin write access (for now allowing authenticated users - can be restricted later with is_admin check)
CREATE POLICY "Authenticated users can insert classes" ON public.admin_classes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update classes" ON public.admin_classes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete classes" ON public.admin_classes FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert subjects" ON public.admin_subjects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update subjects" ON public.admin_subjects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete subjects" ON public.admin_subjects FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert chapters" ON public.admin_chapters FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update chapters" ON public.admin_chapters FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete chapters" ON public.admin_chapters FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert questions" ON public.chapter_questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update questions" ON public.chapter_questions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete questions" ON public.chapter_questions FOR DELETE USING (auth.uid() IS NOT NULL);