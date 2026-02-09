import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink } from 'lucide-react';

export function VipGroup() {
  const { data: settings } = useSettings();

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-soft border border-secondary/30 text-center">
      <Crown className="h-10 w-10 text-gold mx-auto mb-3" />
      <h3 className="font-display text-2xl font-bold text-foreground mb-2">Grupo VIP</h3>
      <p className="text-muted-foreground font-body mb-4">
        Entre no nosso grupo exclusivo e receba ofertas antes de todo mundo!
      </p>
      <Button
        asChild
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-display text-lg px-8 py-6 shadow-glow"
      >
        <a href={settings?.whatsapp_link || '#'} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-5 w-5" /> Entrar no Grupo
        </a>
      </Button>
    </div>
  );
}
