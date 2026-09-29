import { useId, type ReactNode } from 'react';
import './core-login.css';

const logoUrl = new URL('./corerx-logo.png', import.meta.url).href;

export interface CoreLoginLayoutProps {
  systemName: string;
  description: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  busy?: boolean;
  note?: ReactNode;
  children: ReactNode;
}

/** Presentation only. Each application retains its own authentication and authorization. */
export function CoreLoginLayout({
  systemName, description, title = 'Entre com seu e-mail',
  subtitle = 'Enviaremos um link de acesso. Você não precisa de senha.',
  busy = false, note = 'Acesso exclusivo para usuários cadastrados.', children,
}: CoreLoginLayoutProps) {
  const titleId = useId();
  return <div className="core-login">
    <header className="core-login__header"><img src={logoUrl} alt="CORERX" width={152} /><span>SEM COSTURA</span></header>
    <main className="core-login__main">
      <div className="core-login__intro"><span className="core-login__eyebrow">CORERX / {systemName}</span><h1>{systemName}</h1><p>{description}</p></div>
      <section className="core-login__card" aria-labelledby={titleId} aria-busy={busy}>
        <span className="core-login__eyebrow">ACESSO À PLATAFORMA</span>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p className="core-login__subtitle">{subtitle}</p>}
        <div className="core-login__content">{children}</div>
        {note && <div className="core-login__note"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg><span>{note}</span></div>}
      </section>
    </main>
    <footer className="core-login__footer">CORERX <span>Sem Costura</span></footer>
  </div>;
}
