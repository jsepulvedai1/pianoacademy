/**
 * 🎻 Détaché - WhatsApp Automation Service
 * Handles templated communications via Evolution API.
 */

import { apiClient } from "./api-client";
import { WA_TEMPLATES, serviceLabel } from "./mock-data";

export const whatsappService = {
  /**
   * Envía mensaje de respuesta inicial a un nuevo Lead.
   */
  async sendWelcome(phone: string, name: string, serviceKey: any) {
    const firstName = name.split(' ')[0];
    const serviceName = (serviceLabel as Record<string, string>)[serviceKey as string] || "nuestros cursos";
    const message = WA_TEMPLATES.RESPUESTA_INICIAL(firstName, serviceName);
    
    return this.sendMessage(phone, message);
  },

  /**
   * Notificación de Pre-reserva realizada.
   */
  async sendBookingConfirmation(phone: string, name: string, date: string, time: string) {
    const firstName = name.split(' ')[0];
    // Nota: PRE_RESERVA template requiere nombre, fecha, hora, profesor
    const message = WA_TEMPLATES.PRE_RESERVA(firstName, date, time, "tu profesor asignado");
    
    return this.sendMessage(phone, message);
  },

  /**
   * Recordatorio de vencimiento de cupo (20:00 hrs).
   */
  async sendSlotReleaseNotice(phone: string, name: string) {
    const firstName = name.split(' ')[0];
    const message = WA_TEMPLATES.LIBERACION_CUPO(firstName);
    
    return this.sendMessage(phone, message);
  },

  /**
   * Helper genérico para enviar texto a través de Evolution API.
   */
  async sendMessage(phone: string, text: string) {
    const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || "MainInstance";
    try {
      const data = await apiClient.evolution(`/message/sendText/${instanceName}`, 'POST', {
        number: phone,
        text: text
      });
      return { success: !!data.key, data };
    } catch (error) {
      console.error("WhatsApp Send Error:", error);
      return { success: false, error };
    }
  }
};
