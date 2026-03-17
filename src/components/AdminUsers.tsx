import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Save, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  referral_count: number;
  whatsapp: string | null;
  created_at: string;
}

interface AdminUsersProps {
  users: UserRow[];
  onRefresh: () => void;
}

const AdminUsers = ({ users, onRefresh }: AdminUsersProps) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (user: UserRow) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          name: editingUser.name,
          email: editingUser.email,
          whatsapp: editingUser.whatsapp,
        })
        .eq('id', editingUser.id);
      if (error) throw error;
      toast({ title: '✅ Usuário atualizado!' });
      setEditingUser(null);
      onRefresh();
    } catch {
      toast({ title: 'Erro ao atualizar usuário', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .delete()
        .eq('id', deletingUser.id);
      if (error) throw error;
      toast({ title: '✅ Usuário excluído!' });
      setDeletingUser(null);
      onRefresh();
    } catch {
      toast({ title: 'Erro ao excluir usuário', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted border-b border-border font-body text-sm font-bold">
          Total: {users.length} usuários
        </div>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-body font-bold text-foreground text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground font-body truncate">
                  {u.email} • {u.whatsapp}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-secondary/20 text-secondary-foreground font-display font-bold px-3 py-1 rounded-full text-sm">
                  {u.referral_count}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(u)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingUser(u)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Editar Usuário</DialogTitle>
            <DialogDescription className="font-body">Altere os dados do usuário abaixo.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label className="font-body">Nome</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="font-body"
                />
              </div>
              <div>
                <Label className="font-body">E-mail</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="font-body"
                />
              </div>
              <div>
                <Label className="font-body">WhatsApp</Label>
                <Input
                  value={editingUser.whatsapp || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, whatsapp: e.target.value })}
                  className="font-body"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="font-body">
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-secondary text-secondary-foreground font-body">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Excluir Usuário</DialogTitle>
            <DialogDescription className="font-body">
              Tem certeza que deseja excluir <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)} className="font-body">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="font-body">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
