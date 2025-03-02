'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  city: string;
  age: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileError, setProfileError] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setProfile(null);
        setProfileError(true);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      setError(err as Error);
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>, addictionVisibility: Record<string, boolean>) => {
    try {
      setLoading(true);

      const { data: profileDataResponse, error: profileError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', profileData.id);

      if (profileError) throw profileError;

      const addictionUpdates = Object.entries(addictionVisibility).map(([id, visible]) =>
        supabase
          .from('addictions')
          .update({ visible })
          .eq('id', id)
      );

      await Promise.all(addictionUpdates);

      if (profileDataResponse) {
        setProfile(profileDataResponse[0]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, fetchProfile, profileError, updateProfile };
}

export function usePublicProfile(username: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setProfileError(true);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  return { profile, loading, error, profileError };
}
