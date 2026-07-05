import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "memberphotos";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = file.name?.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}.${ext}`;

    const supabase = getSupabaseAdmin();

    // try uploading directly — may succeed if bucket already exists
    const bytes = await file.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error?.message?.toLowerCase().includes("bucket")) {
      // bucket missing — create it and retry
      const { error: be } = await supabase.storage.createBucket(BUCKET, { public: true });
      if (be) {
        return NextResponse.json({ error: "Create bucket failed", details: be.message }, { status: 500 });
      }
      const { error: e2 } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (e2) {
        return NextResponse.json({ error: "Upload after bucket creation failed", details: e2.message }, { status: 500 });
      }
    } else if (error) {
      return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed", details: error?.message || String(error) }, { status: 500 });
  }
}
