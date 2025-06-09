import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Insight {
  id: string;
  type: 'performance' | 'pattern' | 'risk' | 'recommendation';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'success';
  createdAt: Date;
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateInsights = async () => {
    if (!user) {
      setError('User not authenticated');
      return { error: 'User not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current session to include the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      // Transform the insights to include proper dates
      const transformedInsights: Insight[] = data.insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        type: insight.type || 'recommendation',
        title: insight.title || 'Trading Insight',
        content: insight.content,
        severity: insight.severity || 'info',
        createdAt: new Date(),
      }));

      setInsights(transformedInsights);
      return { insights: transformedInsights, error: null };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredInsights = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const transformedInsights: Insight[] = (data || []).map((insight) => ({
        id: insight.id,
        type: insight.insight_type as any,
        title: insight.content.split('.')[0] + '.',
        content: insight.content,
        severity: 'info' as const,
        createdAt: new Date(insight.created_at),
      }));

      setInsights(transformedInsights);
    } catch (err) {
      console.error('Error fetching stored insights:', err);
    }
  };

  const clearInsights = () => {
    setInsights([]);
    setError(null);
  };

  return {
    insights,
    loading,
    error,
    generateInsights,
    fetchStoredInsights,
    clearInsights,
  };
}