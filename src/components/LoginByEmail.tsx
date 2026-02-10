import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

export function LoginByEmail() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Digite seu e-mail', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const password = email + '_mgm_2026';
      await signIn(email, password);
      toast({ title: '👋 Bem-vinda de volta!' });
    } catch {
      toast({ title: 'E-mail não encontrado', description: 'Verifique o e-mail ou faça seu cadastro acima.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-sm text-muted-foreground font-body hover:text-foreground transition-colors underline underline-offset-4"
      >
        Já tenho cadastro
      </button>
    );
  }

  return (
    <form onSubmit={handleLogin} className="glass rounded-2xl p-6 md:p-8 shadow-elevated space-y-4">
      <p className="text-center font-display text-lg font-bold text-foreground">
        Acessar minha conta
      </p>
      <Input
        type="email"
        placeholder="Digite seu e-mail de cadastro"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-background/70 border-border/50 h-12 font-body rounded-xl focus:ring-2 focus:ring-secondary/30 transition-all"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-sm font-body font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-glow rounded-xl transition-all duration-300 hover:shadow-elevated hover:scale-[1.01]"
      >
        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
        {loading ? 'Entrando...' : 'ENTRAR'}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="w-full text-center text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
      >
        Voltar para cadastro
      </button>
    </form>
  );
}
