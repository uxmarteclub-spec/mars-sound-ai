# Resultados da matriz de QA (pós-integração front + Supabase)

**Data:** 2026-04-03  
**Ambiente:** build local `npm run build` (sucesso). Testes manuais na UI exigem `npm run dev`, ficheiro `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, e projeto Supabase ativo.

## Resumo

| Área | Estado | Notas |
|------|--------|--------|
| Build Vite / TypeScript | **OK** | Sem erros de compilação |
| Auth (registo / login / logout) | **A verificar manualmente** | `AuthContext` + `AuthPage` usam `signUp` / `signInWithPassword` / `signOut`; confirmação de e-mail depende das definições do projeto Supabase |
| Sessão persistida (refresh) | **A verificar manualmente** | `persistSession: true` no cliente |
| Tracks (listar publicadas, rascunhos do dono) | **A verificar manualmente** | `LibraryContext` + RLS no schema |
| Playlists CRUD | **A verificar manualmente** | Inserção/atualização/remoção via PostgREST |
| Favoritos (`favorites`) | **A verificar manualmente** | `FavoritesContext` sincroniza com a tabela quando há sessão real |
| Storage (áudio / capa, path `userId/…`) | **A verificar manualmente** | `uploadTrackWithStorage` em `libraryData.ts` |
| RPC `search_tracks` | **A verificar manualmente** | Usado na pesquisa da página Descobrir com Supabase configurado |
| RPC `get_top_tracks_this_week` | **A verificar manualmente** | Secção “Destaques da semana” na Home |
| RPC `increment_play_count` + `play_history` | **A verificar manualmente** | Chamados em `notifyTrackPlaybackStarted` ao iniciar reprodução (utilizador autenticado) |
| Responsividade | **A verificar manualmente** | Sem alterações estruturais nas rotas; validar BottomNav / player em viewports estreitas |

## Ordem sugerida de testes manuais

1. Copiar `.env.example` para `.env` e preencher as chaves do projeto.
2. Registar novo utilizador → confirmar linha em `public.users` (trigger `handle_new_user`) se a confirmação de e-mail estiver desativada ou após confirmar.
3. Login → refresh da página → sessão mantida.
4. Descobrir: filtros por categoria; pesquisa com texto (RPC).
5. Carregar música: ficheiro de áudio + capa opcional → objetos em Storage e linha em `tracks` com `status` publicado.
6. Favoritos: alternar coração → linhas em `favorites`.
7. Playlists: criar, editar, eliminar.
8. Reproduzir faixa UUID → `play_count` e `play_history` (utilizador autenticado).
9. RLS: com segundo utilizador, confirmar que não vê rascunhos alheios nem playlists privadas de outros.

## Ferramentas

- Browser + DevTools (rede / consola).
- Opcional: subagente **senior-web-tester** com rotas explícitas após `npm run dev`.
