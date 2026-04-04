-- Permite que utilizadores autenticados criem novas categorias (géneros) a partir do upload / descobrir.
CREATE POLICY "genres_insert_authenticated" ON public.genres
  FOR INSERT TO authenticated
  WITH CHECK (true);
