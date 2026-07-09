"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB

/**
 * Upload a new profile picture to Supabase Storage and point the user's
 * metadata at it. Returns the public URL. auth.updateUser emits USER_UPDATED,
 * so the app context refreshes the avatar automatically.
 */
export async function uploadAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Image is too large (max 3 MB).");
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You're not signed in.");

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/avatar.${ext || "png"}`;

  const { error: upErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw new Error(upErr.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Cache-bust so the new image shows immediately even at the same path.
  const url = `${publicUrl}?v=${Date.now()}`;

  const { error: updErr } = await supabase.auth.updateUser({
    data: { avatar_url: url, avatar_path: path },
  });
  if (updErr) throw new Error(updErr.message);

  return url;
}

/** Remove the uploaded avatar (falls back to the generated initials avatar). */
export async function removeAvatar(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = (user?.user_metadata as Record<string, unknown> | undefined)?.avatar_path;
  if (typeof path === "string" && path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  }
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: null, avatar_path: null },
  });
  if (error) throw new Error(error.message);
}

/** Delete the account (server re-verifies the password). */
export async function deleteAccount(password: string): Promise<void> {
  const res = await fetch("/api/account/delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Couldn't delete your account.");
}
