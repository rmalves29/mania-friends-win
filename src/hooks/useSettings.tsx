import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  countdown_end: string;
  whatsapp_link: string;
  collective_goal: number;
  collective_goal_badge: string;
  collective_goal_title: string;
  collective_goal_subtitle: string;
  collective_goal_reward_text: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await (supabase as any)
        .from('site_settings')
        .select('key, value');
      if (error) throw error;

      const settings: Record<string, unknown> = {};
      (data as { key: string; value: unknown }[])?.forEach((row) => {
        settings[row.key] = row.value;
      });

      return {
        countdown_end: (settings.countdown_end as string) || '2026-03-01T23:59:59',
        whatsapp_link: (settings.whatsapp_link as string) || '',
        collective_goal: (settings.collective_goal as number) || 1000,
        collective_goal_badge: (settings.collective_goal_badge as string) || '🏆 Meta Coletiva',
        collective_goal_title: (settings.collective_goal_title as string) || 'Desbloqueie o SUPER CUPOM',
        collective_goal_subtitle: (settings.collective_goal_subtitle as string) || 'Juntos, vamos atingir 1.000 indicações!',
        collective_goal_reward_text: (settings.collective_goal_reward_text as string) || '50% de desconto em qualquer peça!',
        logo_url: (settings.logo_url as string) || '',
        primary_color: (settings.primary_color as string) || '#8B6F5C',
        accent_color: (settings.accent_color as string) || '#D4A69A',
        background_color: (settings.background_color as string) || '#FDF8F4',
      };
    },
    staleTime: 60000,
  });
}
