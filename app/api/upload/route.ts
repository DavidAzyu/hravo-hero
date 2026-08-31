import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Cloudinary config - fixed. The old file referenced invalid env names
// (process.env.NEXT_PUBLIC_tadcjo7u / process.env.387554373753717) which
// made the upload API throw "Cloudinary configuration missing".
//
// Credentials live in .env.local, with a fallback to the account values
// already used by this project (from the cloudinary:// URL in the repo):
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tadcjo7u
//   CLOUDINARY_API_KEY=387554373753717
//   CLOUDINARY_API_SECRET=...
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tadcjo7u',
  api_key: process.env.CLOUDINARY_API_KEY || '387554373753717',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'B8P2hYwttFB28wLV7BdCYCWt1Vs',
});

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const image = body?.image;
  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'hravo_models',
      resource_type: 'auto',
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload failed:', error?.message || error);
    return NextResponse.json({ error: 'Upload failed: ' + (error?.message || '') }, { status: 500 });
  }
}