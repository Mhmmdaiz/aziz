-- TABEL PENGIRIMAN KONTAK (CONTACT SUBMISSIONS)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread', -- unread, read, archived
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Izinkan semua orang (publik) untuk mengirim pesan
CREATE POLICY "Allow public to insert contact submissions"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

-- Hanya admin yang bisa melihat dan mengelola pesan
CREATE POLICY "Allow admins to view all contact submissions"
ON public.contact_submissions FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));
