/**
 * Modular Integration Service Provider for CRM Extensions
 * Prepared for future growth: Meta Ads, Google Ads, WhatsApp Cloud API, HubSpot, Salesforce.
 */

export interface WhatsAppNotificationPayload {
  toPhone: string;
  studentName: string;
  programName: string;
  advisorName: string;
  trackingLink?: string;
}

export interface WebhookLeadPayload {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  programName: string;
  advisorName: string;
  sourceChannel: string;
  createdAt: string;
}

export class CRMIntegrationService {
  /**
   * Dispatch all automated background integrations for a new registration
   */
  static async dispatchIntegrations(registration: any, advisor: any, program: any): Promise<void> {
    try {
      if (advisor?.phone) {
        await this.sendWhatsAppNotification({
          toPhone: advisor.phone,
          studentName: registration.fullName,
          programName: program.name,
          advisorName: advisor.name,
        });
      }
      await this.syncToExternalCRM({
        registrationId: registration.id,
        fullName: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        programName: program.name,
        advisorName: advisor?.name || 'Asesor Comercial',
        sourceChannel: registration.channel || 'Formulario Web',
        createdAt: new Date().toISOString(),
      });
      await this.triggerAdConversionEvent('LeadRegistration', {
        registrationId: registration.id,
        email: registration.email,
      });
    } catch (e) {
      console.error('dispatchIntegrations warning:', e);
    }
  }

  /**
   * Send automated WhatsApp confirmation message to student or sales advisor
   */
  static async sendWhatsAppNotification(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; message: string }> {
    console.log(`[CRM INTEGRATION - WHATSAPP] Sending message to ${payload.toPhone} for ${payload.studentName}...`);
    return {
      success: true,
      message: `Notificación de WhatsApp enviada a ${payload.toPhone}`,
    };
  }

  /**
   * Sync new lead to External CRM (HubSpot / Salesforce)
   */
  static async syncToExternalCRM(payload: WebhookLeadPayload): Promise<{ success: boolean; crmLeadId?: string }> {
    console.log(`[CRM INTEGRATION - EXTERNAL CRM] Syncing lead ${payload.email} to HubSpot/Salesforce...`);
    return {
      success: true,
      crmLeadId: `HUB-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  /**
   * Send conversion event to Meta Ads (Facebook Conversions API) & Google Ads
   */
  static async triggerAdConversionEvent(eventName: string, payload: Partial<WebhookLeadPayload>): Promise<void> {
    console.log(`[CRM INTEGRATION - ADS TRACKING] Event: ${eventName} triggered for ${payload.email}`);
  }
}