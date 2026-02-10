import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Users, Settings, Gift } from 'lucide-react';

interface Reward {
  id: string;
  milestone: number;
  title: string;
  description: string | null;
  coupon_code: string | null;
}

interface UserRow {
  name: string;
  email: string;
  referral_count: number;
  whatsapp: string | null;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'rewards' | 'users'>('settings');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const sb = supabase as any;
    const [settingsRes, rewardsRes, usersRes] = await Promise.all([
      sb.from('site_settings').select('key, value'),
      sb.from('rewards').select('*').order('sort_order'),
      sb.from('profiles').select('name, email, referral_count, whatsapp, created_at').order('referral_count', { ascending: false }),
    ]);

    const s: Record<string, string> = {};
    (settingsRes.data as { key: string; value: unknown }[] || []).forEach((row) => {
      s[row.key] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
    });
    setSettings(s);
    setRewards((rewardsRes.data as Reward[]) || []);
    setUsers((usersRes.data as UserRow[]) || []);
  };

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      let jsonValue: unknown;
      try { jsonValue = JSON.parse(value); } catch { jsonValue = value; }
      const { error } = await (supabase as any).from('site_settings').update({ value: jsonValue, updated_at: new Date().toISOString() }).eq('key', key);
      if (error) throw error;
      toast({ title: `✅ ${key} salvo!` });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveReward = async (reward: Reward) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any).from('rewards').update({
        title: reward.title,
        description: reward.description,
        coupon_code: reward.coupon_code,
        milestone: reward.milestone,
      }).eq('id', reward.id);
      if (error) throw error;
      toast({ title: '✅ Prêmio atualizado!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const tabs = [
    { id: 'settings' as const, label: 'Configurações', icon: Settings },
    { id: 'rewards' as const, label: 'Prêmios', icon: Gift },
    { id: 'users' as const, label: 'Usuários', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Painel Admin</h1>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="font-body"
            >
              <tab.icon className="mr-2 h-4 w-4" /> {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {[
              { key: 'countdown_end', label: 'Data Final do Cronômetro', type: 'text' },
              { key: 'whatsapp_link', label: 'Link do Grupo WhatsApp', type: 'url' },
              { key: 'collective_goal', label: 'Meta Coletiva (número)', type: 'number' },
              { key: 'collective_goal_badge', label: 'Badge da Meta Coletiva (ex: 🏆 Meta Coletiva)', type: 'text' },
              { key: 'collective_goal_title', label: 'Título da Meta Coletiva', type: 'text' },
              { key: 'collective_goal_subtitle', label: 'Subtítulo da Meta Coletiva', type: 'text' },
              { key: 'collective_goal_reward_text', label: 'Texto do Prêmio da Meta Coletiva', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key} className="bg-card rounded-xl p-4 border border-border">
                <Label className="font-body font-bold">{label}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type={type}
                    value={settings[key] || ''}
                    onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                    className="bg-background font-body"
                  />
                  <Button onClick={() => saveSetting(key, settings[key])} disabled={saving} size="icon" className="shrink-0 bg-secondary text-secondary-foreground">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {rewards.map((reward, i) => (
              <div key={reward.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs">Milestone</Label>
                    <Input type="number" value={reward.milestone} onChange={e => {
                      const updated = [...rewards];
                      updated[i] = { ...updated[i], milestone: parseInt(e.target.value) || 0 };
                      setRewards(updated);
                    }} className="bg-background font-body" />
                  </div>
                  <div>
                    <Label className="font-body text-xs">Cupom</Label>
                    <Input value={reward.coupon_code || ''} onChange={e => {
                      const updated = [...rewards];
                      updated[i] = { ...updated[i], coupon_code: e.target.value };
                      setRewards(updated);
                    }} className="bg-background font-body" />
                  </div>
                </div>
                <div>
                  <Label className="font-body text-xs">Título</Label>
                  <Input value={reward.title} onChange={e => {
                    const updated = [...rewards];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setRewards(updated);
                  }} className="bg-background font-body" />
                </div>
                <div>
                  <Label className="font-body text-xs">Descrição</Label>
                  <Input value={reward.description || ''} onChange={e => {
                    const updated = [...rewards];
                    updated[i] = { ...updated[i], description: e.target.value };
                    setRewards(updated);
                  }} className="bg-background font-body" />
                </div>
                <Button onClick={() => saveReward(reward)} disabled={saving} className="w-full bg-secondary text-secondary-foreground font-body" size="sm">
                  <Save className="mr-2 h-4 w-4" /> Salvar Prêmio
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted border-b border-border font-body text-sm font-bold">
              Total: {users.length} usuários
            </div>
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {users.map((u, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-body font-bold text-foreground text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{u.email} • {u.whatsapp}</p>
                  </div>
                  <span className="bg-secondary/20 text-secondary-foreground font-display font-bold px-3 py-1 rounded-full text-sm">
                    {u.referral_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
