import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/svg-upld88zslp";

const COVER_MAX_BYTES = 2 * 1024 * 1024;

export interface PlaylistData {
  name: string;
  description: string;
  isPublic: boolean;
  /** URL existente (edição) quando não há ficheiro novo */
  coverImage?: string;
  /** Ficheiro local escolhido pelo utilizador (criação ou nova capa) */
  coverFile?: File | null;
}

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: PlaylistData) => void;
  /** If provided, the modal opens in edit mode pre-filled with these values */
  initialData?: PlaylistData;
  mode?: "create" | "edit";
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate, initialData, mode = "create" }: CreatePlaylistModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  /** URL remota (servidor) para manter na edição quando não há ficheiro novo */
  const [remoteCoverUrl, setRemoteCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [coverError, setCoverError] = useState("");

  const revokePreview = () => {
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  // Sync with initialData when opening in edit mode
  useEffect(() => {
    if (!isOpen) return;
    setCoverError("");
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (initialData) {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setIsPublic(initialData.isPublic ?? true);
      setRemoteCoverUrl(initialData.coverImage?.trim() ?? "");
      setCoverFile(null);
    } else if (mode === "create") {
      setName("");
      setDescription("");
      setIsPublic(true);
      setRemoteCoverUrl("");
      setCoverFile(null);
    }
  }, [isOpen, initialData, mode]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const displayCoverSrc =
    previewObjectUrl ||
    (remoteCoverUrl.startsWith("http") ? remoteCoverUrl : "");

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverError("Escolha um ficheiro de imagem (JPG, PNG, etc.).");
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setCoverError("A imagem deve ter no máximo 2 MB.");
      return;
    }
    setCoverError("");
    setCoverFile(file);
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description,
      isPublic,
      coverImage: remoteCoverUrl || undefined,
      coverFile: coverFile ?? undefined,
    });
    if (!isEdit) {
      setName("");
      setDescription("");
      setIsPublic(true);
      setRemoteCoverUrl("");
      setCoverFile(null);
      revokePreview();
      setCoverError("");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#24191b] border border-[#30292b] p-6 w-full max-w-[687px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[24px] text-[#ebe9e9] leading-[1.5]">
            {isEdit ? "Editar playlist" : "Criar playlist"}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d={svgPaths.p2b31e200} fill="#ebe9e9" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#766c6e] mb-6" />

        {/* Form */}
        <div className="space-y-6">
          {/* Cover image and inputs row */}
          <div className="flex gap-6">
            {/* Cover upload */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                aria-label="Carregar imagem de capa da playlist"
                onChange={handleCoverFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-[137px] h-[137px] border border-[#30292b] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#ff164c] transition-colors overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff164c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24191b]"
              >
                {displayCoverSrc ? (
                  <img
                    src={displayCoverSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d={svgPaths.p10ab0370} fill="#ebe9e9" />
                      <path d={svgPaths.p17084a00} fill="#ebe9e9" />
                    </svg>
                    <p className="font-semibold text-[16px] text-[#f8f8f8] leading-[1.5]">
                      Capa
                    </p>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#bababa] leading-snug max-w-[137px]">
                JPG, PNG, WebP ou GIF até 2 MB.
              </p>
              {coverError ? (
                <p className="text-[11px] text-[#ff6387] leading-snug max-w-[137px]" role="alert">
                  {coverError}
                </p>
              ) : null}
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-6">
              {/* Name input */}
              <div className="border border-[#30292b] hover:border-[#ff164c]/50 transition-colors">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da playlist"
                  className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] placeholder:text-[#f8f8f8]/20 outline-none"
                />
              </div>

              {/* Description textarea */}
              <div className="border border-[#30292b] hover:border-[#ff164c]/50 transition-colors">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da playlist"
                  rows={3}
                  className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] placeholder:text-[#f8f8f8]/20 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer with toggle and buttons */}
          <div className="flex items-center justify-between">
            {/* Public toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-[16px] text-[#f8f8f8] leading-[1.5]">
                  Pública
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublic}
                  onClick={() => setIsPublic(!isPublic)}
                  className="relative w-[34px] h-[14px] rounded-full transition-colors shrink-0"
                  style={{ backgroundColor: isPublic ? "#ff6387" : "#5b4f51" }}
                >
                  <span
                    className="absolute top-[-2px] w-[18px] h-[18px] rounded-full bg-[#ff164c] transition-all duration-200"
                    style={{ left: isPublic ? "16px" : "0px" }}
                  />
                </button>
              </div>
              <p className="text-[12px] text-[#bababa] leading-[1.25] max-w-[280px]">
                {isPublic
                  ? "Outros utilizadores poderão ver e ouvir esta playlist."
                  : "Apenas você vê esta playlist; não aparece para outros utilizadores."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[#ff164c] font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] hover:bg-[#ff164c]/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#ff164c] from-[57.214%] to-[#ea5858] font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isEdit ? "Salvar alterações" : "Criar playlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}