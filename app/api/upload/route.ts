import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to upload files" }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 8MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 8MB limit" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: PNG, JPG, WEBP, SVG, GIF, PDF" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate safe clean filename
    const ext = path.extname(file.name) || (file.type === "image/svg+xml" ? ".svg" : ".png");
    const safeName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `${safeName || "upload"}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl, fileName });
  } catch (err: unknown) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
