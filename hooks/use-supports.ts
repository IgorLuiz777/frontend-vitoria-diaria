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
}

export function useSupports() {
  const [loading, setLoading] = useState(false);

  const createSupport = async (recipientId: string, formData: SupportFormData) => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      const newSupport = {
        supporter_id: user?.id || null,
        recipient_id: recipientId,
        addiction_id: formData.addictionId || null,
        message: formData.message,
        duration: parseInt(formData.duration),
        amount: parseFloat(formData.amount),
        supporter_name: formData.supporterName || null,
        hide_amount: formData.hideAmount,
        completed: false
      };

      const { data, error } = await supabase
        .from('supports')
        .insert(newSupport)
        .select()
        .single();

      if (error) throw error;

      toast.success('Apoio enviado com sucesso!');
      return data;
    } catch (err) {
      console.error('Error creating support:', err);
      toast.error('Erro ao enviar apoio');
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
      console.error('Error fetching received supports:', err);
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
      console.error('Error fetching sent supports:', err);
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
          addiction:addictions!addiction_id(name, icon)
        `)
        .eq('recipient_id', userId)
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
      console.error('Error fetching public supports:', err);
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
