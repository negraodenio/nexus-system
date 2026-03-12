-- Storage RLS Policy for skill-videos bucket
-- Sintaxe moderna do Supabase (2024+)
-- PASSO 1: Criar o bucket manualmente em Storage > Buckets > New Bucket
--          Nome: skill-videos | Public: true
-- PASSO 2: Correr este SQL

-- Upload público (utilizadores autenticados e anónimos)
CREATE POLICY "Allow public uploads to skill-videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'skill-videos');

-- Leitura pública
CREATE POLICY "Allow public reads from skill-videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'skill-videos');

-- Update só pelo dono
CREATE POLICY "Allow owner update in skill-videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- Delete só pelo dono
CREATE POLICY "Allow owner delete from skill-videos"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
