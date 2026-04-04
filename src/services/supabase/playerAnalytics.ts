import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function notifyTrackPlaybackStarted(trackId: string): Promise<void> {
  if (!isSupabaseConfigured() || !UUID_RE.test(trackId)) return;
  const sb = getSupabase();
  if (!sb) return;
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.user?.id) return;
  try {
    await sb.rpc("increment_play_count", { track_id_param: trackId });
    await sb.from("play_history").insert({
      user_id: session.user.id,
      track_id: trackId,
      completed: false,
    });
  } catch {
    /* não bloquear reprodução */
  }
}
