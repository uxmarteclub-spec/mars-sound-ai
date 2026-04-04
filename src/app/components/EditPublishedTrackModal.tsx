import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-r7seo7qk5p";
import { getSupabase } from "../../lib/supabaseClient";
import { useLibrary } from "../context/LibraryContext";
import type { Track } from "../../types/music";
import {
  fetchPublishedTrackDetailForOwner,
  type OwnerPublishedTrackDetail,
} from "../../services/supabase/libraryData";
import { formatDurationSeconds } from "../../services/supabase/mappers";
import { GenreCategorySelect } from "./ui/GenreCategorySelect";
import {
  MUSIC_GENRES_CATALOG,
  mergeGenreNameLists,
} from "../../data/musicGenresCatalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const TAG_SUGGESTIONS = [
  "Ambient",
  "Gospel",
  "Relax",
  "Energético",
  "Pop",
  "Rock",
  "Sad",
  "Happy",
  "Dark",
  "Chill",
];

const AI_GENERATORS = [
  "Suno",
  "Udio",
  "Stable Audio",
  "MusicGen",
  "AudioCraft",
  "Outro...",
];

function FieldError({ message }: { message: string }) {
  return (
    <p
      className="flex items-center gap-1 text-[12px] leading-[1.25] mt-1"
      style={{ color: "#ff164c" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff164c">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </p>
  );
}

interface EditPublishedTrackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: Track | null;
}

export function EditPublishedTrackModal({
  open,
  onOpenChange,
  track,
}: EditPublishedTrackModalProps) {
  const {
    discoverCategories,
    createGenre,
    myPublishedTracks,
    updatePublishedTrackFull,
  } = useLibrary();

  const [detailLoading, setDetailLoading] = useState(false);
  const [loaded, setLoaded] = useState<OwnerPublishedTrackDetail | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [albumPick, setAlbumPick] = useState("");
  const [albumNewName, setAlbumNewName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiGenerator, setAiGenerator] = useState("");
  const [prompt, setPrompt] = useState("");

  const [errors, setErrors] = useState<{ title?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const albumNamesRef = useRef(existingAlbumNames);
  albumNamesRef.current = existingAlbumNames;

  const applyDetailToForm = useCallback((d: OwnerPublishedTrackDetail) => {
    const names = albumNamesRef.current;
    setTitle(d.title);
    setCategory(d.categoryName || "");
    setTags([...d.moods]);
    setAiGenerator(d.ai_model?.trim() ?? "");
    setPrompt(d.ai_prompt?.trim() ?? "");
    setCoverPreview(d.image_url);
    setCoverFile(null);
    setAudioFile(null);
    setAudioProgress(0);
    setTagInput("");
    setErrors({});
    setSubmitted(false);

    const al = d.album?.trim() ?? "";
    if (names.length > 0) {
      if (!al) {
        setAlbumPick("");
        setAlbumNewName("");
      } else if (names.includes(al)) {
        setAlbumPick(al);
        setAlbumNewName("");
      } else {
        setAlbumPick("__new__");
        setAlbumNewName(al);
      }
    } else {
      setAlbumPick("");
      setAlbumNewName(al);
    }
  }, []);

  useEffect(() => {
    if (!open || !track?.id) {
      setLoaded(null);
      return;
    }
    let cancelled = false;
    const sb = getSupabase();
    if (!sb) {
      toast.error("Cliente indisponível.");
      onOpenChange(false);
      return;
    }
    setDetailLoading(true);
    void fetchPublishedTrackDetailForOwner(sb, track.id)
      .then((d) => {
        if (cancelled || !d) {
          if (!cancelled && !d) toast.error("Não foi possível carregar a faixa.");
          if (!cancelled) onOpenChange(false);
          return;
        }
        setLoaded(d);
        applyDetailToForm(d);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Não foi possível carregar a faixa.");
          onOpenChange(false);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, track?.id, onOpenChange, applyDetailToForm]);

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

  const handleAudioFile = (file: File) => {
    setAudioFile(file);
    setAudioProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setAudioProgress(Math.min(Math.round(p), 100));
    }, 150);
  };

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.startsWith("audio/") ||
        file.name.endsWith(".mp3") ||
        file.name.endsWith(".wav"))
    ) {
      handleAudioFile(file);
    }
  }, []);

  const handleCoverFile = (file: File) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      handleCoverFile(file);
    }
  }, []);

  const addTag = (tag: string) => {
    const t = tag.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((x) => x !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const resolveAlbumForSubmit = (): string | null => {
    if (existingAlbumNames.length === 0) {
      const t = albumNewName.trim();
      return t || null;
    }
    if (albumPick === "__new__") {
      const t = albumNewName.trim();
      return t || null;
    }
    if (albumPick.trim()) return albumPick;
    return null;
  };

  const handleSubmit = async () => {
    if (!loaded) return;
    setSubmitted(true);
    if (!title.trim()) {
      setErrors({ title: "O título da música é obrigatório." });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updatePublishedTrackFull({
        trackId: loaded.id,
        currentAudioUrl: loaded.audio_url,
        currentImageUrl: loaded.image_url,
        title: title.trim(),
        album: resolveAlbumForSubmit(),
        category: category || undefined,
        tags,
        aiGenerator: aiGenerator || undefined,
        prompt: prompt || undefined,
        coverFile,
        audioFile,
      });
      toast.success("Faixa atualizada.");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível guardar. Tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  const hasError = (field: "title") => submitted && !!errors[field];
  const currentDurationLabel = loaded
    ? formatDurationSeconds(loaded.durationSeconds)
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#30292b] bg-[#24191b] text-[#f8f8f8] max-w-4xl max-h-[min(90vh,920px)] overflow-y-auto p-0 gap-0 [&_[data-slot=dialog-close]]:text-[#f8f8f8]">
        <div className="p-6 pb-4 border-b border-[#30292b] shrink-0">
          <DialogHeader>
            <DialogTitle className="text-[#ebe9e9] text-left">
              Editar música
            </DialogTitle>
            <DialogDescription className="text-[#bababa] text-sm text-left">
              Os mesmos campos do envio: áudio, capa, título, álbum, categoria,
              tags, IA e prompt. Deixe áudio/capa em branco para manter os
              ficheiros atuais.
            </DialogDescription>
          </DialogHeader>
        </div>

        {detailLoading ? (
          <div className="p-12 text-center text-sm text-[#a19a9b]">
            A carregar dados da faixa…
          </div>
        ) : loaded ? (
          <div className="p-6 flex flex-col gap-[22px]">
            {/* Áudio */}
            <div
              className="relative"
              style={{ background: "#1a1214", border: "1px solid #30292b" }}
            >
              <div className="p-5">
                <h3
                  className="font-bold text-[18px] mb-4"
                  style={{ color: "#ebe9e9" }}
                >
                  Áudio
                </h3>
                <p className="text-[12px] mb-3" style={{ color: "#bababa" }}>
                  Atual: {currentDurationLabel}
                  {!audioFile ? " · ficheiro guardado na plataforma" : null}
                </p>
                <div
                  className={[
                    "flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors min-h-[200px]",
                  ].join(" ")}
                  style={{
                    border: `2px solid ${isDraggingAudio ? "#ff164c" : "#30292b"}`,
                    background: "transparent",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingAudio(true);
                  }}
                  onDragLeave={() => setIsDraggingAudio(false)}
                  onDrop={handleAudioDrop}
                  onClick={() => audioInputRef.current?.click()}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mp3,audio/wav,.mp3,.wav"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleAudioFile(e.target.files[0])
                    }
                  />
                  <div className="relative size-[56px] overflow-clip shrink-0">
                    <svg className="absolute block size-full" fill="none" viewBox="0 0 32 32" />
                    <div className="absolute inset-[12.5%_4.17%]">
                      <svg
                        className="absolute block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 72.4171 59.2504"
                      >
                        <path d={svgPaths.p6552b80} fill="#F8F8F8" />
                      </svg>
                    </div>
                  </div>
                  {audioFile ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <p
                        className="font-bold text-[15px] text-center truncate max-w-full px-2"
                        style={{ color: "#f8f8f8" }}
                      >
                        Novo: {audioFile.name}
                      </p>
                      <div
                        className="w-full h-1 rounded-full overflow-hidden max-w-xs"
                        style={{ background: "#5b4f51" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${audioProgress}%`,
                            background:
                              "linear-gradient(90deg, #ff164c, #ea5858)",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-[#ff164c] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioFile(null);
                          setAudioProgress(0);
                        }}
                      >
                        Manter áudio atual
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        className="font-semibold text-[15px] text-center"
                        style={{ color: "#f8f8f8" }}
                      >
                        Substituir ficheiro de áudio (opcional)
                      </p>
                      <p className="text-[12px]" style={{ color: "#bababa" }}>
                        MP3 ou WAV
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Capa */}
            <div
              className="relative"
              style={{ background: "#1a1214", border: "1px solid #30292b" }}
            >
              <div className="p-5">
                <h3
                  className="font-bold text-[18px] mb-4"
                  style={{ color: "#ebe9e9" }}
                >
                  Capa
                </h3>
                <div
                  className="flex flex-col sm:flex-row gap-4 items-center justify-center p-4 min-h-[160px] cursor-pointer"
                  style={{ border: `2px solid ${isDraggingCover ? "#ff164c" : "#30292b"}` }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(true);
                  }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleCoverFile(e.target.files[0])
                    }
                  />
                  {coverPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="relative w-[120px] h-[120px] overflow-hidden shrink-0"
                        style={{ border: "1px solid #30292b" }}
                      >
                        <img
                          src={coverPreview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-[#ff164c] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverFile(null);
                          setCoverPreview(loaded.image_url);
                        }}
                      >
                        Repor capa original
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div
              className="relative"
              style={{ background: "#1a1214", border: "1px solid #30292b" }}
            >
              <div className="p-5 flex flex-col gap-5">
                <h3 className="font-bold text-[18px]" style={{ color: "#ebe9e9" }}>
                  Detalhes da música
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px]" style={{ color: "#bababa" }}>
                    Título <span style={{ color: "#ff164c" }}>*</span>
                  </label>
                  <div
                    style={{
                      border: `1px solid ${hasError("title") ? "#ff164c" : "#30292b"}`,
                    }}
                  >
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title)
                          setErrors((er) => ({ ...er, title: undefined }));
                      }}
                      className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none min-h-[44px]"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                  </div>
                  {hasError("title") && (
                    <FieldError message={errors.title!} />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px]" style={{ color: "#bababa" }}>
                    Álbum (opcional)
                  </label>
                  {existingAlbumNames.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <div style={{ border: "1px solid #30292b" }}>
                        <select
                          value={albumPick}
                          onChange={(e) => {
                            setAlbumPick(e.target.value);
                            if (e.target.value !== "__new__")
                              setAlbumNewName("");
                          }}
                          className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none min-h-[44px] cursor-pointer appearance-none"
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
                        <div style={{ border: "1px solid #30292b" }}>
                          <input
                            type="text"
                            value={albumNewName}
                            onChange={(e) => setAlbumNewName(e.target.value)}
                            placeholder="Nome do novo álbum"
                            className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none min-h-[44px]"
                            style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ border: "1px solid #30292b" }}>
                      <input
                        type="text"
                        value={albumNewName}
                        onChange={(e) => setAlbumNewName(e.target.value)}
                        placeholder="Nome do álbum (opcional)"
                        className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none min-h-[44px]"
                        style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[12px]" style={{ color: "#bababa" }}>
                      Categoria
                    </label>
                    <div style={{ border: "1px solid #30292b" }}>
                      <GenreCategorySelect
                        aria-label="Categoria"
                        value={category}
                        allValue=""
                        allLabel="Todas as categorias"
                        options={uploadGenreOptions}
                        onChange={setCategory}
                        onCreateGenre={handleCreateGenreUpload}
                        triggerClassName="min-h-[44px] px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[12px]" style={{ color: "#bababa" }}>
                      Nome da IA geradora
                    </label>
                    <div style={{ border: "1px solid #30292b" }}>
                      <input
                        type="text"
                        value={aiGenerator}
                        onChange={(e) => setAiGenerator(e.target.value)}
                        list="edit-ai-generators"
                        className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none min-h-[44px]"
                        style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                      />
                      <datalist id="edit-ai-generators">
                        {AI_GENERATORS.map((g) => (
                          <option key={g} value={g} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px]" style={{ color: "#bababa" }}>
                    Tags
                  </label>
                  <div
                    className="flex flex-wrap gap-2 px-3 py-2 min-h-[44px] items-center"
                    style={{ border: "1px solid #30292b" }}
                  >
                    {tags.map((tg) => (
                      <span
                        key={tg}
                        className="flex items-center gap-1 px-2 py-0.5 text-[13px] font-semibold"
                        style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                      >
                        #{tg}
                        <button
                          type="button"
                          onClick={() => removeTag(tg)}
                          className="text-[#a19a9b] hover:opacity-80"
                          aria-label={`Remover ${tg}`}
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
                      placeholder={
                        tags.length === 0 ? "Enter para adicionar" : ""
                      }
                      className="flex-1 min-w-[120px] bg-transparent py-1 text-[14px] outline-none"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addTag(suggestion)}
                          className="px-2 py-1 text-[12px] font-semibold border border-[#ff164c] text-[#f8f8f8]"
                        >
                          + {suggestion}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px]" style={{ color: "#bababa" }}>
                    Prompt de geração (opcional)
                  </label>
                  <div style={{ border: "1px solid #30292b" }}>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-transparent px-4 py-2 font-semibold text-[16px] outline-none resize-none"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end px-0 pb-1">
              <Button
                type="button"
                variant="outline"
                className="border-[#30292b] bg-transparent text-[#f8f8f8] hover:bg-white/5"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[#ff164c] text-white hover:bg-[#d4103e]"
                disabled={saving}
                onClick={() => void handleSubmit()}
              >
                {saving ? "A guardar…" : "Guardar alterações"}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
