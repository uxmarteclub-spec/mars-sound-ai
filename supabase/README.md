# Supabase — Mars Sound AI

## Projeto

- **Project ref / id:** `ftezgnflagqhokwbkonw`
- **URL:** `https://ftezgnflagqhokwbkonw.supabase.co`
- **Região:** `us-east-1`

## Variáveis de ambiente (frontend)

Use apenas a chave **anon** no cliente (Vite):

- `VITE_SUPABASE_URL` = `https://ftezgnflagqhokwbkonw.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (Settings → API → `anon` `public`)

Nunca commitar `service_role` nem expor no browser.

No repositório, use o ficheiro **`.env.example`** na raiz do projeto Vite como modelo (copiar para `.env` local).

- Matriz de QA pós-integração: [QA_RESULTS.md](./QA_RESULTS.md)
- O que a UI cobre vs schema (v1): [SCHEMA_UI_SCOPE_V1.md](./SCHEMA_UI_SCOPE_V1.md)

## O que foi aplicado (migrações)

Ordem aplicada via Supabase MCP (`apply_migration`):

1. `20260403140000_extensions_and_enums` — `pgcrypto`, enums (`user_role`, `track_status`, `playlist_visibility`, `notification_type`)
2. `20260403140001_genres_tags_seed` — tabelas `genres`, `tags` + seed idempotente (géneros + tags do `DATABASE_SCHEMA.md`)
3. `20260403140002_public_users_and_auth_trigger` — `public.users` (`id` = `auth.users.id`) + trigger `handle_new_user`
4. `20260403140003_core_domain_tables` — `tracks`, `playlists`, `playlist_tracks`, `favorites`, `likes`, `follows`, `comments`, `play_history`, `notifications`, `reports`, `audit_logs`, `track_tags`
5. `20260403140004_row_level_security` — RLS + políticas (incl. `audit_logs` bloqueado a clientes na migração seguinte)
6. `20260403140005_functions_triggers` — contadores, notificações (follow/like), `increment_play_count`, `search_tracks`, `get_recommendations`, `get_top_tracks_this_week`, `updated_at`
7. `20260403140006_storage_buckets_policies` — buckets `audio-tracks`, `track-covers`, `user-avatars`, `playlist-covers`, `waveforms` + políticas por pasta `{user_id}/...`
8. `20260403140007_fulltext_and_analytics_views` — índice GIN full-text em `tracks` + views `top_tracks_this_month`, `top_users_this_week`, `genre_stats`
9. `20260403140008_advisor_hardening` — `security_invoker` nas views; `search_path` fixo em funções; política `audit_logs_block_clients`

## Modelo de IDs

- **Utilizadores:** `uuid` alinhado a `auth.users.id`
- **Tracks, playlists, etc.:** `uuid` (default `gen_random_uuid()`)

## Storage

Uploads devem usar caminho **`{auth.uid()}/ficheiro`** para satisfazer as políticas RLS do Storage.

## Seed controlado

- **Já na base:** géneros e tags (migração 2).
- **Opcional:** ver [seed_demo.sql](./seed_demo.sql) após criar utilizador no Auth.

## Tipos TypeScript

Regenerar quando o schema mudar:

```bash
npx supabase gen types typescript --project-id ftezgnflagqhokwbkonw > src/types/database.types.ts
```

(O repositório pode incluir uma cópia gerada em `src/types/database.types.ts`.)

## Pasta `migrations/`

Os ficheiros `.sql` locais espelham o SQL aplicado no projeto remoto para revisão e CI; a fonte de verdade da ordem é a tabela `supabase_migrations.schema_migrations` no hosted project.
