import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SignupForm } from '@/components/SignupForm';
import { LoginByEmail } from '@/components/LoginByEmail';
import { FriendSignup } from '@/components/FriendSignup';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  const { user, loading } = useAuth();
  const { data: settings } = useSettings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ref] = useState(searchParams.get('ref') || '');

  const isFriend = !!ref;

  useEffect(() => {
    if (!loading && user && !isFriend) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, isFriend]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse-slow text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top login link */}
      <div className="w-full flex justify-end px-6 pt-4 min-h-[2.5rem]">
        {!isFriend && <LoginByEmail variant="top" />}
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center min-h-[90vh] justify-center">
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
          {isFriend ? 'VOCÊ FOI CONVIDADA!' : 'INDIQUE E GANHE!'}
        </h1>

        {/* Offer banner */}
        <div className={`bg-foreground text-background font-body font-bold text-base md:text-xl px-8 md:px-12 py-3.5 rounded-full text-center tracking-wider shadow-elevated ${isFriend ? 'mb-10' : 'mb-5'}`}>
          {isFriend ? 'GRUPO VIP MANIA DE MULHER' : 'INDIQUE AMIGAS E GANHE PRESENTES'}
        </div>

        {!isFriend && (
          <>

            {/* Subtitle */}
            <p className="text-muted-foreground font-body text-sm md:text-base text-center mb-8 leading-relaxed">
              Indique amigas para o nosso Grupo VIP do WhatsApp e desbloqueie cupons.
            </p>

            {/* Countdown label */}
            <p className="text-center text-xs md:text-sm text-muted-foreground font-body font-semibold mb-4 uppercase tracking-[0.2em]">
              O site fecha em
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <CountdownTimer targetDate={settings?.countdown_end || '2026-03-01T23:59:59'} />
            </div>
          </>
        )}

        {/* Formulário */}
        <div className="w-full max-w-md glass rounded-2xl p-8 md:p-10 shadow-elevated">
          {isFriend ? (
            <FriendSignup referralCode={ref} />
          ) : (
            <>
              <div className="text-center mb-7">
                <h2 className="font-display text-xl font-bold text-foreground">Quero participar</h2>
                <p className="text-sm text-muted-foreground font-body mt-1.5">
                  Cadastre-se para receber o seu link de indicação
                </p>
              </div>
              <SignupForm />
            </>
          )}
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
