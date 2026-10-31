import { NextResponse } from 'next/server';
import { getContent, saveContent } from '@/lib/db';

export async function GET() {
  try {
    const content = getContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri učitavanju sadržaja' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: 'Nema prosleđenih podataka' }, { status: 400 });
    }

    // Save and return new content
    const updatedContent = saveContent(data);

    return NextResponse.json({ success: true, content: updatedContent }, { status: 200 });
  } catch (error) {
    console.error("Content saving error:", error);
    return NextResponse.json({ error: 'Greška pri snimanju web sadržaja' }, { status: 500 });
  }
}
