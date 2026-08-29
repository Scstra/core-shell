# @semcostura/core-shell

Topo unificado do CORE. Fonte única do header usado por **Customers**,
**Commerce**, **Supply**, **Insights** e **Ads**.

## Por que fonte e não build

O pacote publica TypeScript/TSX cru (`main` aponta para `src/index.ts`), sem
etapa de build. Os consumidores são projetos Vite que já transpilam TSX, e
uma etapa de build aqui só acrescentaria uma versão para manter desatualizada.
Quem consumir por outro bundler precisa incluir este pacote na transpilação.

## Uso

```tsx
import { CoreHeader, resolveSystemUrls } from '@semcostura/core-shell';
import '@semcostura/core-shell/core-shell.css';

<CoreHeader
  system="supply"
  systemUrls={resolveSystemUrls(import.meta.env)}
  user={{ name: perfil?.name, email: usuario?.email }}
  section="Estoque"
  onSignOut={sair}
/>
```

Insights fica oculto por padrão. Um produto pode definir outra lista de
sistemas ocultos com `hiddenSystems`:

```tsx
<CoreHeader
  system="customers"
  systemUrls={resolveSystemUrls(import.meta.env)}
  hiddenSystems={["insights"]}
/>
```

O componente não importa roteador nem cliente de autenticação: navegação entre
sistemas é `<a href>` (domínios diferentes), e identidade entra por prop. Foi
essa restrição que permitiu o mesmo código rodar no Customers
(`@tanstack/react-router`) e no Supply (`react-router-dom`).

## URLs dos sistemas

O pacote usa como fallback os endereços publicados dos projetos oficiais no
Lovable. Variáveis de ambiente podem promover domínios próprios sem exigir uma
nova versão do pacote:

```
VITE_CORE_URL_CUSTOMERS=https://...
VITE_CORE_URL_COMMERCE=https://...
VITE_CORE_URL_SUPPLY=https://pcp.semcostura.com
VITE_CORE_URL_INSIGHTS=https://...
VITE_CORE_URL_ADS=https://...
```

Sem prefixo `VITE_` também funciona (`CORE_URL_SUPPLY`), para consumidor que não
seja Vite. Sistema sem URL aparece no trocador **desabilitado**, com o motivo —
link morto faz o operador desconfiar do menu inteiro.

## Modo quiosque

O pacote não tem "modo quiosque": quem decide é o hospedeiro, simplesmente não
renderizando o `CoreHeader`. É o caso do Modo Separação do Supply, que roda em
tela cheia na estação de corte.
