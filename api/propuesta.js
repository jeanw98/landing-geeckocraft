// POST /api/propuesta · Función de Vercel sin dependencias.
// Recibe el formulario (texto o nota de voz), lo valida, lo manda por correo con Resend
// y, si WhatsApp Cloud API está configurado, avisa al WhatsApp del estudio.

const MAX_AUDIO = 4 * 1024 * 1024; // las funciones de Vercel aceptan cuerpos de hasta 4,5 MB
const CANALES = ['WhatsApp', 'Correo'];
const PRESUPUESTOS = ['', 'Menos de $1.000', '$1.000 a $3.000', '$3.000 a $8.000', 'Más de $8.000', 'Todavía no sé'];
const LIMITE = { ventanaMs: 10 * 60 * 1000, max: 5 };
// Por instancia: frena ráfagas, no reemplaza un límite global.
const visitas = new Map();

export async function POST(request) {
  const quiereJson = (request.headers.get('accept') || '').includes('application/json');
  const responder = (status, cuerpo) => {
    if (quiereJson) return Response.json(cuerpo, { status });
    const destino = cuerpo.ok ? '/gracias.html' : '/#muda';
    return new Response(null, { status: 303, headers: { Location: destino } });
  };

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
  if (excedeLimite(ip)) return responder(429, { ok: false, error: 'Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.' });

  let datos;
  try {
    datos = await request.formData();
  } catch {
    return responder(400, { ok: false, error: 'No pudimos leer el formulario.' });
  }

  // honeypot: los bots lo llenan, las personas no lo ven
  if (String(datos.get('empresa') || '').trim()) return responder(200, { ok: true, id: numero() });

  const idea = String(datos.get('idea') || '').trim().slice(0, 400);
  const canal = String(datos.get('canal') || 'WhatsApp');
  const contacto = String(datos.get('contacto') || '').trim().slice(0, 120);
  const presupuesto = String(datos.get('presupuesto') || '');
  const color = String(datos.get('color') || '');
  const duracion = Math.min(120, Math.max(0, parseInt(datos.get('duracion'), 10) || 0));
  const audio = datos.get('audio');
  const hayAudio = audio && typeof audio === 'object' && audio.size > 0;

  if (!idea && !hayAudio) return responder(400, { ok: false, error: 'Falta tu idea. Escribe una frase o graba una nota de voz.' });
  if (!CANALES.includes(canal)) return responder(400, { ok: false, error: 'Elige WhatsApp o correo.' });
  if (canal === 'Correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contacto)) return responder(400, { ok: false, error: 'Ese correo no parece completo. Revisa que tenga @ y dominio.' });
  if (canal === 'WhatsApp' && contacto.replace(/\D/g, '').length < 9) return responder(400, { ok: false, error: 'Déjanos tu número de WhatsApp con código de país, por ejemplo +593 99 123 4567.' });
  if (!PRESUPUESTOS.includes(presupuesto)) return responder(400, { ok: false, error: 'Presupuesto no válido.' });
  if (color && !/^#[0-9a-f]{6}$/i.test(color)) return responder(400, { ok: false, error: 'Color no válido.' });
  if (hayAudio && audio.size > MAX_AUDIO) return responder(413, { ok: false, error: 'La nota de voz pesa demasiado. Graba una más corta o escribe tu idea.' });
  if (hayAudio && !/^audio\//.test(audio.type || '')) return responder(400, { ok: false, error: 'El archivo de audio no es válido.' });

  const id = numero();
  const propuesta = { id, idea, canal, contacto, presupuesto: presupuesto || 'por definir', color: color || 'por definir', duracion };

  try {
    await enviarCorreo(propuesta, hayAudio ? audio : null);
  } catch (e) {
    console.error('Resend:', e);
    return responder(502, { ok: false, error: 'No pudimos enviar tu idea en este momento.' });
  }

  // si WhatsApp falla, el correo ya llegó: no se lo cobramos al visitante
  await avisarWhatsApp(propuesta, hayAudio).catch((e) => console.error('WhatsApp:', e));

  return responder(200, { ok: true, id });
}

function excedeLimite(ip) {
  const ahora = Date.now();
  const lista = (visitas.get(ip) || []).filter((t) => ahora - t < LIMITE.ventanaMs);
  lista.push(ahora);
  visitas.set(ip, lista);
  return lista.length > LIMITE.max;
}

// Sin base de datos: número corto derivado de la hora del envío.
function numero() {
  return String(Math.floor(Date.now() / 1000) % 10000).padStart(4, '0');
}

function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mmss(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

async function enviarCorreo(p, audio) {
  const { RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !LEAD_TO_EMAIL || !LEAD_FROM_EMAIL) throw new Error('Faltan variables de Resend');

  const ideaTxt = p.idea || `(nota de voz de ${mmss(p.duracion)}, va adjunta)`;
  const filas = [
    ['Idea', ideaTxt],
    ['Nota de voz', audio ? `Adjunta (${mmss(p.duracion)})` : 'No'],
    ['Responder por', `${p.canal}: ${p.contacto}`],
    ['Presupuesto', p.presupuesto],
    ['Color de marca', p.color],
  ];
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#151514">
<h2 style="margin:0 0 16px">Nueva propuesta #${p.id}</h2>
<table cellpadding="8" style="border-collapse:collapse">${filas
    .map(([k, v]) => `<tr><td style="color:#8F8D83;vertical-align:top">${k}</td><td>${escapar(v)}</td></tr>`)
    .join('')}</table>
${p.color.startsWith('#') ? `<p><span style="display:inline-block;width:40px;height:20px;background:${p.color}"></span></p>` : ''}
</div>`;
  const text = filas.map(([k, v]) => `${k}: ${v}`).join('\n');

  const cuerpo = {
    from: LEAD_FROM_EMAIL,
    to: LEAD_TO_EMAIL.split(',').map((s) => s.trim()),
    subject: `Nueva propuesta #${p.id} · ${p.canal} · ${p.presupuesto}`,
    html,
    text,
  };
  if (p.canal === 'Correo') cuerpo.reply_to = p.contacto;
  if (audio) {
    const ext = (audio.type || '').includes('mp4') ? 'm4a' : 'webm';
    cuerpo.attachments = [{ filename: `propuesta-${p.id}.${ext}`, content: Buffer.from(await audio.arrayBuffer()).toString('base64') }];
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
}

// Requiere una plantilla aprobada en Meta con un parámetro de texto en el cuerpo.
// Sin WHATSAPP_TOKEN / WHATSAPP_PHONE_ID / STUDIO_WHATSAPP no hace nada.
async function avisarWhatsApp(p, hayAudio) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, STUDIO_WHATSAPP, WHATSAPP_TEMPLATE = 'nueva_propuesta', WHATSAPP_TEMPLATE_LANG = 'es' } = process.env;
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !STUDIO_WHATSAPP) return;

  const resumen = [
    `#${p.id}`,
    p.idea ? `Idea: ${p.idea}` : `Nota de voz de ${mmss(p.duracion)} (en el correo)`,
    hayAudio && p.idea ? 'También mandó nota de voz (en el correo)' : '',
    `Responder por ${p.canal}: ${p.contacto}`,
    `Presupuesto: ${p.presupuesto}`,
  ].filter(Boolean).join(' · ').replace(/\s+/g, ' ').slice(0, 1000);

  const r = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: STUDIO_WHATSAPP.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE,
        language: { code: WHATSAPP_TEMPLATE_LANG },
        components: [{ type: 'body', parameters: [{ type: 'text', text: resumen }] }],
      },
    }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
}
