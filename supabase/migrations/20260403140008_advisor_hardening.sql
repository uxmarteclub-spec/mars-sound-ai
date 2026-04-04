-- Applied to project ftezgnflagqhokwbkonw via Supabase MCP
-- Blocks all client roles on audit_logs; service_role bypasses RLS for backend inserts.
CREATE POLICY "audit_logs_block_clients" ON public.audit_logs FOR ALL USING (false);
