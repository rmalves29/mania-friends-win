import { Link2, UserPlus, Users, Gift, ShieldCheck } from 'lucide-react';

const steps = [
  { icon: Link2, title: 'Envie seu link', text: 'Copie o seu link abaixo e mande para suas amigas.' },
  { icon: UserPlus, title: 'Ela se cadastra', text: 'Sua amiga abre o link e coloca nome e WhatsApp.' },
  { icon: Users, title: 'Ela entra no Grupo VIP', text: 'A indicação só conta quando ela entra no grupo.' },
  { icon: Gift, title: 'Você ganha presentes', text: 'Bateu a meta? O cupom aparece liberado aqui.' },
];

const rules = [
  'Só valem indicações de mulheres',
  'Cada WhatsApp só pode ser indicado uma vez',
  'Não vale indicar o próprio número',
  'Quem sair do grupo em até 7 dias deixa de contar',
];

export function HowItWorks() {
  return (
    <section className="glass rounded-3xl p-6 sm:p-8 shadow-elevated">
      <h3 className="font-display text-2xl font-bold text-foreground">Como funciona</h3>
      <ol className="mt-5 grid gap-4 sm:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="relative rounded-2xl bg-background/60 p-4 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${i * 100}ms`, animationDuration: '400ms' }}
          >
            <span className="absolute right-3 top-3 font-display text-3xl font-bold text-secondary/40">{i + 1}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-body font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm font-body text-muted-foreground leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-2xl border border-border/60 bg-background/50 p-4">
        <p className="flex items-center gap-2 text-sm font-body font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> Regras
        </p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {rules.map((r) => (
            <li key={r} className="text-sm font-body text-muted-foreground">• {r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
