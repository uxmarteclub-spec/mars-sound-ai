# Mars Sound AI - Documentação Completa do Sistema

## Índice

1. [Visão Geral](#visão-geral)
2. [PRD - Product Requirements Document](#prd---product-requirements-document)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Componentes](#componentes)
5. [Páginas](#páginas)
6. [Context & State Management](#context--state-management)
7. [Animações e Transições](#animações-e-transições)
8. [Interações do Usuário](#interações-do-usuário)
9. [Responsividade](#responsividade)
10. [Fluxos de Navegação](#fluxos-de-navegação)

---

## Visão Geral

**Mars Sound AI** é uma plataforma completa de streaming de música gerada por inteligência artificial. O sistema permite que usuários descubram, ouçam, criem playlists, façam upload e compartilhem músicas criadas por IA.

### Tecnologias Principais

- **Frontend Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Animações**: Motion (Framer Motion)
- **State Management**: React Context API
- **Roteamento**: React Router (Data Mode)
- **Ícones**: Lucide React + SVG customizados do Figma
- **Fontes**: Inter (Google Fonts)

### Características Principais

- ✅ Autenticação completa (Login, Cadastro, Recuperação de Senha)
- ✅ Player de música global com mini-player e fullscreen mobile
- ✅ Sidebar fixa no desktop, Bottom Navigation no mobile
- ✅ Sistema de playlists com criação e gerenciamento
- ✅ Página de descoberta com categorias e recomendações
- ✅ Sistema de favoritos
- ✅ Upload de músicas geradas por IA
- ✅ Perfil público e privado
- ✅ Configurações completas (perfil, conta, preferências musicais)
- ✅ Design system robusto com tokens primitivos e semânticos
- ✅ 100% responsivo (mobile-first)
- ✅ Animações e transições suaves

---

## PRD - Product Requirements Document

### 1. Visão do Produto

**Problema**: Artistas e criadores de conteúdo precisam de uma plataforma dedicada para compartilhar e descobrir músicas geradas por IA, que seja tão intuitiva quanto Spotify ou Apple Music.

**Solução**: Mars Sound AI é uma plataforma de streaming focada em música gerada por IA, oferecendo experiência premium de áudio, descoberta inteligente e comunidade ativa de criadores.

**Público-Alvo**: 
- Criadores de conteúdo digital (25-45 anos)
- Músicos experimentais e produtores
- Entusiastas de tecnologia e IA
- Creators de vídeo/podcast que precisam de música royalty-free

### 2. Objetivos do Produto

**Objetivo Principal**: Tornar-se a plataforma #1 para música gerada por IA até 2026.

**KPIs**:
- 100k usuários ativos mensais em 6 meses
- Tempo médio de sessão: 25 minutos
- Taxa de retenção: 60% em 30 dias
- 50k músicas uploaded em 1 ano

### 3. Funcionalidades - MVP

#### 3.1 Autenticação

**User Stories**:
- Como usuário, quero criar uma conta com email/senha ou Google
- Como usuário, quero recuperar minha senha caso esqueça
- Como usuário, quero fazer logout de forma segura

**Requisitos Técnicos**:
- Fluxo de login/cadastro com validação
- Integração com Google OAuth
- Recuperação de senha com email
- Persistência de sessão
- Logout com confirmação

**Status**: ✅ Implementado

#### 3.2 Player de Música

**User Stories**:
- Como usuário, quero ouvir músicas com controles completos (play/pause, próximo, anterior)
- Como usuário mobile, quero expandir o player para tela cheia
- Como usuário, quero controlar volume e silenciar
- Como usuário, quero ver o progresso da música e navegar na timeline

**Requisitos Técnicos**:
- Player global com Context API
- Mini-player fixo no rodapé (desktop)
- Player fullscreen para mobile
- Controles: play/pause, next, previous, volume, mute, seek
- Barra de progresso interativa
- Visualização de capa, título e artista

**Status**: ✅ Implementado

#### 3.3 Descoberta de Conteúdo

**User Stories**:
- Como usuário, quero descobrir novas músicas por categoria
- Como usuário, quero ver músicas em alta
- Como usuário, quero buscar por título ou artista
- Como usuário, quero ver recomendações personalizadas

**Requisitos Técnicos**:
- Página de descoberta com categorias
- Carrosséis horizontais de músicas
- Sistema de busca em tempo real
- Filtros por gênero e mood
- Seção "Em Alta" e "Novos Lançamentos"

**Status**: ✅ Implementado

#### 3.4 Playlists

**User Stories**:
- Como usuário, quero criar playlists personalizadas
- Como usuário, quero adicionar/remover músicas de playlists
- Como usuário, quero editar informações da playlist (nome, descrição, capa)
- Como usuário, quero visualizar todas as minhas playlists

**Requisitos Técnicos**:
- CRUD completo de playlists
- Modal de criação com upload de capa
- Página de detalhes da playlist
- Adicionar músicas à playlist via menu contextual
- Ordenação e gestão de músicas na playlist

**Status**: ✅ Implementado

#### 3.5 Favoritos

**User Stories**:
- Como usuário, quero marcar músicas como favoritas
- Como usuário, quero ver todas as minhas músicas favoritas
- Como usuário, quero remover músicas dos favoritos

**Requisitos Técnicos**:
- Botão de favoritar em cada música
- Página de favoritos com todas as músicas
- Sincronização do estado de favorito global
- Animação de feedback ao favoritar

**Status**: ✅ Implementado

#### 3.6 Upload de Música

**User Stories**:
- Como criador, quero fazer upload de músicas geradas por IA
- Como criador, quero adicionar metadados (título, gênero, mood, tags)
- Como criador, quero fazer upload de capa da música
- Como criador, quero ver preview antes de publicar

**Requisitos Técnicos**:
- Formulário de upload multi-step
- Upload de arquivo de áudio (MP3, WAV)
- Upload de imagem de capa
- Campos: título, descrição, gênero, mood, tags
- Validação de arquivos
- Preview de áudio antes de publicar

**Status**: ✅ Implementado

#### 3.7 Perfil

**User Stories**:
- Como usuário, quero ter um perfil público
- Como usuário, quero editar meu perfil (foto, bio, nome)
- Como usuário, quero ver estatísticas das minhas músicas
- Como usuário, quero ver perfis públicos de outros usuários

**Requisitos Técnicos**:
- Página de perfil privado (próprio usuário)
- Página de perfil público (outros usuários)
- Edição de perfil com upload de foto
- Estatísticas: total de músicas, plays, seguidores
- Lista de músicas do usuário
- Sistema de seguidores (follow/unfollow)

**Status**: ✅ Implementado

#### 3.8 Configurações

**User Stories**:
- Como usuário, quero configurar meu perfil
- Como usuário, quero alterar minha senha
- Como usuário, quero definir preferências musicais
- Como usuário, quero sair da conta
- Como usuário, quero excluir minha conta

**Requisitos Técnicos**:
- Aba de Perfil: edição de informações pessoais, bio, foto
- Aba de Conta: alterar email/senha, sair, excluir conta
- Preferências musicais: gêneros favoritos e moods
- Toggle de perfil público/privado
- Modal de confirmação para ações destrutivas

**Status**: ✅ Implementado

### 4. Requisitos Não-Funcionais

#### 4.1 Performance
- Tempo de carregamento inicial: < 2s
- Time to Interactive: < 3s
- Smooth scroll sem lag
- Animações a 60fps

#### 4.2 Responsividade
- Mobile-first design
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly (botões mínimo 44x44px)
- Gestos mobile: swipe, drag

#### 4.3 Acessibilidade
- WCAG 2.1 Level AA
- Navegação por teclado
- Screen reader friendly
- Contraste de cores adequado
- Focus states visíveis

#### 4.4 SEO
- Meta tags dinâmicas
- Open Graph tags
- Sitemap.xml
- Robots.txt

#### 4.5 Segurança
- Autenticação JWT
- HTTPS obrigatório
- Sanitização de inputs
- Rate limiting
- CORS configurado

### 5. Roadmap Futuro

**Fase 2 (Q2 2026)**:
- Sistema de comentários
- Compartilhamento social
- Notificações push
- Modo offline
- Letras sincronizadas

**Fase 3 (Q3 2026)**:
- Monetização (premium)
- Estatísticas avançadas para creators
- Colaborações entre usuários
- API pública
- Desktop app (Electron)

---

## Arquitetura do Sistema

### Estrutura de Pastas

```
/src
├── /app
│   ├── /components          # Componentes de página e features
│   │   ├── AuthPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── PlaylistsPage.tsx
│   │   ├── PlaylistDetailPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── UploadMusicPage.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── FullScreenMobilePlayer.tsx
│   │   ├── MusicCarousel.tsx
│   │   ├── CreatePlaylistModal.tsx
│   │   └── /ui              # Componentes reutilizáveis
│   │       ├── Button.tsx
│   │       ├── MusicCard.tsx
│   │       ├── TrackRow.tsx
│   │       ├── FavoriteButton.tsx
│   │       ├── CategoryChip.tsx
│   │       ├── SearchInput.tsx
│   │       └── switch.tsx
│   ├── /context
│   │   └── MusicContext.tsx # Estado global do player
│   └── App.tsx              # Componente raiz
├── /imports                 # Assets do Figma (SVGs)
├── /styles
│   ├── theme.css            # Design tokens
│   └── fonts.css            # Importação de fontes
└── main.tsx                 # Entry point
```

### Fluxo de Dados

```
┌─────────────────────────────────────────┐
│           App.tsx (Root)                │
│  - Autenticação                         │
│  - Roteamento                           │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼────────┐    ┌────────▼─────────┐
│ MusicProvider│    │  Page Components │
│  (Context)   │◄───┤  - HomePage      │
│              │    │  - DiscoverPage  │
│  Global:     │    │  - PlaylistsPage │
│  - Track     │    │  - etc...        │
│  - Playing   │    └──────────────────┘
│  - Volume    │
│  - Progress  │
└──────┬───────┘
       │
       │ Consume via useMusicPlayer()
       │
┌──────▼──────────────────────────────┐
│  Player Components                  │
│  - MusicPlayer (Desktop)            │
│  - MiniPlayer (Mobile Bottom)       │
│  - FullScreenMobilePlayer           │
└─────────────────────────────────────┘
```

### Camadas da Aplicação

1. **Presentation Layer** (Componentes React)
   - Páginas e features
   - Componentes UI reutilizáveis
   - Layouts responsivos

2. **State Management** (Context API)
   - MusicContext: Estado global do player
   - Estado local: useState para UI temporário

3. **Data Layer** (Futuro - API)
   - Integração com backend
   - Cache de dados
   - Sincronização offline

---

## Componentes

### Componentes de Layout

#### 1. **Navbar**
**Arquivo**: `/src/app/components/Navbar.tsx`

**Descrição**: Barra de navegação superior fixa presente em todas as páginas.

**Props**:
```typescript
interface NavbarProps {
  onMenuToggle?: () => void;      // Abre menu mobile
  onAvatarClick?: () => void;     // Navega para configurações
}
```

**Funcionalidades**:
- Busca global de músicas/artistas
- Botão de upload (desktop)
- Avatar do usuário com navegação para configurações
- Hambúrguer menu (mobile)

**Responsividade**:
- Desktop: Barra completa com busca e botão de upload
- Mobile: Hambúrguer + busca + avatar

**Interações**:
- Hover no avatar: borda muda para cor brand
- Click no avatar: navega para `/configuracoes`
- Click no hambúrguer: abre sidebar mobile

---

#### 2. **Sidebar**
**Arquivo**: `/src/app/components/Sidebar.tsx`

**Descrição**: Menu lateral fixo com navegação principal.

**Props**:
```typescript
interface SidebarProps {
  activeItem: string;
  onNavChange: (item: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}
```

**Itens de Navegação**:
- Início
- Descobrir
- Playlists
- Favoritos
- Perfil

**Responsividade**:
- Desktop: Fixa à esquerda (190px largura)
- Mobile: Drawer sobreposto, abre/fecha com animação

**Animações**:
- Transição suave ao abrir/fechar (mobile)
- Item ativo com background highlight
- Hover states em todos os itens

---

#### 3. **BottomNav**
**Arquivo**: `/src/app/components/BottomNav.tsx`

**Descrição**: Navegação inferior para mobile.

**Props**:
```typescript
interface BottomNavProps {
  activeItem: string;
  onNavChange: (item: string) => void;
}
```

**Itens**:
- Início
- Descobrir
- Playlists
- Favoritos
- Perfil

**Comportamento**:
- Visível apenas em mobile (< 1024px)
- Fixo no rodapé
- Ícones com label
- Item ativo com cor brand

---

### Componentes de Player

#### 4. **MusicPlayer**
**Arquivo**: `/src/app/components/MusicPlayer.tsx`

**Descrição**: Player de música completo fixo no rodapé (desktop).

**Funcionalidades**:
- Visualização de capa, título, artista
- Controles: play/pause, previous, next
- Barra de progresso clicável
- Controle de volume com slider
- Botão mute/unmute
- Botão de favoritar
- Tempo decorrido e tempo total

**Estado (via Context)**:
```typescript
const {
  currentTrack,
  isPlaying,
  progress,
  volume,
  isMuted,
  togglePlay,
  setProgress,
  setVolume,
  toggleMute,
  playNext,
  playPrevious,
  toggleFavorite
} = useMusicPlayer();
```

**Responsividade**:
- Visível apenas em desktop (>= 1024px)
- Altura fixa: 72px

**Interações**:
- Click na barra de progresso: navega na música
- Drag no slider de volume: ajusta volume
- Hover nos botões: feedback visual

---

#### 5. **MiniPlayer**
**Arquivo**: `/src/app/components/MiniPlayer.tsx`

**Descrição**: Player minificado para mobile.

**Funcionalidades**:
- Capa pequena + título + artista
- Botão play/pause
- Botão de expandir para fullscreen

**Comportamento**:
- Visível apenas em mobile
- Fixo no rodapé (acima do BottomNav)
- Click no card: expande para fullscreen
- Animação de entrada/saída

---

#### 6. **FullScreenMobilePlayer**
**Arquivo**: `/src/app/components/FullScreenMobilePlayer.tsx`

**Descrição**: Player em tela cheia para mobile.

**Funcionalidades**:
- Capa grande (centralizada)
- Título e artista
- Controles completos
- Barra de progresso
- Botão de fechar

**Animações**:
- Slide up ao abrir
- Slide down ao fechar
- Transição suave (300ms)

**Interações**:
- Swipe down: fecha o player
- Drag na barra de progresso: navega na música

---

### Componentes UI Reutilizáveis

#### 7. **Button**
**Arquivo**: `/src/app/components/ui/Button.tsx`

**Descrição**: Botão customizado com variantes.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

**Variantes**:
- **primary**: Gradiente vermelho (brand)
- **outline**: Borda vermelha, fundo transparente
- **ghost**: Sem borda, hover com background

**Uso**:
```tsx
<Button variant="primary" onClick={handleSave}>
  Salvar
</Button>
```

---

#### 8. **MusicCard**
**Arquivo**: `/src/app/components/ui/MusicCard.tsx`

**Descrição**: Card de música com capa, título, artista e controles.

**Props**:
```typescript
interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  isFavorite?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
}
```

**Funcionalidades**:
- Hover: mostra overlay com botão play
- Botão de favoritar (canto superior direito)
- Click no card: toca a música
- Animação de playing bars quando tocando

**Estados**:
- Normal
- Hover (overlay + play button)
- Playing (animação de barras)

---

#### 9. **TrackRow**
**Arquivo**: `/src/app/components/ui/TrackRow.tsx`

**Descrição**: Linha de música para listas (playlists, favoritos).

**Props**:
```typescript
interface TrackRowProps {
  index: number;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  image: string;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
  onRemove?: () => void;
}
```

**Layout**:
```
┌──────┬──────────────────────────────────────┬──────────┬─────────┐
│ #/▶️ │ [Capa] Título - Artista              │ Álbum    │ 3:45    │
│      │                                       │          │ ❤️ ⋮    │
└──────┴──────────────────────────────────────┴──────────┴─────────┘
```

**Interações**:
- Hover: linha destaca, mostra menu (⋮)
- Click no número: toca música
- Click no coração: favorita/desfavorita
- Click no menu: abre opções (adicionar à playlist, remover)

---

#### 10. **FavoriteButton**
**Arquivo**: `/src/app/components/ui/FavoriteButton.tsx`

**Descrição**: Botão de favoritar com animação.

**Props**:
```typescript
interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

**Animação**:
- Click: escala (scale 1.2) + rotação
- Transição de cor: cinza → vermelho (favorito)

---

#### 11. **CategoryChip**
**Arquivo**: `/src/app/components/ui/CategoryChip.tsx`

**Descrição**: Chip de categoria/tag clicável.

**Props**:
```typescript
interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}
```

**Estados**:
- Inativo: borda cinza, texto cinza
- Ativo: fundo gradiente brand, texto branco

**Uso**: Filtros de gênero, moods, tags.

---

#### 12. **SearchInput**
**Arquivo**: `/src/app/components/ui/SearchInput.tsx`

**Descrição**: Input de busca com ícone.

**Props**:
```typescript
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}
```

**Funcionalidades**:
- Ícone de lupa à esquerda
- Clear button quando tem texto
- Enter para buscar

---

### Componentes de Modal

#### 13. **CreatePlaylistModal**
**Arquivo**: `/src/app/components/CreatePlaylistModal.tsx`

**Descrição**: Modal para criar/editar playlists.

**Props**:
```typescript
interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlaylistData) => void;
  initialData?: PlaylistData;
}
```

**Campos**:
- Upload de capa (com preview)
- Nome da playlist
- Descrição
- Botões: Cancelar, Salvar

**Validação**:
- Nome obrigatório
- Imagem opcional

**Animações**:
- Fade in do overlay
- Slide up do modal
- Transição suave ao fechar

---

## Páginas

### 1. **AuthPage**
**Arquivo**: `/src/app/components/AuthPage.tsx`

**Descrição**: Sistema completo de autenticação.

**Layouts**:
- **Desktop**: Split screen (60% imagem DJ | 40% formulário)
- **Mobile**: Formulário centralizado com logo no topo

**Fluxos**:

#### 1.1 Login
- Email + Senha
- Botão "Esqueceu a senha?"
- Botão Google
- Link "Não tem conta? Cadastre-se"

#### 1.2 Cadastro
- Nome + Email + Senha
- Botão "Cadastrar"
- Botão Google
- Link "Já tem conta? Fazer login"

#### 1.3 Recuperação de Senha
**Step 1**: Solicitar email
**Step 2**: Confirmação (email enviado)
**Step 3**: Redefinir senha (nova senha + confirmar)

**Animações**:
- Transição entre views (fade + slide)
- Duração: 250ms
- Easing: ease-in-out

**Estados**:
```typescript
type AuthView = 
  | "login" 
  | "register" 
  | "forgot-request" 
  | "forgot-success" 
  | "forgot-reset";
```

---

### 2. **HomePage**
**Arquivo**: `/src/app/components/HomePage.tsx`

**Descrição**: Página inicial com descoberta personalizada.

**Seções**:

#### 2.1 Hero Section
- Título: "Bem-vindo ao Mars Sound AI"
- Subtítulo: "Descubra músicas geradas por IA"
- Busca rápida

#### 2.2 Em Alta
- Carrossel horizontal de músicas
- 10-20 músicas trending

#### 2.3 Novos Lançamentos
- Carrossel de músicas recentes
- Ordenado por data de upload

#### 2.4 Recomendados para Você
- Baseado em preferências do usuário
- Gêneros favoritos

#### 2.5 Categorias
- Grid de categorias populares
- Click na categoria: filtra descoberta

**Componentes Usados**:
- MusicCarousel
- MusicCard
- CategoryChip

---

### 3. **DiscoverPage**
**Arquivo**: `/src/app/components/DiscoverPage.tsx`

**Descrição**: Página de descoberta avançada com filtros.

**Layout**:
```
┌─────────────────────────────────────────┐
│ Descobrir                               │
│ [Busca Global]                          │
├─────────────────────────────────────────┤
│ Filtros:                                │
│ [Gospel] [Pop] [Rock] [Jazz] ...        │
│                                         │
│ Moods:                                  │
│ [Calmo] [Energético] [Romântico] ...   │
├─────────────────────────────────────────┤
│ Resultados (Grid de Cards)              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ 🎵 │ │ 🎵 │ │ 🎵 │ │ 🎵 │           │
│ └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

**Funcionalidades**:
- Filtro por gênero (múltipla seleção)
- Filtro por mood (múltipla seleção)
- Busca por texto
- Grid responsivo de resultados
- Infinite scroll (futuro)

**Estado Local**:
```typescript
const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
const [searchQuery, setSearchQuery] = useState("");
```

---

### 4. **PlaylistsPage**
**Arquivo**: `/src/app/components/PlaylistsPage.tsx`

**Descrição**: Gerenciamento de playlists do usuário.

**Layout**:
```
┌─────────────────────────────────────────┐
│ Minhas Playlists                        │
│ [+ Criar Nova Playlist]                 │
├─────────────────────────────────────────┤
│ ┌────────┐  ┌────────┐  ┌────────┐    │
│ │ [Capa] │  │ [Capa] │  │ [Capa] │    │
│ │ Nome   │  │ Nome   │  │ Nome   │    │
│ │ X songs│  │ X songs│  │ X songs│    │
│ └────────┘  └────────┘  └────────┘    │
└─────────────────────────────────────────┘
```

**Funcionalidades**:
- Listar todas as playlists
- Criar nova playlist (abre modal)
- Click em playlist: navega para detalhe
- Editar playlist (menu contextual)
- Excluir playlist (com confirmação)

**Props**:
```typescript
interface PlaylistsPageProps {
  onPlaylistClick: (playlist: Playlist) => void;
}
```

**Tipo Playlist**:
```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: Track[];
  createdAt: Date;
}
```

---

### 5. **PlaylistDetailPage**
**Arquivo**: `/src/app/components/PlaylistDetailPage.tsx`

**Descrição**: Detalhes de uma playlist com lista de músicas.

**Layout**:
```
┌─────────────────────────────────────────┐
│ [← Voltar]                              │
├─────────────────────────────────────────┤
│ ┌──────┐                                │
│ │      │  Nome da Playlist              │
│ │ Capa │  Descrição                     │
│ │      │  X músicas · XX min            │
│ └──────┘  [▶️ Tocar] [❤️] [⋮]          │
├─────────────────────────────────────────┤
│ Lista de Músicas:                       │
│ 1. [Capa] Título - Artista    3:45 ❤️  │
│ 2. [Capa] Título - Artista    4:12 ❤️  │
│ 3. [Capa] Título - Artista    2:58 ❤️  │
└─────────────────────────────────────────┘
```

**Funcionalidades**:
- Tocar toda a playlist
- Tocar música individual (click na linha)
- Adicionar/remover músicas
- Editar playlist (nome, descrição, capa)
- Excluir playlist
- Compartilhar playlist (futuro)

**Props**:
```typescript
interface PlaylistDetailPageProps {
  playlist: Playlist | null;
  onBack: () => void;
}
```

**Componentes**:
- Header com capa e metadados
- Lista de TrackRow
- Botão de ação (play all, favorite, menu)

---

### 6. **FavoritesPage**
**Arquivo**: `/src/app/components/FavoritesPage.tsx`

**Descrição**: Lista de músicas favoritas do usuário.

**Layout**:
```
┌─────────────────────────────────────────┐
│ Músicas Favoritas                       │
│ X músicas · XX min                      │
│ [▶️ Tocar Todas]                        │
├─────────────────────────────────────────┤
│ 1. [Capa] Título - Artista    3:45 ❤️  │
│ 2. [Capa] Título - Artista    4:12 ❤️  │
│ 3. [Capa] Título - Artista    2:58 ❤️  │
└─────────────────────────────────────────┘
```

**Funcionalidades**:
- Listar todas as favoritas
- Tocar música (click na linha)
- Remover dos favoritos
- Adicionar à playlist
- Tocar todas
- Ordenar (data adicionada, alfabética, artista)

**Estado**:
```typescript
const [favorites, setFavorites] = useState<Track[]>([]);
const [sortBy, setSortBy] = useState<'date' | 'title' | 'artist'>('date');
```

---

### 7. **ProfilePage**
**Arquivo**: `/src/app/components/ProfilePage.tsx`

**Descrição**: Perfil do usuário (próprio ou público).

**Props**:
```typescript
interface ProfilePageProps {
  isPublic: boolean;
  onEditProfile?: () => void;
}
```

**Layout (Perfil Privado)**:
```
┌─────────────────────────────────────────┐
│ ┌──────┐  Nome do Usuário               │
│ │      │  @username                     │
│ │ Foto │  Bio do usuário...             │
│ │      │  [⚙️ Editar Perfil]            │
│ └──────┘                                 │
├─────────────────────────────────────────┤
│ Estatísticas:                           │
│ 🎵 45 Músicas  👥 1.2k Seguidores       │
│ 👤 345 Seguindo  ▶️ 12.5k Plays         │
├─────────────────────────────────────────┤
│ Minhas Músicas:                         │
│ ┌────┐ ┌────┐ ┌────┐                   │
│ │ 🎵 │ │ 🎵 │ │ 🎵 │                   │
│ └────┘ └────┘ └────┘                   │
└─────────────────────────────────────────┘
```

**Layout (Perfil Público)**:
- Similar, mas sem botão de editar
- Botão "Seguir/Deixar de seguir"
- Não mostra informações privadas

**Seções**:
1. Header (foto, nome, bio, stats)
2. Tabs: Músicas | Playlists | Favoritos
3. Grid de conteúdo

---

### 8. **SettingsPage**
**Arquivo**: `/src/app/components/SettingsPage.tsx`

**Descrição**: Configurações da conta e preferências.

**Props**:
```typescript
interface SettingsPageProps {
  onLogout?: () => void;
}
```

**Tabs**:

#### Tab 1: Perfil
**Seções**:
- **Informações do Perfil**
  - Upload de foto de perfil
  - Nome completo
  - Username
  - Bio (textarea)
  - Toggle "Perfil Público"
  - Botão "Salvar Alterações"

- **Preferências Musicais**
  - Gêneros favoritos (múltipla seleção)
  - Moods favoritos (múltipla seleção)
  - Botão "Salvar Alterações"

#### Tab 2: Conta
**Seções**:
- **Informações da Conta**
  - Email
  - Senha atual
  - Nova senha
  - Confirmar nova senha
  - Botão "Salvar Alterações"

- **Sair da Conta ou Excluir**
  - **Sair**: Encerra sessão
    - Descrição
    - Botão "Sair da Conta" (funcional)
  - **Excluir Conta**: Permanente
    - Descrição de aviso
    - Botão "Excluir Conta"
    - Modal de confirmação

**Componentes**:
- Switch (toggle)
- CategoryChip (gêneros/moods)
- Button (save, logout, delete)
- Modal de confirmação

---

### 9. **UploadMusicPage**
**Arquivo**: `/src/app/components/UploadMusicPage.tsx`

**Descrição**: Formulário de upload de música gerada por IA.

**Props**:
```typescript
interface UploadMusicPageProps {
  onCancel: () => void;
}
```

**Layout**:
```
┌─────────────────────────────────────────┐
│ Carregar Música AI                      │
│ [← Cancelar]                            │
├─────────────────────────────────────────┤
│ 1. Upload do Arquivo                    │
│ ┌───────────────────────────────────┐   │
│ │ 🎵 Arraste ou clique para upload  │   │
│ │    MP3, WAV (max 20MB)            │   │
│ └───────────────────────────────────┘   │
│                                         │
│ 2. Informações da Música                │
│ Título: [________________]              │
│ Artista: [_______________]              │
│ Álbum: [_________________]              │
│                                         │
│ 3. Categorização                        │
│ Gênero: [Dropdown]                      │
│ Mood: [Calmo] [Energético] ...          │
│ Tags: [________________]                │
│                                         │
│ 4. Capa da Música                       │
│ ┌──────┐                                │
│ │Upload│                                │
│ └──────┘                                │
│                                         │
│ 5. Descrição (Opcional)                 │
│ [________________________]              │
│ [________________________]              │
│                                         │
│ [Cancelar]  [Publicar]                  │
└─────────────────────────────────────────┘
```

**Funcionalidades**:
- Upload de arquivo de áudio (drag & drop)
- Validação de tipo e tamanho
- Preview de áudio antes de publicar
- Upload de capa (opcional)
- Campos de metadados
- Seleção de gênero e mood
- Tags (separadas por vírgula)
- Botão "Publicar" (valida e envia)

**Validação**:
- Título obrigatório
- Arquivo de áudio obrigatório
- Gênero obrigatório
- Outros campos opcionais

**Estado**:
```typescript
const [audioFile, setAudioFile] = useState<File | null>(null);
const [coverFile, setCoverFile] = useState<File | null>(null);
const [title, setTitle] = useState("");
const [artist, setArtist] = useState("");
const [album, setAlbum] = useState("");
const [genre, setGenre] = useState("");
const [moods, setMoods] = useState<Set<string>>(new Set());
const [tags, setTags] = useState("");
const [description, setDescription] = useState("");
```

---

## Context & State Management

### MusicContext
**Arquivo**: `/src/app/context/MusicContext.tsx`

**Descrição**: Gerenciamento global do estado do player de música.

**Estado Global**:
```typescript
interface MusicContextType {
  currentTrack: Track | null;        // Música atual
  isPlaying: boolean;                // Está tocando?
  progress: number;                  // Progresso (0-100%)
  volume: number;                    // Volume (0-100)
  isMuted: boolean;                  // Está mutado?
  isFavorite: boolean;               // Música atual é favorita?
  isFullscreenOpen: boolean;         // Player fullscreen aberto? (mobile)
  
  // Ações
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: () => void;
  playNext: () => void;
  playPrevious: () => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
  
  audioRef: React.RefObject<HTMLAudioElement>;
}
```

**Uso**:
```tsx
import { useMusicPlayer } from "./context/MusicContext";

function MyComponent() {
  const { currentTrack, isPlaying, togglePlay } = useMusicPlayer();
  
  return (
    <div>
      <h3>{currentTrack?.title}</h3>
      <button onClick={togglePlay}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
```

**Funcionalidades**:
1. **playTrack**: Toca uma nova música
   - Define currentTrack
   - Carrega audioUrl no elemento <audio>
   - Inicia reprodução
   - Reset do progresso

2. **togglePlay**: Pausa/Resume
   - Se tocando: pausa
   - Se pausado: resume

3. **setProgress**: Navega na música
   - Recebe progresso (0-100%)
   - Calcula tempo correspondente
   - Atualiza audio.currentTime

4. **setVolume**: Ajusta volume
   - Recebe volume (0-100)
   - Aplica em audioRef

5. **toggleMute**: Muta/Desmuta
   - Alterna isMuted
   - Aplica volume 0 ou restaura

6. **toggleFavorite**: Adiciona/Remove dos favoritos
   - Alterna isFavorite
   - TODO: Sincronizar com backend

7. **playNext/playPrevious**: Navegação na fila
   - TODO: Implementar lógica de playlist

8. **openFullscreen/closeFullscreen**: Controle do player mobile
   - Alterna isFullscreenOpen

**Event Listeners**:
- `timeupdate`: Atualiza progresso continuamente
- `ended`: Reset quando música termina
- `error`: Trata erros de carregamento

---

## Animações e Transições

### 1. Transições de Página
**Biblioteca**: Motion (Framer Motion)

**Configuração**:
```tsx
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

<AnimatePresence mode="wait">
  <motion.div
    key="page-key"
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    <PageContent />
  </motion.div>
</AnimatePresence>
```

**Características**:
- Fade + Slide horizontal
- Duração: 300ms
- Easing: ease-in-out
- Aguarda saída antes de entrar (mode="wait")

---

### 2. Autenticação (AuthPage)
**Transições entre views**:
```tsx
const formVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// Duração: 250ms
```

**Fluxo**:
- Login → Cadastro: Fade + Slide vertical
- Login → Recuperar Senha: Fade + Slide vertical
- Recuperar → Confirmação → Reset: Fade + Slide vertical

---

### 3. Modal (CreatePlaylistModal)
**Animações**:
```tsx
// Overlay
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }

// Modal
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: 20 }
```

**Duração**: 200ms

---

### 4. Player Fullscreen (Mobile)
**Animações**:
```tsx
// Slide up ao abrir
initial: { y: "100%" }
animate: { y: 0 }
exit: { y: "100%" }

// Duração: 300ms
// Easing: ease-in-out
```

**Interações**:
- Swipe down: fecha com animação suave
- Backdrop click: fecha

---

### 5. Sidebar Mobile
**Animações**:
```tsx
// Slide in da esquerda
initial: { x: "-100%" }
animate: { x: 0 }
exit: { x: "-100%" }

// Backdrop
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }
```

---

### 6. Hover States
**Componentes com hover**:
- MusicCard: Overlay aparece com fade (150ms)
- TrackRow: Background destaca (100ms)
- Buttons: Opacity 0.9 ou background change (150ms)
- Avatar: Border color muda para brand (150ms)

**Padrão**:
```tsx
transition: all 0.15s ease-in-out;

// ou

style={{ transition: "opacity 0.15s" }}
onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
```

---

### 7. Playing Animation
**Barras de áudio animadas**:
```css
@keyframes barBounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.4); }
}

.bar {
  animation: barBounce 0.8s infinite ease-in-out;
}

.bar:nth-child(2) {
  animation-delay: 0.2s;
}

.bar:nth-child(3) {
  animation-delay: 0.4s;
}
```

**Uso**: MusicCard quando música está tocando

---

### 8. Favorite Animation
**Animação ao favoritar**:
```tsx
<motion.div
  animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
  transition={{ duration: 0.3 }}
>
  <Heart fill={isFavorite ? "red" : "none"} />
</motion.div>
```

---

## Interações do Usuário

### 1. Reprodução de Música

**Cenários**:

#### a) Click em MusicCard
```typescript
const handleCardClick = () => {
  playTrack({
    id: music.id,
    title: music.title,
    artist: music.artist,
    image: music.image,
    audioUrl: music.audioUrl,
    duration: music.duration
  });
};
```

#### b) Click em TrackRow (lista)
```typescript
const handleRowClick = () => {
  playTrack(track);
};
```

#### c) Play All (Playlist/Favoritos)
```typescript
const handlePlayAll = () => {
  if (tracks.length > 0) {
    playTrack(tracks[0]);
    // TODO: Adicionar resto à fila
  }
};
```

**Feedback Visual**:
- Botão play muda para pause
- Barra de progresso começa a se mover
- Playing bars aparecem no card
- Mini-player/Player aparece no rodapé

---

### 2. Favoritar Música

**Fluxo**:
1. Usuário click no botão de coração
2. Animação de scale + rotação
3. Cor muda (cinza → vermelho)
4. Estado persiste no Context
5. Música aparece na página de Favoritos

**Implementação**:
```typescript
const handleFavorite = (trackId: string) => {
  // Adiciona/remove do estado local
  setFavorites(prev => 
    prev.includes(trackId)
      ? prev.filter(id => id !== trackId)
      : [...prev, trackId]
  );
  
  // TODO: Sincronizar com backend
};
```

---

### 3. Criar Playlist

**Fluxo**:
1. Click em "Criar Nova Playlist"
2. Modal abre com animação
3. Usuário preenche:
   - Nome (obrigatório)
   - Descrição (opcional)
   - Capa (opcional, upload)
4. Click em "Salvar"
5. Validação
6. Playlist criada
7. Modal fecha
8. Playlist aparece na lista

**Validação**:
```typescript
const validatePlaylist = (data: PlaylistData) => {
  if (!data.name.trim()) {
    setError("Nome da playlist é obrigatório");
    return false;
  }
  return true;
};
```

---

### 4. Adicionar Música à Playlist

**Fluxo**:
1. Usuário hover em TrackRow
2. Menu (⋮) aparece
3. Click no menu
4. Dropdown com opções:
   - "Adicionar à Playlist" → Lista de playlists
   - "Remover dos Favoritos" (se favorito)
   - "Compartilhar" (futuro)
5. Seleciona playlist
6. Música adicionada
7. Toast de confirmação (futuro)

---

### 5. Upload de Música

**Fluxo**:
1. Navega para "Carregar Música AI"
2. Drag & drop ou click para upload
3. Arquivo validado (tipo, tamanho)
4. Preenche metadados
5. Upload de capa (opcional)
6. Seleciona gênero e moods
7. Adiciona tags
8. Preview de áudio (play button)
9. Click em "Publicar"
10. Validação
11. Upload para backend
12. Progress bar
13. Sucesso: redireciona para HomePage
14. Toast de confirmação

**Validação**:
```typescript
const validate = () => {
  if (!audioFile) return "Arquivo de áudio obrigatório";
  if (!title.trim()) return "Título obrigatório";
  if (!genre) return "Gênero obrigatório";
  if (audioFile.size > 20 * 1024 * 1024) {
    return "Arquivo muito grande (máx 20MB)";
  }
  return null;
};
```

---

### 6. Editar Perfil

**Fluxo**:
1. Navega para "Configurações"
2. Tab "Perfil"
3. Seção "Informações do Perfil"
4. Upload de foto (click na foto atual)
5. Edita nome, username, bio
6. Toggle "Perfil Público"
7. Seção "Preferências Musicais"
8. Seleciona gêneros favoritos (múltiplos)
9. Seleciona moods favoritos (múltiplos)
10. Click em "Salvar Alterações"
11. Validação
12. Salva no backend
13. Feedback de sucesso

---

### 7. Alterar Senha

**Fluxo**:
1. Navega para "Configurações"
2. Tab "Conta"
3. Seção "Informações da Conta"
4. Preenche:
   - Senha atual
   - Nova senha
   - Confirmar nova senha
5. Click em "Salvar Alterações"
6. Validação:
   - Senha atual correta?
   - Nova senha válida? (mín 6 caracteres)
   - Senhas coincidem?
7. Salva no backend
8. Feedback de sucesso

---

### 8. Logout

**Fluxo**:
1. Navega para "Configurações"
2. Tab "Conta"
3. Seção "Sair da Conta ou Excluir"
4. Click em "Sair da Conta"
5. Limpa token de autenticação
6. Limpa estado global
7. Redireciona para AuthPage (Login)

**Implementação**:
```typescript
const handleLogout = () => {
  // Limpa token
  localStorage.removeItem("authToken");
  
  // Reset estado de autenticação
  setIsAuthenticated(false);
  
  // Context reseta automaticamente
};
```

---

### 9. Excluir Conta

**Fluxo**:
1. Click em "Excluir Conta"
2. Modal de confirmação abre
3. Aviso: "Esta ação é irreversível..."
4. Botões: "Cancelar" | "Confirmar Exclusão"
5. Se confirmar:
   - Requisição ao backend
   - Deleta conta permanentemente
   - Limpa dados locais
   - Redireciona para AuthPage
6. Se cancelar:
   - Modal fecha
   - Nada acontece

---

### 10. Busca

**Fluxo**:
1. Usuário digita na busca (Navbar)
2. Debounce de 300ms
3. Requisição ao backend (futuro)
4. Resultados aparecem em dropdown ou redireciona para DiscoverPage
5. Click em resultado: navega para detalhe ou toca música

**Implementação (futuro)**:
```typescript
const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

---

## Responsividade

### Breakpoints

```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

**Tailwind Classes**:
- `sm:` → 640px
- `md:` → 768px
- `lg:` → 1024px
- `xl:` → 1280px

---

### Componentes Responsivos

#### 1. Navbar
- **Mobile**: Hambúrguer + Busca compacta + Avatar
- **Desktop**: Busca expandida + Botão Upload + Avatar

#### 2. Sidebar
- **Mobile**: Drawer (overlay)
- **Desktop**: Fixa à esquerda (190px)

#### 3. Player
- **Mobile**: MiniPlayer (rodapé) + FullScreenPlayer (expandível)
- **Desktop**: MusicPlayer completo (rodapé, 72px altura)

#### 4. BottomNav
- **Mobile**: Visível (fixo no rodapé)
- **Desktop**: Oculto (display: none)

#### 5. Layout de Cards/Grid
- **Mobile**: 2 colunas (MusicCard)
- **Tablet**: 3 colunas
- **Desktop**: 4-6 colunas (depende do container)

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
  {/* Cards */}
</div>
```

#### 6. TrackRow
- **Mobile**: Compacto (sem coluna de álbum)
- **Desktop**: Completo (todas as colunas)

#### 7. AuthPage
- **Mobile**: Formulário centralizado
- **Desktop**: Split screen (60% imagem | 40% form)

#### 8. SettingsPage
- **Mobile**: Stack vertical
- **Desktop**: Side by side (foto + campos)

---

### Touch Interactions (Mobile)

1. **Swipe Down**: Fecha FullScreenMobilePlayer
2. **Swipe Right**: Abre sidebar (futuro)
3. **Long Press**: Menu contextual (futuro)
4. **Pinch to Zoom**: Imagem de capa (futuro)

---

### Considerações de Performance

1. **Lazy Loading**: Imagens carregadas sob demanda
2. **Virtual Scrolling**: Listas longas (futuro)
3. **Code Splitting**: Páginas carregadas por rota
4. **Debounce**: Busca e inputs
5. **Throttle**: Scroll events

---

## Fluxos de Navegação

### Fluxo 1: Usuário Novo (Cadastro)

```
[Landing] → [Cadastro] → [Preencher dados] → [Cadastrar]
    ↓
[HomePage] → [Explorar conteúdo] → [Configurar preferências]
    ↓
[DiscoverPage] → [Tocar primeira música]
    ↓
[Player ativo] → [Adicionar favoritos] → [Criar playlist]
```

---

### Fluxo 2: Usuário Recorrente

```
[Login] → [HomePage]
    ↓
[Ver recomendações] → [Tocar música]
    ↓
[Navegar playlists] → [Gerenciar músicas]
    ↓
[Upload nova música] → [Compartilhar]
```

---

### Fluxo 3: Descoberta de Música

```
[HomePage] → [DiscoverPage]
    ↓
[Filtrar por gênero/mood]
    ↓
[Ver resultados (Grid de MusicCard)]
    ↓
[Hover em Card] → [Click em Play]
    ↓
[Música toca no Player]
    ↓
[Opções]:
  - Favoritar
  - Adicionar à playlist
  - Ver perfil do artista
  - Compartilhar
```

---

### Fluxo 4: Criação de Playlist

```
[PlaylistsPage] → [+ Criar Nova Playlist]
    ↓
[Modal abre] → [Preencher nome/descrição]
    ↓
[Upload capa (opcional)]
    ↓
[Salvar] → [Playlist criada]
    ↓
[Click na playlist] → [PlaylistDetailPage]
    ↓
[Adicionar músicas]:
  - Via busca
  - Via menu contextual em TrackRow
  - Via drag & drop (futuro)
```

---

### Fluxo 5: Upload de Música

```
[Navbar/Sidebar] → [Carregar Música AI]
    ↓
[UploadMusicPage]
    ↓
[Upload arquivo áudio] → [Preencher metadados]
    ↓
[Upload capa] → [Selecionar gênero/mood]
    ↓
[Preview de áudio] → [Publicar]
    ↓
[Upload em progresso...]
    ↓
[Sucesso] → [Redireciona para HomePage ou Perfil]
    ↓
[Música aparece em "Novos Lançamentos"]
```

---

### Fluxo 6: Edição de Perfil

```
[Click no Avatar] → [SettingsPage]
    ↓
[Tab "Perfil"]
    ↓
[Editar informações]:
  - Upload foto
  - Nome/Username/Bio
  - Toggle perfil público
    ↓
[Preferências Musicais]:
  - Selecionar gêneros
  - Selecionar moods
    ↓
[Salvar Alterações]
    ↓
[Feedback de sucesso]
    ↓
[Voltar ao perfil]
```

---

### Fluxo 7: Recuperação de Senha

```
[Login] → [Esqueceu a senha?]
    ↓
[Recuperar Senha] → [Digitar email]
    ↓
[Enviar link] → [Confirmação]
    ↓
[Verificar email]
    ↓
[Click no link do email] → [Redefinir Senha]
    ↓
[Digitar nova senha] → [Confirmar senha]
    ↓
[Salvar e Entrar]
    ↓
[Login automático] → [HomePage]
```

---

### Fluxo 8: Logout

```
[Qualquer página] → [Click no Avatar]
    ↓
[SettingsPage] → [Tab "Conta"]
    ↓
[Sair da Conta] → [Click]
    ↓
[Logout executado]
    ↓
[Redireciona para AuthPage (Login)]
```

---

## Estrutura de Dados

### Track
```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  duration?: number | string;
  album?: string;
  genre?: string;
  mood?: string[];
  tags?: string[];
  uploadedBy?: string;       // User ID
  plays?: number;
  likes?: number;
  createdAt?: Date;
}
```

### Playlist
```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: Track[];
  createdBy: string;         // User ID
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  isPublic: boolean;
  favoriteGenres: string[];
  favoriteMoods: string[];
  
  // Stats
  totalTracks: number;
  totalPlays: number;
  followers: number;
  following: number;
  
  // Relations
  tracks: Track[];
  playlists: Playlist[];
  favorites: Track[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Backend Supabase (PostgreSQL)

O projeto **mars-sound-ai** (`ftezgnflagqhokwbkonw`) está provisionado com schema alinhado a [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md):

- **Auth:** `public.users.id` referencia `auth.users.id` (UUID); trigger `handle_new_user` cria o perfil ao registar.
- **Dados:** tabelas `tracks`, `playlists`, `playlist_tracks`, `favorites`, `likes`, `follows`, `comments`, `play_history`, `notifications`, `reports`, `audit_logs`, `track_tags`, lookups `genres` e `tags` (com seed mínimo de géneros/tags).
- **RLS** ativo; `audit_logs` sem acesso para clientes (apenas `service_role` / bypass).
- **Storage:** buckets `audio-tracks`, `track-covers`, `user-avatars`, `playlist-covers`, `waveforms`; uploads devem usar o prefixo `{user_id}/` no path.
- **Funções RPC expostas:** `search_tracks`, `get_recommendations`, `get_top_tracks_this_week`, `increment_play_count` (ver grants no SQL).

**Frontend:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (nunca `service_role` no cliente).

**Documentação operacional, lista de migrações, seed opcional e tipos TypeScript:** ver [supabase/README.md](supabase/README.md), [supabase/seed_demo.sql](supabase/seed_demo.sql) e ficheiros em `supabase/migrations/`.

---

## Conclusão

Este documento detalha a arquitetura completa do **Mars Sound AI**, incluindo todos os componentes, páginas, interações, animações e fluxos de navegação. O sistema foi projetado com foco em:

1. **User Experience**: Interface intuitiva, responsiva e acessível
2. **Performance**: Animações suaves, carregamento otimizado
3. **Escalabilidade**: Arquitetura modular e reutilizável
4. **Maintainability**: Código organizado, documentado e testável

### Próximos Passos

1. **Integração com Backend**: API REST ou GraphQL
2. **Autenticação Real**: JWT, OAuth, persistência
3. **Upload Real**: AWS S3, Cloud Storage
4. **Testes**: Unit tests, Integration tests, E2E
5. **Analytics**: Tracking de eventos, métricas
6. **SEO**: Meta tags dinâmicas, SSR
7. **PWA**: Service workers, offline mode
8. **Monetização**: Planos premium, ads

---

**Versão**: 1.0.0  
**Data**: 26 de Março de 2026  
**Autor**: Equipe Mars Sound AI
