
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  memory_date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photos TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memories TO anon, authenticated;
GRANT ALL ON public.memories TO service_role;

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert memories" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update memories" ON public.memories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete memories" ON public.memories FOR DELETE USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('memory-photos', 'memory-photos', true);

CREATE POLICY "Public read memory photos" ON storage.objects FOR SELECT USING (bucket_id = 'memory-photos');
CREATE POLICY "Anyone can upload memory photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-photos');
CREATE POLICY "Anyone can update memory photos" ON storage.objects FOR UPDATE USING (bucket_id = 'memory-photos');
CREATE POLICY "Anyone can delete memory photos" ON storage.objects FOR DELETE USING (bucket_id = 'memory-photos');
