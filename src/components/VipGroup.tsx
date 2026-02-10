import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink } from 'lucide-react';

export function VipGroup() {
  const { data: settings } = useSettings();

  return (
    <div className="glass rounded-2xl p-8 shadow-elevated text-center hover-lift transition-all duration-300">
      <div className="bg-gold/10 p-3 rounded-full w-fit mx-auto mb-4">
        <Crown className="h-8 w-8 text-gold" />
      </div>
      <h3 className="font-display text-2xl font-bold text-foreground mb-2">Grupo VIP</h3>
      <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6">
        Entre no nosso grupo exclusivo e receba ofertas antes de todo mundo!
      </p>
      <Button
        asChild
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold text-base px-8 py-6 rounded-xl shadow-glow hover:shadow-elevated transition-all duration-300"
      >
        <a href={settings?.whatsapp_link || '#'} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-5 w-5" /> Entrar no Grupo
        </a>
      </Button>
    </div>
  );
}
