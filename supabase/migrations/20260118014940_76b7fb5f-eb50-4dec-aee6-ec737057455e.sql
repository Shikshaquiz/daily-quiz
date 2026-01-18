-- Create storage bucket for chapter PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-pdfs', 'chapter-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated users can upload chapter PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chapter-pdfs');

-- Allow public to read PDFs
CREATE POLICY "Anyone can view chapter PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chapter-pdfs');

-- Allow authenticated users to update their PDFs
CREATE POLICY "Authenticated users can update chapter PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chapter-pdfs');

-- Allow authenticated users to delete PDFs
CREATE POLICY "Authenticated users can delete chapter PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chapter-pdfs');