import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the MercadoPago configuration with the access token
const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.NEXT_PUBLIC_MERCADO_PAGO_ACCESS_TOKEN as string,
});

export interface CreatePreferenceParams {
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    description?: string;
  }[];
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
}

export async function createPreference(params: CreatePreferenceParams) {
  try {
    const preference = new Preference(mercadoPagoClient);

    const preferenceData = {
      items: params.items,
      payer: params.payer,
      back_urls: params.back_urls,
      auto_return: params.auto_return,
      external_reference: params.external_reference,
      notification_url: params.notification_url,
    };

    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    throw error;
  }
}

export function getMercadoPagoPublicKey() {
  return process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
}
