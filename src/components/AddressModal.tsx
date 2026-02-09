import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddressModal({ open, onClose }: AddressModalProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ address: '', city: '', state: '', zipcode: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.state || !form.zipcode) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await (supabase as any).from('profiles').update({
        address: form.address,
        city: form.city,
        state: form.state,
        zipcode: form.zipcode,
      }).eq('id', user!.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: '✅ Endereço salvo!' });
      onClose();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-background" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <MapPin className="h-5 w-5 text-secondary" />
            Endereço de Entrega
          </DialogTitle>
          <DialogDescription className="font-body">
            Precisamos do seu endereço para enviar seus prêmios!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="font-body">Endereço</Label>
            <Input placeholder="Rua, número, complemento" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="bg-card" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-body">Cidade</Label>
              <Input placeholder="Cidade" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="bg-card" />
            </div>
            <div>
              <Label className="font-body">Estado</Label>
              <Input placeholder="UF" maxLength={2} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase() }))} className="bg-card" />
            </div>
          </div>
          <div>
            <Label className="font-body">CEP</Label>
            <Input placeholder="00000-000" value={form.zipcode} onChange={e => setForm(p => ({ ...p, zipcode: e.target.value }))} className="bg-card" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-display">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Salvar Endereço
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
