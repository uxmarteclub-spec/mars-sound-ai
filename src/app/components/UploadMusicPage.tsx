import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-r7seo7qk5p";
import { useLibrary } from "../context/LibraryContext";
import { GenreCategorySelect } from "./ui/GenreCategorySelect";
import { Checkbox } from "./ui/checkbox";
import {
  MUSIC_GENRES_CATALOG,
  mergeGenreNameLists,
} from "../../data/musicGenresCatalog";

const TAG_SUGGESTIONS = ["Ambient", "Gospel", "Relax", "Energético", "Pop", "Rock", "Sad", "Happy", "Dark", "Chill"];

const AI_GENERATORS = ["Suno", "Udio", "Stable Audio", "MusicGen", "AudioCraft", "Outro..."];

const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const MAX_COVER_BYTES = 2 * 1024 * 1024;

function validateAudioFile(file: File): string | null {
  const ext = file.name.toLowerCase();
  const okType =
    file.type === "audio/mpeg" ||
    file.type === "audio/wav" ||
    file.type === "audio/x-wav" ||
    ext.endsWith(".mp3") ||
    ext.endsWith(".wav");
  if (!okType) return "Usa um ficheiro MP3 ou WAV.";
  if (file.size > MAX_AUDIO_BYTES) return "O áudio deve ter no máximo 50 MB.";
  return null;
}

function validateCoverFile(file: File): string | null {
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    return "A capa deve ser PNG ou JPEG.";
  }
  if (file.size > MAX_COVER_BYTES) return "A capa deve ter no máximo 2 MB.";
  return null;
}

interface UploadMusicPageProps {
  onCancel?: () => void;
}

// ── Field error indicator ──
function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p
      id={id}
      className="flex items-center gap-1 text-[12px] leading-[1.25] mt-1"
      style={{ color: "#ff164c" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff164c">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {message}
    </p>
  );
}

export function UploadMusicPage({ onCancel }: UploadMusicPageProps) {
  const {
    appendUploadedTrack,
    discoverCategories,
    createGenre,
    myPublishedTracks,
  } = useLibrary();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Cover upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [albumPick, setAlbumPick] = useState("");
  const [albumNewName, setAlbumNewName] = useState("");
  const [aiGenerator, setAiGenerator] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    audio?: string;
    cover?: string;
    title?: string;
    agreed?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  const uploadGenreOptions = useMemo(
    () =>
      mergeGenreNameLists(
        discoverCategories.filter((c) => c !== "Todos"),
        [...MUSIC_GENRES_CATALOG]
      ),
    [discoverCategories]
  );

  const existingAlbumNames = useMemo(() => {
    const s = new Set<string>();
    for (const t of myPublishedTracks) {
      const a = t.album?.trim();
      if (a) s.add(a);
    }
    return [...s].sort((a, b) => a.localeCompare(b, "pt"));
  }, [myPublishedTracks]);

  const handleCreateGenreUpload = useCallback(
    async (name: string) => {
      try {
        await createGenre(name);
        toast.success(`Categoria “${name}” criada.`);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Não foi possível criar a categoria.";
        toast.error(msg);
        throw e;
      }
    },
    [createGenre]
  );

  // ── Audio upload handlers ──
  const handleAudioFile = (file: File) => {
    const err = validateAudioFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setAudioFile(file);
    if (errors.audio) setErrors((e) => ({ ...e, audio: undefined }));
  };

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateAudioFile(file);
    if (err) {
      toast.error("Formato ou tamanho não suportado. " + err);
      return;
    }
    setAudioFile(file);
    setErrors((er) => ({ ...er, audio: undefined }));
  }, []);

  // ── Cover upload handlers ──
  const handleCoverFile = (file: File) => {
    const err = validateCoverFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setCoverFile(file);
    setErrors((er) => ({ ...er, cover: undefined }));
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateCoverFile(file);
    if (err) {
      toast.error("Formato ou tamanho não suportado. " + err);
      return;
    }
    setCoverFile(file);
    setErrors((er) => ({ ...er, cover: undefined }));
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // ── Tags ──
  const addTag = (tag: string) => {
    const t = tag.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const validate = () => {
    const newErrors: {
      audio?: string;
      cover?: string;
      title?: string;
      agreed?: string;
    } = {};
    if (!audioFile) {
      newErrors.audio = "Carrega um ficheiro de áudio MP3 ou WAV (até 50 MB).";
    } else {
      const aErr = validateAudioFile(audioFile);
      if (aErr) newErrors.audio = aErr;
    }
    if (coverFile) {
      const cErr = validateCoverFile(coverFile);
      if (cErr) newErrors.cover = cErr;
    }
    if (!title.trim()) newErrors.title = "O título da música é obrigatório.";
    if (!agreed) {
      newErrors.agreed = "É necessário aceitar os termos para continuar.";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      let albumValue: string | undefined;
      if (existingAlbumNames.length === 0) {
        albumValue = albumNewName.trim() || undefined;
      } else if (albumPick === "__new__") {
        albumValue = albumNewName.trim() || undefined;
      } else if (albumPick.trim()) {
        albumValue = albumPick;
      } else {
        albumValue = undefined;
      }

      await appendUploadedTrack({
        title: title.trim(),
        album: albumValue ?? null,
        category: category || undefined,
        coverPreviewUrl: coverPreview,
        audioFile,
        coverFile,
        tags,
        aiGenerator: aiGenerator || undefined,
        prompt: prompt || undefined,
      });
      toast.success("Música enviada e publicada. Já aparece em Descobrir.");
      onCancel?.();
    } catch {
      toast.error("Não foi possível concluir o envio. Tente de novo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (field: "audio" | "cover" | "title" | "agreed") =>
    submitted && !!errors[field];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 lg:py-[40px]">
        
        {/* ── Page Title ── */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="font-bold text-[24px] leading-[1.5]" style={{ color: "#ebe9e9" }}>
            Carregue sua música
          </h1>
          <p className="font-semibold text-[16px] leading-[1.5]" style={{ color: "#bfbbbc" }}>
            Compartilhe suas criações de IA com a comunidade
          </p>
        </div>

        <div className="flex flex-col gap-[22px]">

          {/* ── Upload Section ── */}
          <div
            className="relative"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
          >
            <div className="p-6">
              <h2 className="font-bold text-[24px] leading-[1.5] mb-6" style={{ color: "#ebe9e9" }}>
                Faça upload da sua música e capa
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">

                {/* Audio upload zone */}
                <div className="flex-1 flex flex-col">
                  <div
                    className={[
                      "flex-1 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors duration-200",
                      "min-h-[280px]",
                    ].join(" ")}
                    style={{ border: `2.694px solid ${isDraggingAudio ? "#ff164c" : hasError("audio") ? "#ff164c" : "#30292b"}`,
                      background: hasError("audio") ? "rgba(255,22,76,0.04)" : "transparent" }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                    onDragLeave={() => setIsDraggingAudio(false)}
                    onDrop={handleAudioDrop}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mp3,audio/wav,.mp3,.wav"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleAudioFile(e.target.files[0])}
                    />

                    {/* Music icon */}
                    <div className="relative size-[79px] overflow-clip shrink-0">
                      <svg className="absolute block size-full" fill="none" viewBox="0 0 32 32" />
                      <div className="absolute inset-[12.5%_4.17%]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72.4171 59.2504">
                          <path d={svgPaths.p6552b80} fill="#F8F8F8" />
                        </svg>
                      </div>
                    </div>

                    {audioFile ? (
                      <div className="flex flex-col items-center gap-3 w-full px-2">
                        <p
                          className="font-bold text-[18px] text-center break-all max-w-full"
                          style={{ color: "#f8f8f8" }}
                        >
                          {audioFile.name}
                        </p>
                        <p className="text-[12px]" style={{ color: "#bababa" }}>
                          {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        <p className="text-[12px] font-semibold" style={{ color: "#ff164c" }}>
                          Ficheiro selecionado — envia no final do formulário
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-2">
                          <p className="font-bold text-[18px] text-center leading-[1.5]" style={{ color: "#f8f8f8" }}>
                            Carregar áudio
                          </p>
                          <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                            MP3 ou WAV até 50 MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="px-[16px] py-[8px] font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                          style={{
                            background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                            color: "#f8f8f8",
                          }}
                          onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }}
                        >
                          Selecionar ficheiro
                        </button>
                      </>
                    )}
                  </div>
                  {hasError("audio") && <FieldError message={errors.audio!} />}
                </div>

                {/* Cover upload zone */}
                <div className="flex-1 flex flex-col">
                <div
                  className={[
                    "flex-1 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors duration-200",
                    "min-h-[280px]",
                  ].join(" ")}
                  style={{
                    border: `2.694px solid ${
                      isDraggingCover ? "#ff164c" : hasError("cover") ? "#ff164c" : "#30292b"
                    }`,
                    background: hasError("cover") ? "rgba(255,22,76,0.04)" : "transparent",
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverFile(e.target.files[0])}
                  />

                  {coverPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative size-[120px] overflow-hidden" style={{ border: "1px solid #30292b" }}>
                        <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        className="px-[16px] py-[8px] font-semibold text-[14px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                        style={{
                          background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                          color: "#f8f8f8",
                        }}
                        onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                      >
                        Alterar capa
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Picture icon */}
                      <div className="relative size-[64.657px] overflow-clip shrink-0">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6567 64.6567">
                          <g>
                            <path d={svgPaths.p959d900} fill="#EBE9E9" />
                            <path d={svgPaths.p12218b00} fill="#EBE9E9" />
                          </g>
                        </svg>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-bold text-[18px] text-center leading-[1.5]" style={{ color: "#f8f8f8" }}>
                          Carregar capa
                        </p>
                        <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                          PNG ou JPEG até 2 MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-[16px] py-[8px] font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                        style={{
                          background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                          color: "#f8f8f8",
                        }}
                        onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                      >
                        Selecionar ficheiro
                      </button>
                    </>
                  )}
                </div>
                {hasError("cover") && <FieldError message={errors.cover!} />}
                </div>

              </div>
            </div>
          </div>

          {/* ── Details Section ── */}
          <div
            className="relative"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
          >
            <div className="p-6 flex flex-col gap-6">
              <h2 className="font-bold text-[24px] leading-[1.5]" style={{ color: "#ebe9e9" }}>
                Detalhes da música
              </h2>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Título da música <span style={{ color: "#ff164c" }}>*</span>
                </label>
                <div
                  style={{ border: `1px solid ${hasError("title") ? "#ff164c" : "#30292b"}`,
                    background: hasError("title") ? "rgba(255,22,76,0.04)" : "transparent" }}
                  className="hover:border-[#ff164c]/50 transition-colors"
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((er) => ({ ...er, title: undefined }));
                    }}
                    placeholder="Ex: Neon Gênesis..."
                    className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    aria-invalid={hasError("title")}
                    aria-describedby={hasError("title") ? "title-error" : undefined}
                  />
                </div>
                {hasError("title") && <FieldError id="title-error" message={errors.title!} />}
              </div>

              {/* Álbum: texto livre na primeira vez; depois escolher existente ou criar novo */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Álbum (opcional)
                </label>
                {existingAlbumNames.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div
                      className="hover:border-[#ff164c]/50 transition-colors"
                      style={{ border: "1px solid #30292b" }}
                    >
                      <select
                        value={albumPick}
                        onChange={(e) => {
                          setAlbumPick(e.target.value);
                          if (e.target.value !== "__new__") setAlbumNewName("");
                        }}
                        aria-label="Selecionar álbum existente ou criar novo"
                        className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px] cursor-pointer appearance-none"
                        style={{
                          color: "#f8f8f8",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23bababa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                        }}
                      >
                        <option value="">Sem álbum</option>
                        {existingAlbumNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="__new__">Novo álbum…</option>
                      </select>
                    </div>
                    {albumPick === "__new__" ? (
                      <div
                        className="hover:border-[#ff164c]/50 transition-colors"
                        style={{ border: "1px solid #30292b" }}
                      >
                        <input
                          type="text"
                          value={albumNewName}
                          onChange={(e) => setAlbumNewName(e.target.value)}
                          placeholder="Nome do novo álbum"
                          className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                          style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="hover:border-[#ff164c]/50 transition-colors"
                    style={{ border: "1px solid #30292b" }}
                  >
                    <input
                      type="text"
                      value={albumNewName}
                      onChange={(e) => setAlbumNewName(e.target.value)}
                      placeholder="Ex.: Singles 2026, EP Aurora…"
                      className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                  </div>
                )}
                <p className="text-[11px] leading-[1.25]" style={{ color: "#716e6e" }}>
                  Nas próximas publicações pode reutilizar um álbum ou criar outro.
                </p>
              </div>

              {/* Category + AI Generator */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category dropdown (mesmo padrão que Descobrir) */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Categoria
                  </label>
                  <div
                    className="hover:border-[#ff164c]/50 transition-colors"
                    style={{ border: "1px solid #30292b" }}
                  >
                    <GenreCategorySelect
                      aria-label="Selecionar categoria da música"
                      value={category}
                      allValue=""
                      allLabel="Todas as categorias"
                      options={uploadGenreOptions}
                      onChange={(next) => setCategory(next)}
                      onCreateGenre={handleCreateGenreUpload}
                      triggerClassName="min-h-[44px] px-6 py-2"
                    />
                  </div>
                </div>

                {/* AI Generator */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Nome da IA geradora
                  </label>
                  <div style={{ border: "1px solid #30292b" }} className="hover:border-[#ff164c]/50 transition-colors">
                    <input
                      type="text"
                      value={aiGenerator}
                      onChange={(e) => setAiGenerator(e.target.value)}
                      placeholder="Suno..."
                      list="ai-generators"
                      className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                    <datalist id="ai-generators">
                      {AI_GENERATORS.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Tags (clima, sensação, uso)
                </label>

                {/* Tag input with existing tags */}
                <div
                  className="flex flex-wrap gap-2 px-4 py-2 min-h-[44px] items-center hover:border-[#ff164c]/50 transition-colors"
                  style={{ border: "1px solid #30292b" }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-0.5 text-[13px] font-semibold"
                      style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70 transition-opacity ml-1 min-w-[20px] min-h-[20px] flex items-center justify-center"
                        style={{ color: "#a19a9b" }}
                        aria-label={`Remover tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Adicione Tags personalizadas (pressione Enter)" : ""}
                    className="flex-1 min-w-[180px] bg-transparent py-1 font-semibold text-[14px] outline-none placeholder:opacity-20"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                  />
                </div>

                {/* Tag suggestions */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Sugestões
                  </span>
                  {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => addTag(suggestion)}
                      className="flex items-center gap-1 px-2 py-1 text-[13px] font-semibold transition-opacity hover:opacity-80 min-h-[32px]"
                      style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                    >
                      <span style={{ color: "#ff164c" }}>+</span> {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Prompt */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Prompt de geração (opcional)
                </label>
                <div
                  className="hover:border-[#ff164c]/50 transition-colors"
                  style={{ border: "1px solid #30292b" }}
                >
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Cole aqui o prompt que você usou para criar esta música..."
                    rows={4}
                    className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none resize-none placeholder:opacity-20"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                  />
                </div>
                <p
                  className="text-[12px] leading-[1.25]"
                  style={{ color: "#bababa", opacity: 0.5 }}
                >
                  Seu prompt pode ser compartilhado por outros usuários da plataforma e utilizado em novas músicas.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px w-full" style={{ background: "#766c6e" }} />

              {/* Footer row: terms + buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Checkbox */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="upload-agreed-terms"
                      checked={agreed}
                      onCheckedChange={(v) => {
                        setAgreed(v === true);
                        if (errors.agreed) setErrors((e) => ({ ...e, agreed: undefined }));
                      }}
                      aria-invalid={hasError("agreed")}
                      className="mt-0.5 border-[#5b4f51] data-[state=checked]:bg-[#ff164c] data-[state=checked]:border-[#ff164c]"
                    />
                    <label
                      htmlFor="upload-agreed-terms"
                      className="text-[12px] leading-[1.4] cursor-pointer select-none"
                      style={{ color: "#bababa" }}
                    >
                      Concordo com os{" "}
                      <Link to="/termos" className="underline text-[#ff164c] hover:opacity-90">
                        Termos de utilização
                      </Link>{" "}
                      e com a{" "}
                      <Link to="/privacidade" className="underline text-[#ff164c] hover:opacity-90">
                        Política de privacidade
                      </Link>
                      . <span style={{ color: "#ff164c" }}>*</span>
                    </label>
                  </div>
                  {hasError("agreed") && <FieldError message={errors.agreed!} />}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 font-semibold text-[16px] leading-[1.5] transition-colors hover:bg-white/5 min-h-[44px]"
                    style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSubmit()}
                    className="px-4 py-2 font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px] disabled:opacity-50 disabled:pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                      color: "#f8f8f8",
                    }}
                  >
                    {isSubmitting ? "Enviando…" : "Salvar alterações"}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}