import { NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp-service';

/**
 * 🎻 Détaché - Batch Cleanup Task
 * Cron to be executed daily at 20:00.
 * It identifies pre-reservations without payment and notifies slot release.
 */

export async function GET(req: Request) {
  // Verificación de seguridad (Ejemplo: AUTH_TOKEN)
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  
  if (token !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Iniciando limpieza de pre-reservas vencidas (20:00)');

    // 1. Obtener leads en estado PRE_RESERVA desde Django
    // const preReservas = await apiClient.graphql(`query { ... }`);
    
    // MOCK DATA para demostración
    const expiredLeads = [
       { id: 'L101', name: 'Alvaro Soler', phone: '56911223344' },
       { id: 'L102', name: 'Lucia Galan', phone: '56955667788' }
    ];

    const results = [];

    for (const lead of expiredLeads) {
       // A. Notificar por WhatsApp
       const wa = await whatsappService.sendSlotReleaseNotice(lead.phone, lead.name);
       
       // B. Actualizar estado en Django a 'SIN_RESPUESTA' o 'LIBRE'
       // await apiClient.graphql(`mutation { ... }`);
       
       results.push({ leadId: lead.id, waSent: wa.success });
    }

    return NextResponse.json({ 
      status: 'COMPLETED', 
      processed: expiredLeads.length,
      details: results
    });

  } catch (error) {
    console.error('[Cron Error]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
