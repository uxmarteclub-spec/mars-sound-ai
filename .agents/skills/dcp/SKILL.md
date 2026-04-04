---
name: dcp
description: >-
  Executa o fluxo DCP (Database Change Pipeline) após alterações no Supabase:
  aplicar migrações SQL no projeto remoto via MCP user-supabase (apply_migration),
  depois git commit e git push. Usar quando houver ficheiros novos ou alterados em
  supabase/migrations/, seeds, ou quando o utilizador pedir explicitamente "DCP",
  "deploy da base", ou "migrações Supabase + push".
---

# DCP — Database Change Pipeline

## Objetivo

Garantir que mudanças de schema/dados no repositório são **aplicadas no projeto Supabase** e **versionadas no Git** na ordem correta: **Deploy (MCP) → Commit → Push**.

## Pré-requisitos

- MCP **user-supabase** ativo no Cursor.
- Antes de `apply_migration`, **ler o schema** em `mcps/user-supabase/tools/apply_migration.json` (campos obrigatórios: `project_id`, `name`, `query`).
- **Project ID**: usar `list_projects` no MCP ou extrair o ref de `VITE_SUPABASE_URL` (`https://<ref>.supabase.co` → `<ref>`).

## Fluxo obrigatório (ordem)

1. **Inventário local**  
   - Listar `supabase/migrations/*.sql` por nome (ordem lexicográfica = ordem temporal dos timestamps no prefixo).

2. **Estado remoto**  
   - Chamar MCP `list_migrations` com o `project_id` do projeto alvo.  
   - Identificar migrações locais **ainda não registadas** no remoto (comparar pelo **nome lógico** do ficheiro ou conteúdo; se o remoto usa versões geradas, preferir aplicar **sequencialmente** cada ficheiro local que ainda não foi aplicado nesta sessão de DCP).

3. **Deploy via MCP**  
   - Para **cada** migração pendente, ler o **SQL completo** do ficheiro e chamar `apply_migration` com:  
     - `project_id`: ref do projeto Supabase (ex.: projeto **mars-sound-ai** → `ftezgnflagqhokwbkonw`).  
     - `name`: identificador em **snake_case** (ex.: `genres_insert_authenticated`, `genre_create_rpc_limits`); sem espaços.  
     - `query`: texto SQL **integral** do ficheiro.  
   - **Migrações longas**: se o transporte do MCP falhar com o SQL completo, dividir o mesmo ficheiro em **vários** `apply_migration` consecutivos (DDL válido em cada bloco), mantendo o ficheiro local como referência única no repositório.  
   - Se `apply_migration` falhar: **parar**, reportar erro ao utilizador, **não** fazer commit/push até corrigir.

4. **Git — Commit**  
   - `git add` dos ficheiros relevantes (`supabase/migrations/`, e alterações de código ligadas à mesma feature, se fizer parte do mesmo pedido).  
   - **Nunca** incluir `.env` nem secrets.  
   - Mensagem sugerida: `chore(db): DCP — migrações Supabase (<resumo curto>)` ou `feat(db): …` conforme o caso.

5. **Git — Push**  
   - `git push` para o remoto configurado (respeitar branch atual; se as regras do projeto exigirem branch `feature/*`, avisar o utilizador antes de push em `main`).

## Boas práticas

- **Idempotência**: preferir `IF NOT EXISTS`, `DROP POLICY IF EXISTS`, etc., quando fizer sentido.  
- **Uma migração MCP por ficheiro** alinhada ao repositório, para o histórico remoto refletir os ficheiros locais.  
- Após RPC/policies novas, o frontend pode precisar de `generate_typescript_types` (MCP) — opcional, fora do núcleo DCP.  
- Se não houver migrações pendentes, apenas confirmar ao utilizador e **não** inventar SQL.

## Quando não usar DCP

- Alterações só em código sem SQL novo (não chamar `apply_migration`).  
- Utilizador pede apenas revisão de SQL sem aplicar — usar modo leitura / `execute_sql` só se pedido explícito e seguro.
