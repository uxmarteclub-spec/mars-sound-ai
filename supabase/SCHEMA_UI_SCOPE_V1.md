# Âmbito UI vs schema (v1)

Este documento fixa o que a aplicação cobre **nesta versão** e o que fica **fora de âmbito**, alinhado a `DATABASE_SCHEMA.md` e ao produto atual.

## Coberto na UI com dados reais (quando Supabase está configurado)

| Schema | UI / fluxo |
|--------|------------|
| `users` | Identidade via Supabase Auth + linha em `public.users` (perfil ainda parcialmente estático na página Perfil) |
| `tracks` | Home, Descobrir, Upload, player |
| `genres` | Categorias em Descobrir; resolução de género no upload |
| `playlists`, `playlist_tracks` | Listas, detalhe, CRUD |
| `favorites` | Favoritos na app (ícone de favorito / página Favoritos) |
| Storage `audio-tracks`, `track-covers` | Upload de faixa e capa |

## Fora de âmbito v1 (sem ecrã ou sem integração dedicada)

| Schema | Notas |
|--------|--------|
| `likes` | O schema distingue *likes* de *favorites*; a UI usa apenas **favoritos** (`favorites`). *Likes* ficam para uma versão futura se for desejado alinhar com `like_count` / notificações. |
| `follows` | Possível estado local na página de perfil; sem persistência Supabase nesta versão. |
| `comments` | Sem ecrã. |
| `play_history` | Escrito ao reproduzir (analytics); sem ecrã de histórico. |
| `notifications` | Sem ecrã; triggers podem criar linhas em cenários como *follows* / *likes* no backend. |
| `reports`, `audit_logs` | Sem ecrã. |
| `tags`, `track_tags` | Tags no formulário de upload são gravadas como `moods` na faixa; não há gestão da tabela `tags` / `track_tags`. |
| `notifications` ligadas a *likes* | Depende de uso futuro da tabela `likes`. |

## Decisão explícita

- **v1** prioriza **Auth**, **tracks**, **playlists**, **favorites**, **storage** e **RPCs** já usados (`search_tracks`, `get_top_tracks_this_week`, `increment_play_count`).
- Funcionalidades sociais completas (comentários, notificações na UI, *likes* separados de favoritos, histórico reproduzível pelo utilizador) ficam para iterações seguintes, salvo novo âmbito.
