import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nijedan fajl nije poslat.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make filename unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/\s+/g, '-').toLowerCase();
    const finalName = `${uniqueSuffix}-${filename}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create dir if doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, finalName);
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${finalName}`,
      message: 'Fajl uspešno sačuvan.' 
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Greška pri čuvanju fajla.' }, { status: 500 });
  }
}
