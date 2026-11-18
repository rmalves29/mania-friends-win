import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Users, Settings, Gift, Trophy, Plus, Trash2 } from 'lucide-react';
import AdminUsers, { type UserRow } from '@/components/AdminUsers';
import AdminReferrals from '@/components/AdminReferrals';

interface Reward {
  id: string;
  milestone: number;
  title: string;
  description: string | null;
  coupon_code: string | null;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activeTab, setActiveTab] = useState<'referrals' | 'settings' | 'rewards' | 'users'>('referrals');

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
      sb.from('profiles').select('id, name, email, referral_count, whatsapp, created_at').order('referral_count', { ascending: false }),
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
      toast({ title: '✅ Presente atualizado!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addReward = async () => {
    setSaving(true);
    try {
      const nextMilestone = rewards.length ? Math.max(...rewards.map((r) => r.milestone)) + 5 : 3;
      const { data, error } = await (supabase as any)
        .from('rewards')
        .insert({
          title: 'Novo presente',
          description: '',
          coupon_code: '',
          milestone: nextMilestone,
          sort_order: rewards.length + 1,
          is_active: true,
        })
        .select('*')
        .single();
      if (error) throw error;
      setRewards((prev) => [...prev, data as Reward]);
      toast({ title: '🎁 Presente criado!', description: 'Preencha os dados e clique em Salvar.' });
    } catch {
      toast({ title: 'Erro ao criar presente', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async (reward: Reward) => {
    if (!window.confirm(`Excluir o presente "${reward.title}"?`)) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from('rewards').delete().eq('id', reward.id);
      if (error) throw error;
      setRewards((prev) => prev.filter((r) => r.id !== reward.id));
      toast({ title: 'Presente excluído' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
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
    { id: 'referrals' as const, label: 'Indicações', icon: Trophy },
    { id: 'settings' as const, label: 'Configurações', icon: Settings },
    { id: 'rewards' as const, label: 'Presentes', icon: Gift },
    { id: 'users' as const, label: 'Usuários', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Painel Admin</h1>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
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

        {activeTab === 'referrals' && <AdminReferrals />}

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
            <Button onClick={addReward} disabled={saving} className="w-full font-body" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Adicionar presente
            </Button>
            {rewards.length === 0 && (
              <p className="text-center text-sm text-muted-foreground font-body py-4">Nenhum presente cadastrado.</p>
            )}
            {rewards.map((reward, i) => (
              <div key={reward.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-xs">Meta (amigas que entraram no grupo)</Label>
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
                <div className="flex gap-2">
                  <Button onClick={() => saveReward(reward)} disabled={saving} className="flex-1 bg-secondary text-secondary-foreground font-body" size="sm">
                    <Save className="mr-2 h-4 w-4" /> Salvar presente
                  </Button>
                  <Button onClick={() => deleteReward(reward)} disabled={saving} variant="outline" size="sm" className="font-body text-destructive" aria-label="Excluir presente">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <AdminUsers users={users} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
};

export default Admin;
