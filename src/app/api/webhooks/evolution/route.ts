import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { whatsappService } from '@/lib/whatsapp-service';

/**
 * Endpoint para capturar webhooks de Evolution API.
 * Configura en Evolution API: http://tu-dominio.com/api/webhooks/evolution
 * Evento: messages.upsert
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data, instance } = body;

    console.log(`[Webhook Evolution] Evento: ${event} | Instancia: ${instance}`);

    // Procesar solo mensajes entrantes (no enviados por el bot)
    if (event === 'messages.upsert' && !data.key?.fromMe) {
      const phone = data.key?.remoteJid?.split('@')[0];
      const name = data.pushName || 'Prospecto Web';
      const message = data.message?.conversation || data.message?.extendedTextMessage?.text || '';

      if (!phone) return NextResponse.json({ status: 'ERR', message: 'No phone found' });

      // 1. Intentar registrar lead en Django (Mock logic via GraphQL)
      try {
        console.log(`[Webhook Evolution] Registrando lead: ${name} (${phone})`);
        
        // Aquí llamaríamos a una mutación real de Django
        // await apiClient.graphql(`mutation CreateLead(...)`, { ... });
        
        // 2. Enviar respuesta automática de bienvenida
        await whatsappService.sendWelcome(phone, name, 'CLASE_PRUEBA');
        
        console.log(`[Webhook Evolution] Lead registrado y mensaje de bienvenida enviado.`);
      } catch (err) {
        console.error('[Webhook Evolution] Error registrando lead:', err);
      }

      return NextResponse.json({ 
        status: 'SUCCESS', 
        processed: true,
        lead: { phone, name }
      });
    }

    return NextResponse.json({ status: 'IGNORED' });

  } catch (error) {
    console.error('[Webhook Evolution] Error critico:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
