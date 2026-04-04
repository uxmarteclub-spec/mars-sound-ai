/** Payload do formulário de upload de faixa. */
export interface UploadTrackPayload {
  title: string;
  category?: string;
  coverPreviewUrl?: string | null;
  audioFile?: File | null;
  coverFile?: File | null;
  tags?: string[];
  aiGenerator?: string;
  prompt?: string;
}
