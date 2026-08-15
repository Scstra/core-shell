import { useEffect, useState, type ReactNode } from 'react';
import { CORE_SYSTEMS, type CoreSystemId, type SystemUrls } from './systems';

/**
 * Topo unificado do CORE.
 *
 * Extraído do `AppHeader` do Customers (crm-semcostura) e tornado independente
 * de roteador e de autenticação — sem isso ele não roda nos dois projetos: o
 * Customers usa @tanstack/react-router e o Supply usa react-router-dom.
 *
 * As duas dependências que sobraram são React e nada mais. Ícones, navegação
 * interna e identidade do usuário entram por props; a navegação **entre**
 * sistemas é `<a href>` puro, porque cada sistema mora num domínio diferente e
 * atravessar sempre carrega a página inteira de qualquer forma.
 */

export interface CoreUser {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface CoreHeaderProps {
  /** Qual sistema está sendo exibido — define o rótulo e o item ativo. */
  system: CoreSystemId;
  /** URLs vindas de `resolveSystemUrls()`. Sistema ausente aparece desabilitado. */
  systemUrls: SystemUrls;
  user?: CoreUser | null;
  /** Nome da organização, à direita. */
  organization?: string;
  /** Trilha curta de onde o usuário está, dentro do sistema. */
  section?: string;
  /** Ações do menu do usuário — o pacote não sabe as rotas de cada sistema. */
  onSignOut?: () => void;
  userMenuItems?: { label: string; onSelect: () => void }[];
  /** Slot livre à direita (sinos, badges), para cada sistema pôr o que precisa. */
  children?: ReactNode;
}

const iniciais = (u?: CoreUser | null): string => {
  const base = (u?.name || u?.email || 'S').trim();
  return base.charAt(0).toUpperCase();
};

export function CoreHeader({
  system,
  systemUrls,
  user,
  organization = 'Sem Costura',
  section,
  onSignOut,
  userMenuItems = [],
  children,
}: CoreHeaderProps) {
  const [trocadorAberto, setTrocadorAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const atual = CORE_SYSTEMS.find((s) => s.id === system);

  // Fecha os menus ao clicar fora ou apertar Esc — sem isso, um menu aberto
  // acompanha o usuário pela tela inteira.
  useEffect(() => {
    if (!trocadorAberto && !menuAberto) return;
    const fechar = () => { setTrocadorAberto(false); setMenuAberto(false); };
    const noEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    window.addEventListener('click', fechar);
    window.addEventListener('keydown', noEsc);
    return () => {
      window.removeEventListener('click', fechar);
      window.removeEventListener('keydown', noEsc);
    };
  }, [trocadorAberto, menuAberto]);

  const pararPropagacao = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <header className="core-header">
      <a className="core-header__brand" href={systemUrls[system] ?? '#'} aria-label="CORE · início">
        <span className="core-header__wordmark">CORE</span>
      </a>

      {/* ── Trocador de ambiente ─────────────────────────────────────── */}
      <div className="core-header__switcher" onClick={pararPropagacao}>
        <button
          type="button"
          className="core-header__switcher-trigger"
          aria-haspopup="menu"
          aria-expanded={trocadorAberto}
          onClick={() => { setTrocadorAberto((v) => !v); setMenuAberto(false); }}
        >
          <span className="core-header__dot" aria-hidden="true" />
          <span className="core-header__system">{atual?.name ?? 'CORE'}</span>
          <span className="core-header__chevron" aria-hidden="true">▾</span>
        </button>

        {trocadorAberto && (
          <div className="core-header__menu core-header__menu--systems" role="menu">
            {CORE_SYSTEMS.map((s) => {
              const url = systemUrls[s.id];
              const ativo = s.id === system;

              if (ativo) {
                return (
                  <span key={s.id} className="core-header__menu-item is-active" role="menuitem">
                    <span className="core-header__menu-name">{s.name}</span>
                    <span className="core-header__menu-desc">{s.description}</span>
                    <span className="core-header__badge">aqui</span>
                  </span>
                );
              }

              if (!url) {
                return (
                  <span
                    key={s.id}
                    className="core-header__menu-item is-disabled"
                    role="menuitem"
                    aria-disabled="true"
                    title="Endereço ainda não configurado"
                  >
                    <span className="core-header__menu-name">{s.name}</span>
                    <span className="core-header__menu-desc">endereço não configurado</span>
                  </span>
                );
              }

              return (
                <a key={s.id} className="core-header__menu-item" href={url} role="menuitem">
                  <span className="core-header__menu-name">{s.name}</span>
                  <span className="core-header__menu-desc">{s.description}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {section && (
        <div className="core-header__section">
          <span className="core-header__sep">/</span>
          <span>{section}</span>
        </div>
      )}

      <div className="core-header__spacer" />

      {children}

      <div className="core-header__org">
        <span className="core-header__org-name">{organization}</span>
      </div>

      {/* ── Identidade ───────────────────────────────────────────────── */}
      <div className="core-header__user" onClick={pararPropagacao}>
        <button
          type="button"
          className="core-header__user-trigger"
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          aria-label="Abrir menu do usuário"
          onClick={() => { setMenuAberto((v) => !v); setTrocadorAberto(false); }}
        >
          {user?.avatarUrl ? (
            <img className="core-header__avatar" src={user.avatarUrl} alt="" />
          ) : (
            <span className="core-header__avatar">{iniciais(user)}</span>
          )}
          <span className="core-header__chevron" aria-hidden="true">▾</span>
        </button>

        {menuAberto && (
          <div className="core-header__menu core-header__menu--user" role="menu">
            <div className="core-header__identity">
              <span className="core-header__identity-name">
                {user?.name || 'Conta Sem Costura'}
              </span>
              {user?.email && (
                <span className="core-header__identity-email">{user.email}</span>
              )}
            </div>
            {userMenuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="core-header__menu-action"
                role="menuitem"
                onClick={() => { setMenuAberto(false); item.onSelect(); }}
              >
                {item.label}
              </button>
            ))}
            {onSignOut && (
              <button
                type="button"
                className="core-header__menu-action core-header__menu-action--danger"
                role="menuitem"
                onClick={() => { setMenuAberto(false); onSignOut(); }}
              >
                Sair
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
