-- Permite ao utilizador autenticado eliminar a própria conta em auth.users.
-- public.users e dados dependentes são removidos por ON DELETE CASCADE a partir de auth.users.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid;
BEGIN
  uid := (SELECT auth.uid());
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS 'Elimina o utilizador autenticado em auth.users (cascata para public.users e dados ligados).';
