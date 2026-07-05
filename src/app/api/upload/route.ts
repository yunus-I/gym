import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "gym-uploads";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${sanitizedName}`;

    let { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error?.message?.includes("bucket")) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
      });
      if (bucketError) {
        return NextResponse.json({ error: "Bucket creation failed" }, { status: 500 });
      }
      ({ error } = await supabaseAdmin.storage.from(BUCKET).upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      }));
    }

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
