import { NextResponse } from 'next/server';
import { getOrders, saveOrder } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Greška pri učitavanju porudžbina' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required data
    if (!data.customer || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Nepotpuni podaci za porudžbinu' }, { status: 400 });
    }

    // Process and save the order
    const newOrder = saveOrder(data);

    // Send an email to the admin with the order details
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'planetatapeta20@gmail.com',
          pass: process.env.EMAIL_PASS
        }
      });

      const translateKey = (key) => {
        const srMap = {
          material: "Vrsta materijala",
          width: "Širina (cm)",
          height: "Visina (cm)",
          includeInstallation: "Da li je potrebna ugradnja",
          size: "Dimenzija",
          note: "Napomena",
          quantity: "Broj komada u paketu"
        };
        return srMap[key] || key;
      };

      const translateValue = (val) => {
        if (typeof val === "boolean") return val ? "Da" : "Ne";
        if (val && typeof val === "object" && val.label) return val.label;
        if (val && typeof val === "object" && val.name) return val.name;
        return val;
      };

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="background-color: #06b6d4; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
            PORUDŽBINA SA SAJTA
          </div>
          <h2 style="color: #06b6d4;">Nova porudžbina: ${newOrder.id}</h2>
          
          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Podaci o kupcu:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Ime i prezime:</strong> ${data.customer.ime_prezime}</li>
            <li><strong>Email:</strong> ${data.customer.email}</li>
            <li><strong>Telefon:</strong> ${data.customer.telefon}</li>
            <li><strong>Grad:</strong> ${data.customer.grad}</li>
            <li><strong>Poštanski broj:</strong> ${data.customer.postanski_broj || 'Nije uneto'}</li>
            <li><strong>Adresa:</strong> ${data.customer.adresa}</li>
            <li><strong>Napomena:</strong> ${data.customer.napomena || 'Nema napomena'}</li>
          </ul>

          <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Naručeni proizvodi:</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.items.map(item => `
              <li style="margin-bottom: 15px; background: #fafafa; padding: 15px; border-radius: 6px; border-left: 4px solid #06b6d4;">
                <div style="font-size: 16px; margin-bottom: 8px;"><strong>${item.title}</strong> (Količina: ${item.quantity})</div>
                <div style="font-size: 14px; color: #555; margin-bottom: 8px; line-height: 1.5;">
                  ${item.configuration && Object.keys(item.configuration).length > 0 
                    ? Object.entries(item.configuration).map(([k, v]) => `<strong>${translateKey(k)}:</strong> ${translateValue(v)}`).join('<br/>') 
                    : 'Nema dodatnih opcija za ovaj proizvod'}
                </div>
                <div style="color: #06b6d4; font-weight: bold;">Cena: ${(item.price * item.quantity).toLocaleString()} RSD</div>
              </li>
            `).join('')}
          </ul>

          <h3 style="background-color: #f4f4f4; padding: 10px; margin-top: 20px; border-radius: 5px;">
            <strong>Ukupno za naplatu:</strong> ${data.total.toLocaleString()} RSD
          </h3>
        </div>
      `;

      await transporter.sendMail({
        from: `"Planeta Tapeta" <${process.env.EMAIL_USER || 'planetatapeta20@gmail.com'}>`,
        to: 'planetatapeta20@gmail.com',
        subject: `Nova porudžbina - ${newOrder.id}`,
        html: emailHtml
      });
      console.log('Email uspešno poslat za porudžbinu', newOrder.id);
    } catch (emailError) {
      console.error('Došlo je do greške pri slanju emaila (narudžbina je ipak sačuvana):', emailError);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json({ error: 'Greška pri čuvanju porudžbine' }, { status: 500 });
  }
}
