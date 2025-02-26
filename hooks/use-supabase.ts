'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Disable email confirmatio
      }
    });
    
    if (!error && data.user) {
      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: userData.username,
          name: userData.name,
          bio: userData.bio || '',
          city: userData.city,
          age: parseInt(userData.age),
          image_url: userData.image_url || ''
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
        setError(error);
        setLoading(false);
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        setProfile(data);
        setError(error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export function useAddictions(userId?: string) {
  const [addictions, setAddictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchAddictions = async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('addictions')
          .select('*, check_ins(*)')
          .eq('user_id', user.id);
        
        setAddictions(data || []);
        setError(error);
        setLoading(false);
      } else {
        const { data, error } = await supabase
          .from('addictions')
          .select('*, check_ins(*)')
          .eq('user_id', userId)
          .eq('visible', true);
        
        setAddictions(data || []);
        setError(error);
        setLoading(false);
      }
    };

    fetchAddictions();
  }, [userId]);

  return { addictions, loading, error };
}