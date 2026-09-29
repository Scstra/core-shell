# CORERX Core Shell — conhecimento e instruções

<!-- SEMCOSTURA:KNOWLEDGE_PARITY:BEGIN -->
## Regra obrigatória: AGENTS.md e CLAUDE.md sincronizados

Decisão de Brenno em 27/09/2026, válida para todos os projetos Sem Costura.

- `AGENTS.md` e `CLAUDE.md` são duas entradas para o mesmo conhecimento e as mesmas instruções deste projeto. Devem existir juntos, no mesmo diretório, com conteúdo integralmente idêntico; nenhum deles pode ser uma versão reduzida ou exclusiva de um agente.
- Toda atualização de regra, decisão, arquitetura, integração, procedimento, limitação ou conhecimento registrada em um deles deve ser aplicada ao outro **na mesma alteração e no mesmo commit/PR**. Isso vale para qualquer agente, ferramenta ou pessoa, inclusive edições feitas pelo Lovable.
- Antes de editar, leia os dois e concilie eventuais diferenças: preserve o conhecimento válido de ambos, elimine duplicações exatas e substitua orientações superadas pelas decisões explícitas mais recentes do usuário. Não copie cegamente um arquivo por cima do outro nem descarte trabalho local. Uma divergência sem evidência suficiente deve ser registrada e esclarecida antes da ação que depende dela.
- Preserve o contexto e as restrições de cada sistema. A regra de sincronização é comum a todos os projetos; arquitetura, credenciais referenciadas, ambientes e regras de negócio não devem ser transplantados de um projeto para outro. Nunca grave valores de segredos nesses arquivos.
- Se uma decisão comum afetar vários projetos, atualize o par em cada projeto afetado e registre qualquer pendência. Se houver um par em subdiretório, mantenha também esse par sincronizado dentro de seu escopo.
- Antes de concluir ou publicar a alteração, execute `cmp -s AGENTS.md CLAUDE.md` na raiz do projeto: saída diferente de zero impede considerar a conciliação concluída. Confira também se ambos os arquivos aparecem no diff quando o conteúdo do par mudar. O workflow `Knowledge parity` confere a igualdade no GitHub; preserve essa verificação.
- Não altere apenas um arquivo, não crie versões divergentes por agente e não trate uma diferença como resolvida apenas porque existe um link para o outro arquivo.

Registros históricos mantêm a data e o escopo originais; não são novas autorizações. Uma decisão expressamente substituída não volta a valer por estar mencionada no histórico.
<!-- SEMCOSTURA:KNOWLEDGE_PARITY:END -->

<!-- SEMCOSTURA:NO_LOVABLE_PROMPTS:BEGIN -->
## Regra obrigatória: desenvolvimento e publicação sem prompts no Lovable
Decisão de Brenno em 27/09/2026, aplicável aos projetos Sem Costura. Esta regra substitui permissões e exceções antigas para trabalhar via prompt no Lovable.

- Não enviar nenhum prompt ou mensagem ao agente conversacional do Lovable (inclusive planejamento, correção, geração de código, regeneração/registro de MCP ou pedido de publicação) sem antes consultar Brenno e obter aprovação explícita para aquele envio específico. Autorizações antigas ou genéricas como "faça tudo via Lovable" ou "pode seguir" não dispensam essa consulta.
- Desenvolvimento padrão: inspecionar, editar e validar o código diretamente; usar GitHub via integração MCP/API ou fluxo Git autorizado, com diff, branch/PR, CI e revisão conforme as regras do projeto. Não delegar desenvolvimento ao agente do Lovable por iniciativa própria.
- Usar as operações estruturadas do MCP do Lovable para leitura, configuração de conhecimento, sincronização e publicação, quando autorizadas e disponíveis. Elas não se confundem com enviar prompt ao agente.
- Publicar pela operação estruturada de deploy do MCP do Lovable ou por um workflow de publicação já existente e autorizado no GitHub. Não abrir navegador/app para clicar em Publicar como fluxo padrão. Conferir o commit sincronizado e o deployment efetivamente servido; push/merge sozinho não prova publicação.
- Se uma capacidade exclusiva parecer exigir prompt, explicar a limitação e mostrar o prompt proposto a Brenno; aguardar aprovação específica antes de enviá-lo. Não contornar recusas de ferramenta, não expor credenciais e não enfraquecer gates.
- Esta regra não autoriza novos deploys, mudanças em produção, alterações destrutivas ou operações fora do pedido em andamento. Preservar todas as restrições de segurança, escopo e ambientes do projeto.

O uso de IA dentro do produto (por exemplo, geração de copy solicitada) não é desenvolvimento via prompt no Lovable e continua sujeito ao contrato próprio dessa funcionalidade.
<!-- SEMCOSTURA:NO_LOVABLE_PROMPTS:END -->

## Contexto do projeto

Pacote `@semcostura/core-shell`, fonte compartilhada do topo CORERX. Leia o
`README.md` para o contrato de consumo, URLs e configuração. O pacote publica
TypeScript/TSX; navegação e identidade são recebidas dos sistemas consumidores.
Preserve a independência de roteador e cliente de autenticação.

## Creators (29/09/2026)

O CORERX inclui o sistema `creators`, exibido como Creators, para gestão de
creators e afiliados da Sem Costura. A versão 2.8.0 mantém esse item visível em
todos os consumidores, com a URL publicada e verificada
`https://creators.semcostura.com`. O override `VITE_CORE_URL_CREATORS` /
`CORE_URL_CREATORS` continua disponível por ambiente.

## Login CORERX padronizado (29/09/2026)

A tela de Creators é a referência visual do login de todos os sistemas internos. O componente `CoreLoginLayout` do core-shell centraliza cabeçalho, marca, tipografia, fundo, identificação do sistema, cartão do formulário e responsividade. Ajustes visuais comuns devem ser feitos nessa fonte e propagados aos consumidores, incluindo cópias vendorizadas. Formulários, magic link, código, callbacks, limites de reenvio e permissões continuam sob responsabilidade de cada sistema; padronização visual não cria acesso nem compartilha sessões. Manter estados de carregamento, sucesso e erro acessíveis e validar desktop e celular.

As fontes Inter e Outfit do login são empacotadas localmente com suas licenças OFL. Não usar importação CSS de fontes externas: versões anteriores do Vite/Lightning CSS em alguns consumidores tratam o endereço como arquivo local. As famílias são isoladas ao login.

O logo do login usa importação estática de asset para renderização idêntica no servidor e navegador (SSR); não usar `new URL(..., import.meta.url)` nesse componente.
