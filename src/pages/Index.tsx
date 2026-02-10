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
      <div className="container max-w-2xl mx-auto px-4 py-8 flex flex-col items-center min-h-screen justify-center">
        {/* Logo */}
        <div className="mb-6">
          <img src={logo} alt="Mania de Mulher" className="h-24 md:h-32 mx-auto" />
        </div>

        {/* Evento Exclusivo badge */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-secondary" />
          <span className="font-display text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-secondary">
            Evento Exclusivo
          </span>
          <Sparkles className="h-5 w-5 text-secondary" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-6xl font-extrabold italic text-foreground text-center mb-4 leading-tight">
          O SITE VAI FECHAR!
        </h1>

        {/* Offer banner */}
        <div className="bg-foreground text-background font-display text-lg md:text-2xl font-bold px-6 md:px-10 py-3 rounded-full mb-4 text-center tracking-wide shadow-soft">
          INDIQUE AMIGAS E GANHE PRÊMIOS
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground font-body text-sm md:text-base text-center mb-6">
          Somente para quem estiver no grupo vip do WhatsApp!
        </p>

        {/* Countdown label */}
        <p className="text-center text-xs md:text-sm text-muted-foreground font-display font-bold mb-3 uppercase tracking-[0.15em]">
          O site fecha em
        </p>

        {/* Countdown */}
        <div className="mb-10">
          <CountdownTimer targetDate={settings?.countdown_end || '2026-03-01T23:59:59'} />
        </div>

        {/* Signup Form */}
        <div className="w-full max-w-md bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-soft border border-border">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">
              Garanta seu lugar agora
            </h2>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Preencha seus dados e comece a ganhar
            </p>
          </div>
          <SignupForm referralCode={ref} />
        </div>

        {/* Trust */}
        <p className="text-xs text-muted-foreground font-body mt-6 text-center">
          🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
        </p>
      </div>
    </div>
  );
};

export default Index;
