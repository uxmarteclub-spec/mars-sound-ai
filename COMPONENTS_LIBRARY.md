# Banco de Componentes - Mars Sound AI

Este documento descreve todos os componentes reutilizáveis criados para o Mars Sound AI. **SEMPRE consulte este banco antes de criar novos componentes.**

## 📦 Componentes UI Básicos

### Button
**Localização:** `/src/app/components/ui/Button.tsx`

Componente de botão com múltiplas variantes e tamanhos.

**Props (CVA):**
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" (padrão: "default")
- `size`: "default" | "sm" | "lg" | "icon"
- Demais props nativas de `<button>` (`onClick`, `disabled`, `type`, etc.)

**Exemplo de uso:**
```tsx
import { Button } from "./ui/Button";

<Button variant="default" onClick={() => {}}>
  Carregar música
</Button>

<Button variant="outline" type="button">
  Cancelar
</Button>
```

---

### SearchInput
**Localização:** `/src/app/components/ui/SearchInput.tsx`

Campo de busca com ícone integrado.

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `placeholder`: string (opcional)
- `className`: classes adicionais (opcional)

**Exemplo de uso:**
```tsx
import { SearchInput } from "./ui/SearchInput";

const [search, setSearch] = useState("");

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Buscar músicas ou artistas"
/>
```

---

### FavoriteButton
**Localização:** `/src/app/components/ui/FavoriteButton.tsx`

Botão de favorito com estados preenchido/outline.

**Props:**
- `isFavorite`: boolean
- `onToggle`: () => void
- `size`: "sm" | "md" | "lg" (padrão: "md")
- `className`: classes adicionais (opcional)

**Características:**
- Ícone de coração outline quando não favoritado
- Ícone de coração preenchido quando favoritado
- Cor: #ff164c
- Animação de hover com scale
- stopPropagation automático no clique (não dispara clique do card/linha)

**Exemplo de uso:**
```tsx
import { FavoriteButton } from "./ui/FavoriteButton";

const [isFav, setIsFav] = useState(false);

<FavoriteButton
  isFavorite={isFav}
  onToggle={() => setIsFav(!isFav)}
  size="md"
/>
```

---

### MusicCard
**Localização:** `/src/app/components/ui/MusicCard.tsx`

Card de música com duas variantes: grid e lista.

**Props:**
- `track`: Track (objeto com id, title, artist, image, audioUrl)
- `variant`: "grid" | "list" (padrão: "grid")
- `showFavorite`: boolean (padrão: true)
- `playbackQueue`: Track[] (opcional) — fila passada ao `playTrack` para próxima/anterior coerentes
- `className`: classes adicionais (opcional)

**Características:**
- Integrado com `MusicContext` (play / estado “tocando agora”)
- Favorito via `FavoritesContext` (`isFavorite` / `toggleFavorite` por `track.id`)
- Indicador visual quando música está tocando
- Botão de favorito integrado (`FavoriteButton`)
- Hover effects
- Grid variant: thumbnail quadrado, info abaixo
- List variant: thumbnail pequeno, info ao lado

**Exemplo de uso:**
```tsx
import { MusicCard } from "./ui/MusicCard";

// Grid
<MusicCard track={track} variant="grid" />

// Lista com fila da página (Descobrir / Home)
<MusicCard track={track} variant="list" playbackQueue={visibleTracks} />
```

---

### CategoryChip
**Localização:** `/src/app/components/ui/CategoryChip.tsx`

Chip de categoria com estado ativo/inativo.

**Props:**
- `label`: string
- `active`: boolean (padrão: false)
- `onClick`: () => void (opcional)
- `className`: classes adicionais (opcional)

**Características:**
- Estado ativo: fundo vermelho (#ff164c)
- Estado inativo: outline com hover
- Texto branco quando ativo
- Texto cinza (#a19a9b) quando inativo

**Exemplo de uso:**
```tsx
import { CategoryChip } from "./ui/CategoryChip";

<CategoryChip
  label="Rock"
  active={selectedCategory === "Rock"}
  onClick={() => setSelectedCategory("Rock")}
/>
```

---

## 🎵 Componentes de Música

### MusicPlayer
**Localização:** `/src/app/components/MusicPlayer.tsx`

Player de música fixo no rodapé com controles completos.

**Características:**
- Fixado no bottom com z-index 100
- Integrado com `MusicContext` (inclui `shuffleOn`, `repeatMode` off/all/one, `toggleShuffle`, `cycleRepeat`)
- Favorito da faixa atual alinhado a `FavoritesContext`
- Usa `FavoriteButton` reutilizável
- Controles: play/pause, próximo, anterior, shuffle, repeat
- Barra de progresso interativa com hover
- Controle de volume com mute/unmute
- Informações da música atual

---

### MusicCarousel
**Localização:** `/src/app/components/MusicCarousel.tsx`

Carrossel horizontal de músicas.

**Características:**
- Scroll horizontal suave
- Oculta scrollbar
- Usa MusicCard internamente
- Responsivo

---

## 📄 Componentes de Página

### HomePage
**Localização:** `/src/app/components/HomePage.tsx`

Página inicial com seções de músicas em alta, recentes e destaques.

**Características:**
- Dados das seções via `src/services/mock` (`getHomeSections` / seeds)
- Três faixas horizontais com scroll e `MusicCard` (não usa o componente `MusicCarousel` no topo; carrossel permanece disponível como utilitário em `MusicCarousel.tsx`)
- “Ver tudo” chama `onNavigateToDiscover` (estado de navegação no `App`)
- Scroll vertical (sem scrollbar visível)
- Padding para o player fixo

---

### DiscoverPage
**Localização:** `/src/app/components/DiscoverPage.tsx`

Página de descoberta com busca e filtros por categoria.

**Características:**
- Lista de faixas a partir de `LibraryContext.discoverTracks` (seed + uploads mock)
- `searchQuery` / `onSearchQueryChange` controlados pelo `App` (mesma fonte que a `Navbar`)
- Duas variantes automáticas:
  - **Default**: Grid de músicas com filtros por categoria
  - **Search Active**: Lista de resultados de busca
- “Carregar mais”: paginação mock (`visibleCount` sobre a lista filtrada)
- Filtros por categoria
- Integrado com `MusicContext` e `MusicCard` com `playbackQueue`

---

## 🧭 Componentes de Navegação

### Sidebar
**Localização:** `/src/app/components/Sidebar.tsx`

Barra lateral de navegação (desktop e mobile).

**Itens relevantes:** inclui entrada **Prévia perfil público** (`id: perfil-publico`) para QA do layout público sem depender só do botão no perfil.

---

### BottomNav
**Localização:** `/src/app/components/BottomNav.tsx`

Navegação inferior para mobile.

---

### Navbar
**Localização:** `/src/app/components/Navbar.tsx`

Barra superior com busca e perfil.

**Busca:** modo controlado — `searchQuery` e `onSearchQueryChange` vêm do `App` para manter a mesma string ao trocar para Descobrir.

---

## ⚙️ Contextos React (estado global)

| Provider | Arquivo | Responsabilidade |
|----------|---------|------------------|
| `AuthProvider` | `src/app/context/AuthContext.tsx` | Sessão mock: `user`, `signIn`, `signOut`, `isAuthenticated` |
| `LibraryProvider` | `src/app/context/LibraryContext.tsx` | Playlists, mapa `playlistTracksById`, `discoverTracks`, `appendUploadedTrack`, `getTrackById` |
| `FavoritesProvider` | `src/app/context/FavoritesContext.tsx` | `favoriteIds` persistidos em `sessionStorage` (chave `mars-sound-favorite-ids`) |
| `MusicProvider` | `src/app/context/MusicContext.tsx` | Player, fila, shuffle/repeat, progresso; favorito da faixa atual via `FavoritesContext` |

**Ordem no app autenticado:** `LibraryProvider` → `FavoritesProvider` → `MusicProvider` (o player depende de favoritos).

**Serviços mock:** `src/services/mock/*` — substituíveis por chamadas reais mantendo os mesmos tipos (`Track`, `UploadTrackPayload`, etc.).

---

## 🎨 Diretrizes de Design

### Cores
- Brand (vermelho): `#ff164c`
- Background base: `#0a0608`
- Background sidebar: `#1c1315`
- Border: `#30292b`
- Texto primário: `#f8f8f8` / `#bababa`
- Texto muted: `#a19a9b`
- Texto subtil: `#5b4f51`

### Espaçamentos
- Gap pequeno: `gap-2` (8px)
- Gap médio: `gap-4` (16px)
- Gap grande: `gap-6` (24px)
- Padding padrão: `px-[37px]`

### Transições
- Duração padrão: `duration-150`
- Hover effects: scale, opacity, colors

### Bordas
- Border padrão: `border-[#30292b]`
- Border ativa: `border-[#ff164c]`
- Radius pequeno: `rounded-md`
- Radius médio: `rounded-lg`
- Radius completo: `rounded-full`

---

## ✅ Checklist Antes de Criar Novo Componente

1. [ ] Verificar se já existe um componente similar
2. [ ] Verificar se pode ser uma variante de um existente
3. [ ] Verificar se pode ser composto de componentes existentes
4. [ ] Usar cores e tokens do design system
5. [ ] Adicionar props de className para extensibilidade
6. [ ] Documentar o novo componente neste arquivo
7. [ ] Usar componentes reutilizáveis sempre que possível

---

## 🔄 Componentes em Uso

### FavoriteButton
- Usado em: `MusicPlayer`, `MusicCard`, `DiscoverPage`
- Comportamento consistente em todos os contextos

### MusicCard
- Usado em: `DiscoverPage`, `HomePage` (seções horizontais; opcionalmente `MusicCarousel` em outros fluxos)
- Variantes: grid e list
- Favoritos: sempre via `FavoritesContext` quando `showFavorite` é true

### SearchInput
- Usado em: `Navbar` (valor vindo do `App`), filtros locais onde aplicável
- Comportamento de busca global alinhado ao estado do `App`

---

**Última atualização:** abril de 2026  
**Responsável:** Mars Sound AI Team
