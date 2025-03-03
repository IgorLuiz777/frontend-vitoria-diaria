'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SupportFormData {
  message: string;
  duration: string;
  amount: string;
  supporterName?: string;
  hideAmount: boolean;
  addictionId?: string;
  goalId?: string;
}

export function useSupports() {
  const [loading, setLoading] = useState(false);

  const createSupport = async (recipientId: string, formData: SupportFormData) => {
    try {
      setLoading(true);

      // Create payment preference
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.amount,
          supportData: formData,
          recipientId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const { preferenceId, supportId } = await response.json();

      if (!preferenceId) {
        throw new Error('No preference ID returned');
      }

      // Check if the MercadoPago script is already appended
      if (!document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.type = 'text/javascript';
        script.onload = () => {
          // @ts-ignore
          const mp = new MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
            locale: 'pt-BR'
          });

          mp.checkout({
            preference: {
              id: preferenceId
            },
            render: {
              container: '#payment-button',
              label: 'Pagar',
            }
          });

          // Automatically click the payment button
          setTimeout(() => {
            const paymentButton = document.querySelector('.mercadopago-button');
            if (paymentButton) {
              (paymentButton as HTMLElement).click();
            }
          }, 500);
        };
        document.body.appendChild(script);
      } else {
        // If script is already loaded, directly initialize the checkout
        // @ts-ignore
        const mp = new MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
          locale: 'pt-BR'
        });

        mp.checkout({
          preference: {
            id: preferenceId
          },
          render: {
            container: '#payment-button',
            label: 'Pagar',
          }
        });

        // Automatically click the payment button
        setTimeout(() => {
          const paymentButton = document.querySelector('.mercadopago-button');
          if (paymentButton) {
            (paymentButton as HTMLElement).click();
          }
        }, 500);
      }

      // Ensure the payment button container is created only once
      if (!document.querySelector('#payment-button')) {
        const paymentButton = document.createElement('div');
        paymentButton.id = 'payment-button';
        paymentButton.style.display = 'none';
        document.body.appendChild(paymentButton);
      }

      toast.success('Redirecionando para o pagamento...');
      return { supportId, preferenceId };
    } catch (err) {
      console.error('Error creating support:', err);
      toast.error('Erro ao processar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSupport
  };
}

export function useUserSupports() {
  const [supports, setSupports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReceivedSupports = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSupports([]);
        return;
      }

      const { data, error } = await supabase
        .from('supports')
        .select(`
          *,
          supporter:users!supporter_id(name, username, image_url),
          addiction:addictions!addiction_id(name, icon)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSupports(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentSupports = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSupports([]);
        return;
      }

      const { data, error } = await supabase
        .from('supports')
        .select(`
          *,
          recipient:users!recipient_id(name, username, image_url),
          addiction:addictions!addiction_id(name, icon)
        `)
        .eq('supporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSupports(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    supports,
    loading,
    error,
    fetchReceivedSupports,
    fetchSentSupports
  };
}

export function usePublicSupports(userId: string) {
  const [supports, setSupports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPublicSupports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('supports')
        .select(`
          id,
          message,
          duration,
          amount,
          supporter_name,
          hide_amount,
          completed,
          created_at,
          payment_status,
          addiction:addictions!addiction_id(name, icon)
        `)
        .eq('recipient_id', userId)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out hidden amounts for non-completed supports
      const filteredData = data?.map(support => {
        if (support.hide_amount && !support.completed) {
          return { ...support, amount: null };
        }
        return support;
      });

      setSupports(filteredData || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    supports,
    loading,
    error,
    fetchPublicSupports
  };
}
