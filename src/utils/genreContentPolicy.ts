/**
 * Pré-validação de nomes de categoria (alinhada à RPC `create_genre_with_limits`).
 * Lista de termos: bloquear injúria/ódio comuns; ajustar com moderação humana quando necessário.
 */

const BLOCKED_SUBSTRINGS = [
  "hitler",
  "nazismo",
  "nazi",
  "estupro",
  "estuprador",
  "putaria",
  "puta ",
  " puta",
  "puto ",
  "fdp",
  "filho da puta",
  "caralho",
  "buceta",
  "pau no ",
  "foda",
  "foder",
  "merda",
  "macaco ",
  " macaco",
  "babuino",
  "viado",
  "bicha ",
  "retardado",
  "retardada",
  "nigga",
  "nigger",
  "whore",
  "faggot",
  "rape ",
  " rape",
  "https://",
  "http://",
  "<script",
  "</",
  "<iframe",
] as const;

export type GenreValidationCode =
  | "empty"
  | "too_short"
  | "too_long"
  | "blocked_content"
  | "invalid_chars";

export function validateGenreDisplayName(raw: string): {
  ok: true;
  name: string;
} | {
  ok: false;
  code: GenreValidationCode;
  message: string;
} {
  const name = raw.trim();
  if (!name) {
    return { ok: false, code: "empty", message: "Indique um nome para a categoria." };
  }
  if (name.length < 2) {
    return {
      ok: false,
      code: "too_short",
      message: "O nome deve ter pelo menos 2 caracteres.",
    };
  }
  if (name.length > 80) {
    return {
      ok: false,
      code: "too_long",
      message: "O nome não pode ultrapassar 80 caracteres.",
    };
  }
  const lower = name.toLowerCase();
  for (const w of BLOCKED_SUBSTRINGS) {
    if (lower.includes(w)) {
      return {
        ok: false,
        code: "blocked_content",
        message:
          "Este nome não é permitido. Use um termo respeitoso e adequado a uma categoria musical.",
      };
    }
  }
  if (/[\u0000-\u001F<>]/.test(name)) {
    return {
      ok: false,
      code: "invalid_chars",
      message: "Remova caracteres especiais inválidos do nome.",
    };
  }
  return { ok: true, name };
}

export function mapGenreRpcError(code: string | undefined): string {
  switch (code) {
    case "not_authenticated":
      return "Inicie sessão para criar categorias.";
    case "invalid_length":
      return "O nome deve ter entre 2 e 80 caracteres.";
    case "blocked_content":
      return "Este nome não é permitido. Use um termo respeitoso.";
    case "monthly_limit":
      return "Limite de 2 categorias novas por mês atingido. Tente no próximo mês.";
    case "invalid_slug":
      return "Não foi possível gerar um identificador para esta categoria. Ajuste o nome.";
    case "rpc_failed":
      return "Serviço indisponível. Confirme que a migração da base de dados foi aplicada e tente de novo.";
    default:
      return "Não foi possível criar a categoria.";
  }
}
