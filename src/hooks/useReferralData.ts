import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ReferralStatus } from '@/lib/referral';

export interface ReferralStats {
  total: number;
  joined: number;
  pending: number;
  rejected: number;
}

export interface MyReward {
  id: string;
  milestone: number;
  title: string;
  description: string | null;
  coupon_code: string | null;
  unlocked: boolean;
}

export interface MyReferral {
  id: string;
  name: string;
  status: ReferralStatus;
  reject_reason: string | null;
  created_at: string;
  joined_at: string | null;
}

const sb = supabase as any;

export function useReferralStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['referral-stats', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ReferralStats> => {
      const { data, error } = await sb.rpc('get_my_referral_stats');
      if (error) throw error;
      return data as ReferralStats;
    },
  });
}

export function useMyRewards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-rewards', user?.id ?? 'anon'],
    queryFn: async (): Promise<MyReward[]> => {
      const { data, error } = await sb.rpc('get_my_rewards');
      if (error) throw error;
      return (data as MyReward[]) || [];
    },
  });
}

export function useMyReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-referrals', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MyReferral[]> => {
      const { data, error } = await sb
        .from('referrals')
        .select('id, name, status, reject_reason, created_at, joined_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as MyReferral[]) || [];
    },
  });
}
