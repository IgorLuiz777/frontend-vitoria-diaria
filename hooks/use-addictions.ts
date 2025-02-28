'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Addiction {
  id: string;
  name: string;
  icon: string;
  daily_cost: number;
  goal_days: number;
  check_ins: number;
  streak: number;
  progress: number;
  saved: number;
  visible: boolean;
  created_at: string;
  user_id: string;
}

export interface AddictionFormData {
  name: string;
  icon: string;
  dailyCost: string;
  goalDays: string;
}

export function useAddictions() {
  const [addictions, setAddictions] = useState<Addiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddictions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAddictions([]);
        return;
      }

      const { data, error } = await supabase
        .from('addictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddictions(data || []);
    } catch (err) {
      console.error('Error fetching addictions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createAddiction = async (formData: AddictionFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado para criar um controle');
        return null;
      }

      // Map icon name to icon string
      const iconMap: Record<string, string> = {
        'cigarette': 'Cigarette',
        'alcohol': 'Beer',
        'caffeine': 'Coffee',
        'shopping': 'ShoppingBag',
        'social-media': 'Smartphone',
        'gaming': 'Gamepad',
        'sugar': 'Candy',
        'other': 'Ban'
      };

      const icon = formData.icon || 'other';

      const newAddiction = {
        user_id: user.id,
        name: formData.name,
        icon: iconMap[icon] || 'Ban',
        daily_cost: parseFloat(formData.dailyCost),
        goal_days: parseInt(formData.goalDays),
        check_ins: 0,
        streak: 0,
        progress: 0,
        saved: 0,
        visible: true
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile not found:', profileError);
        toast.error('Perfil não encontrado. Por favor, atualize seu perfil primeiro.');
        return null;
      }

      const { data, error } = await supabase
        .from('addictions')
        .insert(newAddiction)
        .select()
        .single();

      if (error) {
        console.error('Error creating addiction:', error);
        throw error;
      }

      toast.success('Controle criado com sucesso!');
      await fetchAddictions();
      return data;
    } catch (err) {
      console.error('Error creating addiction:', err);
      toast.error('Erro ao criar controle');
      return null;
    }
  };

  const performCheckIn = async (addictionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado para fazer check-in');
        return false;
      }

      // Get the addiction
      const { data: addiction, error: fetchError } = await supabase
        .from('addictions')
        .select('*')
        .eq('id', addictionId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user owns this addiction
      if (addiction.user_id !== user.id) {
        toast.error('Você não tem permissão para fazer check-in neste controle');
        return false;
      }

      // Create check-in record
      const today = new Date().toISOString().split('T')[0];

      const { data: existingCheckIn, error: checkError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('addiction_id', addictionId)
        .eq('date', today)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCheckIn) {
        toast.info('Você já fez check-in hoje!');
        return false;
      }

      // Create check-in
      const { error: insertError } = await supabase
        .from('check_ins')
        .insert({
          addiction_id: addictionId,
          user_id: user.id,
          date: today
        });

      if (insertError) throw insertError;

      // Update addiction stats
      const newCheckIns = addiction.check_ins + 1;
      const newStreak = addiction.streak + 1;
      const newProgress = Math.min(100, Math.round((newStreak / addiction.goal_days) * 100));
      const newSaved = addiction.saved + addiction.daily_cost;

      const { error: updateError } = await supabase
        .from('addictions')
        .update({
          check_ins: newCheckIns,
          streak: newStreak,
          progress: newProgress,
          saved: newSaved
        })
        .eq('id', addictionId);

      if (updateError) throw updateError;

      toast.success('Check-in realizado com sucesso!');
      await fetchAddictions();
      return true;
    } catch (err) {
      console.error('Error performing check-in:', err);
      toast.error('Erro ao realizar check-in');
      return false;
    }
  };

  useEffect(() => {
    fetchAddictions();
  }, []);

  return {
    addictions,
    loading,
    error,
    fetchAddictions,
    createAddiction,
    performCheckIn
  };
}

export function usePublicAddictions(userId: string) {
  const [addictions, setAddictions] = useState<Addiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPublicAddictions = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('addictions')
          .select('*')
          .eq('user_id', userId)
          .eq('visible', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setAddictions(data || []);
      } catch (err) {
        console.error('Error fetching public addictions:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicAddictions();
    }
  }, [userId]);

  return { addictions, loading, error };
}
