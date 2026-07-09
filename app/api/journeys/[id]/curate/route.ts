import { NextResponse, type NextRequest } from "next/server";
import { getRequestUser } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { curateJourneyResources } from "@/lib/server/curator";
import { runInBackground } from "@/lib/server/background";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/journeys/[id]/curate — (re)start resource curation for chapters
 * still 'pending' (add ?includeEmpty=1 to also retry flagged
 * 'no_resources_found' gaps). Fire-and-forget: responds 202 immediately while
 * curation continues server-side; chapters fill in as they complete.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: journey } = await admin
    .from("journeys")
    .select("id, user_id")
    .eq("id", params.id)
    .single();
  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }
  if (journey.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const statuses = req.nextUrl.searchParams.get("includeEmpty")
    ? ["pending", "no_resources_found"]
    : ["pending"];

  // Count what's queued (via unit ids — chapters don't reference journeys directly)
  const { data: units } = await admin
    .from("units")
    .select("id")
    .eq("journey_id", params.id);
  const unitIds = (units ?? []).map((u) => u.id);
  const { count } = await admin
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .in("unit_id", unitIds)
    .in("resource_status", statuses);

  if (!count) {
    return NextResponse.json({ queued: false, message: "No chapters need curation" });
  }

  runInBackground(
    curateJourneyResources(params.id, { statuses }),
    `curate ${params.id}`
  );

  return NextResponse.json({ queued: true, chapters: count }, { status: 202 });
}
