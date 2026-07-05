import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "gym-uploads";

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

    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET);
    if (!bucketExists) {
      const { error: be } = await supabase.storage.createBucket(BUCKET, { public: true });
      if (be) {
        return NextResponse.json({ error: "Bucket creation failed", details: be.message }, { status: 500 });
      }
    }

    const bytes = await file.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(filename, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed", details: error?.message || String(error) }, { status: 500 });
  }
}
