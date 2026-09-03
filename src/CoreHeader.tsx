import { useEffect, useState, type ReactNode } from 'react';
import { CORE_SYSTEMS, type CoreSystemId, type SystemUrls } from './systems';

const coreRxLogoUrl = new URL('./corerx-logo.png', import.meta.url).href;

/**
 * Topo unificado do CORERX.
 *
 * Independente de roteador e de autenticação — sem isso não roda nos dois
 * projetos: o Customers usa @tanstack/react-router e o Supply usa
 * react-router-dom. Ícones, navegação interna e identidade entram por props; a
 * navegação **entre** sistemas é `<a href>` puro, porque cada sistema mora num
 * domínio diferente e atravessar recarrega a página de qualquer forma.
 *
 * A marca oficial fica em um único link para preservar proporção e espaçamento
 * em todos os sistemas, independentemente da largura do trilho lateral local.
 */

export interface CoreUser {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface CoreHeaderProps {
  system: CoreSystemId;
  systemUrls: SystemUrls;
  /** Sistemas que não devem aparecer no trocador deste produto. */
  hiddenSystems?: CoreSystemId[];
  user?: CoreUser | null;
  organization?: string;
  /** Ambiente de execução — "Produção", "Homologação". */
  environment?: string;
  /** Trilha curta de onde o usuário está, dentro do sistema. */
  section?: string;
  /** Abre a busca do sistema. Sem isso, a caixa de busca não aparece. */
  onSearch?: () => void;
  onSignOut?: () => void;
  userMenuItems?: { label: string; onSelect: () => void }[];
  /**
   * Fixa o topo no alto da janela ao rolar. Padrão `true`, que é como o
   * Customers sempre se comportou; o Supply desliga porque as listas longas de
   * cadastro rendem mais com a tela inteira.
   */
  sticky?: boolean;
  /** Slot antes da identidade — sinos, contadores, o que cada sistema tiver. */
  children?: ReactNode;
}

const iniciais = (u?: CoreUser | null): string =>
  (u?.name || u?.email || 'S').trim().charAt(0).toUpperCase();

/* Ícones inline: um pacote de topo não deve arrastar biblioteca de ícones para
   dentro de cinco aplicações que já têm a sua. */
const IconeCaixa = () => (
  <svg className="core-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

const IconePredio = () => (
  <svg className="core-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
);

const IconeLupa = () => (
  <svg className="core-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

export function CoreHeader({
  system,
  systemUrls,
  hiddenSystems = ['insights'],
  user,
  organization = 'Sem Costura',
  environment,
  section,
  onSearch,
  onSignOut,
  userMenuItems = [],
  sticky = true,
  children,
}: CoreHeaderProps) {
  const [trocadorAberto, setTrocadorAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const atual = CORE_SYSTEMS.find((s) => s.id === system);
  const systems = CORE_SYSTEMS.filter((s) => !hiddenSystems.includes(s.id)).sort((a, b) => {
    if (a.id === system) return -1;
    if (b.id === system) return 1;
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
  });

  // Fecha ao clicar fora ou apertar Esc — sem isso um menu aberto acompanha o
  // usuário pela tela inteira.
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
    <header className={`core-header${sticky ? '' : ' core-header--static'}`}>
      <a className="core-header__mark" href={systemUrls[system] ?? '#'} aria-label="CORERX · início">
        <img className="core-header__logo" src={coreRxLogoUrl} alt="" />
      </a>

      {/* ── Trocador de ambiente ─────────────────────────────────────── */}
      <div className="core-header__cell core-header__switcher" onClick={pararPropagacao}>
        <button
          type="button"
          className="core-header__trigger"
          aria-haspopup="menu"
          aria-expanded={trocadorAberto}
          onClick={() => { setTrocadorAberto((v) => !v); setMenuAberto(false); }}
        >
          <IconeCaixa />
          <span className="core-header__system">{atual?.name ?? 'CORE'}</span>
          <span className="core-header__chevron" aria-hidden="true">▾</span>
        </button>

        {trocadorAberto && (
          <div className="core-header__menu core-header__menu--systems" role="menu">
            {systems.map((s) => {
              const url = systemUrls[s.id];
              if (s.id === system) {
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
          <span className="core-header__section-name">{section}</span>
        </div>
      )}

      {onSearch && (
        <button type="button" className="core-header__search" onClick={onSearch} aria-label="Buscar no CORERX">
          <IconeLupa />
          <span className="core-header__search-label">Buscar no CORERX...</span>
          <kbd className="core-header__kbd">⌘ K</kbd>
        </button>
      )}

      {/* Empurra o grupo da direita até a borda. Sem ele o topo termina no meio
          da tela e sobra um vazio depois do avatar — a busca cresce só até o
          próprio limite e ninguém absorve o resto. */}
      <div className="core-header__spacer" />

      <div className="core-header__cell core-header__org">
        <IconePredio />
        <span className="core-header__org-name">{organization}</span>
        <span className="core-header__chevron" aria-hidden="true">▾</span>
      </div>

      {environment && (
        <div className="core-header__cell core-header__env">
          <span className="core-header__dot" aria-hidden="true" />
          <span className="core-header__env-name">{environment}</span>
          <span className="core-header__chevron" aria-hidden="true">▾</span>
        </div>
      )}

      {children}

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
              <span className="core-header__identity-name">{user?.name || 'Conta Sem Costura'}</span>
              {user?.email && <span className="core-header__identity-email">{user.email}</span>}
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
