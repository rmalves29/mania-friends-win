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
      <div className="container max-w-lg mx-auto px-4 py-8 flex flex-col items-center min-h-screen justify-center">
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <img src={logo} alt="Mania de Mulher" className="h-24 md:h-32 mx-auto mb-2" />
          <p className="text-muted-foreground font-body">
            Indique amigas e ganhe prêmios exclusivos
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-8">
          <p className="text-center text-sm text-muted-foreground font-display font-bold mb-3 uppercase tracking-wider">
            O site fecha em
          </p>
          <CountdownTimer targetDate={settings?.countdown_end || '2026-03-01T23:59:59'} />
        </div>

        {/* Signup Form */}
        <div className="w-full bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-soft border border-border">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-gold mx-auto mb-2" />
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
