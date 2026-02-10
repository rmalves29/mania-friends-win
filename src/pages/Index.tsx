import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SignupForm } from '@/components/SignupForm';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const { user, loading } = useAuth();
  const { data: settings } = useSettings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ref] = useState(searchParams.get('ref') || '');

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse-slow text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-2xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen justify-center">
        {/* Logo */}
        <div className="mb-8">
          <img src={logo} alt="Mania de Mulher" className="h-24 md:h-32 mx-auto" />
        </div>

        {/* Evento Exclusivo badge */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-4 w-4 text-secondary" />
          <span className="font-body text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
            Evento Exclusivo
          </span>
          <Sparkles className="h-4 w-4 text-secondary" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-6xl font-extrabold italic text-foreground text-center mb-5 leading-tight">
          INDIQUE E GANHE!
        </h1>

        {/* Offer banner */}
        <div className="bg-foreground text-background font-body font-bold text-base md:text-xl px-8 md:px-12 py-3.5 rounded-full mb-5 text-center tracking-wider shadow-elevated">
          INDIQUE AMIGAS E GANHE PRÊMIOS
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground font-body text-sm md:text-base text-center mb-8 leading-relaxed">
          Somente para quem estiver no grupo vip do WhatsApp!
        </p>

        {/* Countdown label */}
        <p className="text-center text-xs md:text-sm text-muted-foreground font-body font-semibold mb-4 uppercase tracking-[0.2em]">
          O site fecha em
        </p>

        {/* Countdown */}
        <div className="mb-12">
          <CountdownTimer targetDate={settings?.countdown_end || '2026-03-01T23:59:59'} />
        </div>

        {/* Signup Form */}
        <div className="w-full max-w-md glass rounded-2xl p-8 md:p-10 shadow-elevated">
          <div className="text-center mb-7">
            <h2 className="font-display text-xl font-bold text-foreground">
              Garanta seu lugar agora
            </h2>
            <p className="text-sm text-muted-foreground font-body mt-1.5">
              Preencha seus dados e comece a ganhar
            </p>
          </div>
          <SignupForm referralCode={ref} />
        </div>

        {/* Trust */}
        <p className="text-xs text-muted-foreground font-body mt-8 text-center tracking-wide">
          🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <p className="text-center text-xs text-muted-foreground font-body tracking-wide">
          © 2026 Mania de Mulher · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Index;
