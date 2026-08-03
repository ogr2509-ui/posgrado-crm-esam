const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pjykahdqkmolglethdxs.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IBzfxSF3S27JBSIfivbfjg_LNvPTRrs";

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  storageUrl: `${SUPABASE_URL}/storage/v1/object/public/uploads`,
};

export function getPublicStorageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${supabaseConfig.storageUrl}/${path.replace(/^\//, '')}`;
}
