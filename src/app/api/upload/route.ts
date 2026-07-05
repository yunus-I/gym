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

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedName}`;

    const supabase = getSupabaseAdmin();

    let { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error?.message?.toLowerCase().includes("bucket")) {
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
      });
      if (bucketError) {
        return NextResponse.json({ error: "Bucket creation failed", details: bucketError.message }, { status: 500 });
      }
      ({ error } = await supabase.storage.from(BUCKET).upload(filename, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      }));
    }

    if (error) {
      return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed", details: error?.message || String(error) }, { status: 500 });
  }
}
