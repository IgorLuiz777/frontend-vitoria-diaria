'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  daily_target: number;
  goal_days: number;
  check_ins: number;
  streak: number;
  progress: number;
  visible: boolean;
  created_at: string;
  user_id: string;
}

export interface GoalFormData {
  name: string;
  icon: string;
  description?: string;
  dailyTarget: string;
  goalDays: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setGoals([]);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (formData: GoalFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado para criar uma meta');
        return null;
      }

      // Map icon name to icon string
      const iconMap: Record<string, string> = {
        'book': 'BookOpen',
        'exercise': 'Dumbbell',
        'meditation': 'Brain',
        'water': 'Droplets',
        'sleep': 'Moon',
        'coding': 'Code',
        'writing': 'PenLine',
        'other': 'Target'
      };

      const icon = formData.icon || 'other';

      const newGoal = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        icon: iconMap[icon] || 'Target',
        daily_target: parseFloat(formData.dailyTarget),
        goal_days: parseInt(formData.goalDays),
        check_ins: 0,
        streak: 0,
        progress: 0,
        visible: true
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast.error('Perfil não encontrado. Por favor, atualize seu perfil primeiro.');
        return null;
      }

      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Meta criada com sucesso!');
      await fetchGoals();
      return data;
    } catch {
      toast.error('Erro ao criar meta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const performCheckIn = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado para fazer check-in');
        return false;
      }

      // Get the goal
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user owns this goal
      if (goal.user_id !== user.id) {
        toast.error('Você não tem permissão para fazer check-in nesta meta');
        return false;
      }

      // Create check-in record
      const today = new Date().toISOString().split('T')[0];

      const { data: existingCheckIn, error: checkError } = await supabase
        .from('goal_check_ins')
        .select('*')
        .eq('goal_id', goalId)
        .eq('date', today)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCheckIn) {
        toast.info('Você já fez check-in hoje!');
        return false;
      }

      // Create check-in
      const { error: insertError } = await supabase
        .from('goal_check_ins')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          date: today
        });

      if (insertError) throw insertError;

      // Update goal stats
      const newCheckIns = goal.check_ins + 1;
      const newStreak = goal.streak + 1;
      const newProgress = Math.min(100, Math.round((newStreak / goal.goal_days) * 100));

      const { error: updateError } = await supabase
        .from('goals')
        .update({
          check_ins: newCheckIns,
          streak: newStreak,
          progress: newProgress
        })
        .eq('id', goalId);

      if (updateError) throw updateError;

      toast.success('Check-in realizado com sucesso!');
      await fetchGoals();
      return true;
    } catch {
      toast.error('Erro ao realizar check-in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalVisibility = async (goalId: string, visible: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado para alterar a visibilidade da meta');
        return false;
      }

      const { error } = await supabase
        .from('goals')
        .update({ visible })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Visibilidade da meta alterada com sucesso!');
      await fetchGoals();
      return true;
    } catch {
      toast.error('Erro ao alterar a visibilidade da meta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    performCheckIn,
    toggleGoalVisibility
  };
}

export function usePublicGoals(userId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPublicGoals = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('visible', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setGoals(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicGoals();
    }
  }, [userId]);

  return { goals, loading, error };
}
