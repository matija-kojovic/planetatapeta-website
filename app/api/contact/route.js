import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.ime || !data.prezime || !data.email || !data.telefon || !data.poruka) {
      return NextResponse.json({ error: 'Sva polja su obavezna' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'planetatapeta20@gmail.com',
        pass: process.env.EMAIL_PASS
      }
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="background-color: #d946ef; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
          PORUKA SA KONTAKT FORME
        </div>
        <h2 style="color: #d946ef;">Novi upit od: ${data.ime} ${data.prezime || ''}</h2>
        
        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Detalji pošiljaoca:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Ime i prezime:</strong> ${data.ime} ${data.prezime}</li>
          <li><strong>Telefon:</strong> ${data.telefon}</li>
          <li><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></li>
        </ul>

        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Sadržaj poruke:</h3>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #d946ef; white-space: pre-wrap; font-size: 16px;">
          ${data.poruka}
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Kontakt Forma" <${process.env.EMAIL_USER || 'planetatapeta20@gmail.com'}>`,
      to: 'planetatapeta20@gmail.com',
      replyTo: data.email,
      subject: `Upit: ${data.ime} ${data.prezime || ''}`,
      html: emailHtml
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Zabeležena greška na kontakt formi:", error);
    return NextResponse.json({ error: 'Greška pri slanju poruke' }, { status: 500 });
  }
}
