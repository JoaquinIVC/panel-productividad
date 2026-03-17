'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ActivityLog } from '@/types/database';

interface UseActivityReturn {
  activities: ActivityLog[];
  loading: boolean;
  error: string | null;
  fetchActivities: (limit?: number) => Promise<void>;
  logActivity: (description: string, entityType: string) => Promise<void>;
}

export function useActivity(limit: number = 20): UseActivityReturn {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchActivities = useCallback(async (fetchLimit?: number) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(fetchLimit ?? limit);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  }, [supabase, limit]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      Promise.resolve().then(() => fetchActivities());
    }
    return () => { isMounted = false; };
  }, [fetchActivities]);

  const logActivity = async (description: string, entityType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from('activity_log').insert({
      user_id: user.id,
      action_description: description,
      entity_type: entityType,
    });

    if (err) {
      setError(err.message);
    } else {
      await fetchActivities();
    }
  };

  return { activities, loading, error, fetchActivities, logActivity };
}
