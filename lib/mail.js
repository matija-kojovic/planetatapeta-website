// Outgoing e-mail through Gmail SMTP (nodemailer). Credentials come only from
// the environment; without them, sending is skipped and the caller decides
// what that means for the request.
import "server-only";
import nodemailer from "nodemailer";
import { escapeHtml } from "./security.js";
import { formatRSD } from "./format.js";

const DEFAULT_INBOX = "planetatapeta20@gmail.com";

export const isMailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const inbox = () => process.env.ORDER_NOTIFY_EMAIL || DEFAULT_INBOX;

let transporter;
function getTransporter() {
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

/** Returns true when the message was handed to the mail server. */
async function send(message) {
  if (!isMailConfigured()) {
    console.warn("E-mail not sent: EMAIL_USER / EMAIL_PASS are not configured.");
    return false;
  }
  try {
    await getTransporter().sendMail({ from: `"Planetatapeta sajt" <${process.env.EMAIL_USER}>`, to: inbox(), ...message });
    return true;
  } catch (error) {
    console.error("E-mail sending failed:", error.message);
    return false;
  }
}

const row = (label, value) =>
  `<tr><td style="padding:4px 12px 4px 0;color:#5b6b6b;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;

export function sendOrderEmail(order) {
  const c = order.customer;
  const items = order.items
    .map(
      (item) => `
      <div style="margin:0 0 16px;padding:12px 0;border-top:1px solid #ddd">
        <strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.categoryLabel)}<br>
        <table style="font-size:14px;margin-top:6px">${item.details.map(([k, v]) => row(k, v)).join("")}${row("Količina", String(item.quantity))}${row("Cena", formatRSD(item.lineTotal))}</table>
      </div>`
    )
    .join("");

  return send({
    replyTo: c.email,
    subject: `Nova porudžbina ${order.id}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1d3133;max-width:640px">
        <h2 style="margin:0 0 12px">Nova porudžbina ${escapeHtml(order.id)}</h2>
        <table style="font-size:14px">
          ${row("Ime i prezime", c.ime_prezime)}${row("E-adresa", c.email)}${row("Telefon", c.telefon)}
          ${row("Adresa", c.adresa)}${row("Mesto", `${c.postanski_broj ? c.postanski_broj + " " : ""}${c.grad}`)}
          ${row("Napomena", c.napomena || "—")}
        </table>
        <h3 style="margin:24px 0 8px">Proizvodi</h3>
        ${items}
        <p style="font-size:16px;border-top:2px solid #1d3133;padding-top:12px"><strong>Ukupno: ${escapeHtml(formatRSD(order.total))}</strong></p>
        <p style="font-size:12px;color:#5b6b6b">Cene su izračunate na serveru.</p>
      </div>`,
  });
}

export function sendContactEmail(message) {
  return send({
    replyTo: message.email,
    subject: `Upit sa sajta: ${message.ime} ${message.prezime}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1d3133;max-width:640px">
        <h2 style="margin:0 0 12px">Poruka sa kontakt forme</h2>
        <table style="font-size:14px">${row("Ime i prezime", `${message.ime} ${message.prezime}`)}${row("E-adresa", message.email)}${row("Telefon", message.telefon)}</table>
        <p style="white-space:pre-wrap;font-size:15px;border-top:1px solid #ddd;padding-top:12px">${escapeHtml(message.poruka)}</p>
      </div>`,
  });
}
