/**
 * Os cinco sistemas do CORE.
 *
 * O nome conceitual é estável; a URL não. Cada sistema mora num domínio
 * próprio. O projeto publicado no Lovable é o endereço canônico e uma
 * configuração de ambiente pode promovê-lo para um domínio próprio. O
 * componente também sabe lidar com sistema **sem URL**: ele aparece
 * desabilitado, com o motivo, em vez de virar link morto.
 *
 * Link morto é pior do que botão desabilitado: o operador clica, cai num erro
 * de DNS e passa a desconfiar do menu inteiro.
 */

export type CoreSystemId = 'customers' | 'commerce' | 'supply' | 'insights' | 'ads';

export interface CoreSystem {
  id: CoreSystemId;
  /** Nome conceitual exibido no trocador. */
  name: string;
  /** Uma linha sobre o que o sistema faz, para quem ainda não decorou os nomes. */
  description: string;
}

export const CORE_SYSTEMS: CoreSystem[] = [
  { id: 'customers', name: 'Customers', description: 'CRM, atendimento e relacionamento' },
  { id: 'commerce', name: 'Commerce', description: 'Loja, catálogo e pedidos de venda' },
  { id: 'supply', name: 'Supply', description: 'Produto, produção, estoque e compras' },
  { id: 'insights', name: 'Insights', description: 'Indicadores e análise' },
  { id: 'ads', name: 'Amplify', description: 'Campanhas e mídia paga' },
];

export type SystemUrls = Partial<Record<CoreSystemId, string>>;

/** Endereços canônicos dos projetos publicados no workspace Sem Costura. */
export const LOVABLE_SYSTEM_URLS: Readonly<SystemUrls> = {
  customers: 'https://sweet-comms-center.lovable.app',
  commerce: 'https://ecommerce-semcostura.lovable.app',
  supply: 'https://semcostura-flow.lovable.app',
  insights: 'https://insights-semcostura.lovable.app',
  ads: 'https://ads-semcostura.lovable.app',
};

/**
 * Monta o mapa de URLs oficiais, permitindo substituições pelo ambiente.
 *
 * Recebe o objeto de env em vez de ler `import.meta.env` direto porque os dois
 * consumidores expõem o env de formas diferentes (Vite no PCP, servidor no
 * CRM), e um pacote compartilhado não pode depender do build de nenhum deles.
 *
 * Aceita tanto `VITE_CORE_URL_SUPPLY` quanto `CORE_URL_SUPPLY`: o prefixo VITE_
 * é exigência do Vite para expor ao cliente, e o CRM não usa esse prefixo.
 */
export function resolveSystemUrls(env: Record<string, string | undefined>): SystemUrls {
  const urls: SystemUrls = { ...LOVABLE_SYSTEM_URLS };
  for (const s of CORE_SYSTEMS) {
    const chave = s.id.toUpperCase();
    const valor = env[`VITE_CORE_URL_${chave}`] ?? env[`CORE_URL_${chave}`];
    const limpo = (valor ?? '').trim();
    if (limpo) urls[s.id] = limpo.replace(/\/+$/, '');
  }
  return urls;
}
