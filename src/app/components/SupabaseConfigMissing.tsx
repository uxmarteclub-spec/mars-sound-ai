/**
 * Mostrado quando faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 * A app não corre em modo demo sem backend.
 */
export function SupabaseConfigMissing() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "#1c1315", color: "#a19a9b" }}
    >
      <h1 className="text-xl font-semibold text-white max-w-md">
        Configuração do Supabase em falta
      </h1>
      <p className="text-sm max-w-lg leading-relaxed">
        Crie um ficheiro <code className="text-[#ff164c]">.env</code> na raiz do
        projeto (copie de <code className="text-[#ff164c]">.env.example</code>) e
        defina <code className="text-[#ff164c]">VITE_SUPABASE_URL</code> e{" "}
        <code className="text-[#ff164c]">VITE_SUPABASE_ANON_KEY</code> com os
        valores do painel Supabase (Settings → API). Reinicie o servidor de
        desenvolvimento (<code className="text-[#ff164c]">npm run dev</code>).
      </p>
    </div>
  );
}
