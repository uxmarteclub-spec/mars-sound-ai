/** Faixa no player / listas (UI). */
export interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  duration?: number | string;
  album?: string;
  /** Dono da faixa na base (para ações “de outro criador” na UI). */
  ownerUserId?: string;
}

/** Faixa em listagens com categoria (género) para filtros. */
export type DiscoverTrack = Track & { category: string };

/**
 * Resumo de playlist na UI.
 * Futuro: listagens públicas / pesquisa de playlists (ex.: playlist descoberta + “guardar”).
 */
export interface PlaylistSummary {
  id: string;
  title: string;
  trackCount: number;
  duration: string;
  image: string;
  description?: string;
  isPublic?: boolean;
  /** Dono da playlist (v1: só listamos as do utilizador autenticado). */
  ownerUserId?: string;
}

/** Criador em destaque na home (perfil público). */
export interface HomeCreator {
  id: string;
  name: string;
  handle: string;
  bgImage: string;
  overlayImage?: string;
}
