/** Payload do formulário de upload de faixa. */
export interface UploadTrackPayload {
  title: string;
  /** Nome do álbum (opcional); em envios seguintes pode reutilizar um existente ou criar novo na UI. */
  album?: string | null;
  category?: string;
  coverPreviewUrl?: string | null;
  audioFile?: File | null;
  coverFile?: File | null;
  tags?: string[];
  aiGenerator?: string;
  prompt?: string;
}
