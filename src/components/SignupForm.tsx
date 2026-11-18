import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isValidPhone, maskPhone } from '@/lib/referral';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gift } from 'lucide-react';

interface SignupFormProps {
  referralCode?: string;
}

export function SignupForm(_props: SignupFormProps = {}) {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    if (!isValidPhone(form.whatsapp)) {
      toast({ title: 'WhatsApp inválido', description: 'Use DDD + número, ex.: (31) 99999-9999', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const password = form.email + '_mgm_2026';
      try {
        await signUp(form.email, password, form.name, form.whatsapp);
        toast({ title: '🎉 Bem-vinda!', description: 'Sua conta foi criada com sucesso!' });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '';
        // Handle all "user exists" variations: auth error or profile duplicate key
        if (
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('duplicate key') ||
          errorMessage.includes('unique constraint')
        ) {
          await signIn(form.email, password);
          toast({ title: '👋 Bem-vinda de volta!' });
        } else {
          throw err;
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground font-body text-sm font-medium">Nome Completo</Label>
        <Input
          id="name"
          placeholder="Seu nome completo"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="bg-background/70 border-border/50 h-12 font-body rounded-xl focus:ring-2 focus:ring-secondary/30 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-body text-sm font-medium">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="bg-background/70 border-border/50 h-12 font-body rounded-xl focus:ring-2 focus:ring-secondary/30 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-foreground font-body text-sm font-medium">WhatsApp</Label>
        <Input
          id="whatsapp"
          placeholder="(00) 00000-0000"
          value={form.whatsapp}
          onChange={(e) => setForm(prev => ({ ...prev, whatsapp: maskPhone(e.target.value) }))}
          inputMode="tel"
          className="bg-background/70 border-border/50 h-12 font-body rounded-xl focus:ring-2 focus:ring-secondary/30 transition-all"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 text-base font-body font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-glow rounded-xl transition-all duration-300 hover:shadow-elevated hover:scale-[1.01]"
      >
        {loading ? (
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
        ) : (
          <Gift className="mr-2 h-5 w-5" />
        )}
        {loading ? 'Entrando...' : 'QUERO PARTICIPAR'}
      </Button>
    </form>
  );
}
