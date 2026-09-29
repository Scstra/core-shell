import { useEffect, useRef, useState, type ReactNode } from "react";
import { CoreLoginLayout } from "./CoreLoginLayout";
import "./core-mcp.css";

export type McpConsentDetails = {
  client?: { name?: string } | null;
  user?: { email?: string } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};
export type McpConsentDecision = "approve" | "deny";
export function mcpReturnUrl(details: McpConsentDetails | null): string | null {
  const value = details?.redirect_url ?? details?.redirect_to;
  if (!value) return null;
  const u = new URL(value);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (
    u.username ||
    u.password ||
    (u.protocol !== "https:" && !(u.protocol === "http:" && loopback))
  )
    throw Error(
      "Endereço de retorno não suportado. Inicie uma nova conexão no assistente.",
    );
  return value;
}
export function CoreMcpConsent({
  systemName,
  authorizationId,
  permissions,
  loadConsent,
  decide,
  children,
}: {
  systemName: string;
  authorizationId: string | null | undefined;
  permissions: string[];
  loadConsent: (id: string) => Promise<McpConsentDetails | null>;
  decide: (
    id: string,
    decision: McpConsentDecision,
  ) => Promise<McpConsentDetails | null>;
  children?: ReactNode;
}) {
  const [details, setDetails] = useState<McpConsentDetails | null>(null);
  const [phase, setPhase] = useState<
    "loading" | "ready" | "approved" | "denied" | "return"
  >("loading");
  const [destination, setDestination] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const actions = useRef({ loadConsent, decide });
  actions.current = { loadConsent, decide };
  const submitting = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    const current = ++generation.current;
    setPhase("loading");
    setError("");
    setDetails(null);
    setDestination(null);
    setBusy(false);
    let timeout: ReturnType<typeof setTimeout>;
    const load = async () => {
      if (!authorizationId || authorizationId.length > 300)
        throw Error("Solicitação de autorização inválida ou incompleta.");
      const data = await Promise.race([
        actions.current.loadConsent(authorizationId),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () =>
              reject(
                Error(
                  "A autorização demorou para responder. Tente carregar novamente.",
                ),
              ),
            20000,
          );
        }),
      ]);
      if (!active || generation.current !== current) return;
      if (!data)
        throw Error("Não foi possível carregar os detalhes desta autorização.");
      const url = mcpReturnUrl(data);
      if (url && !data.client) {
        setDestination(url);
        setPhase("return");
      } else if (data.client) {
        setDetails(data);
        setPhase("ready");
      } else
        throw Error(
          "Pedido de autorização incompleto. Inicie uma nova conexão no assistente.",
        );
    };
    void load()
      .catch(() => {
        if (active)
          setError(
            !authorizationId
              ? "Solicitação de autorização inválida ou incompleta."
              : "Não foi possível carregar a autorização. Recarregue ou inicie uma nova conexão no assistente.",
          );
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      generation.current++;
      clearTimeout(timeout);
    };
  }, [authorizationId, attempt]);
  async function submit(decision: McpConsentDecision) {
    if (!authorizationId || submitting.current || phase !== "ready") return;
    submitting.current = true;
    setBusy(true);
    setError("");
    const current = generation.current;
    try {
      const result = await actions.current.decide(authorizationId, decision);
      if (current !== generation.current) return;
      const url = mcpReturnUrl(result);
      if (!url) throw Error("Retorno ausente");
      setDestination(url);
      setPhase(decision === "approve" ? "approved" : "denied");
    } catch {
      if (current === generation.current)
        setError(
          "Não foi possível confirmar o resultado. Confira a conexão no assistente antes de tentar novamente.",
        );
    } finally {
      submitting.current = false;
      if (current === generation.current) setBusy(false);
    }
  }
  const complete = ["approved", "denied", "return"].includes(phase);
  const title =
    error && !details && !complete
      ? "Não foi possível autorizar"
      : phase === "approved"
        ? "Autorização concedida"
        : phase === "denied"
          ? "Acesso recusado"
          : phase === "return"
            ? "Continuar conexão"
            : phase === "loading"
              ? "Preparando conexão"
              : `${details?.client?.name || "Um assistente"} quer acessar o ${systemName}`;
  return (
    <CoreLoginLayout
      systemName={systemName}
      description="Conecte seu assistente às ferramentas do sistema com sua conta e suas permissões."
      title={title}
      subtitle={null}
      busy={busy || (phase === "loading" && !error)}
      note="O assistente não recebe sua senha. As permissões do sistema continuam valendo."
    >
      <div className="core-mcp-consent">
        {error && <p role="alert">{error}</p>}
        {phase === "loading" && !error && (
          <p role="status">Carregando autorização…</p>
        )}
        {error && !details && !complete && (
          <button type="button" onClick={() => setAttempt((x) => x + 1)}>
            Tentar carregar novamente
          </button>
        )}
        {phase === "ready" && (
          <>
            {details?.user?.email && (
              <p>
                A integração agirá em nome de{" "}
                <strong>{details.user.email}</strong>.
              </p>
            )}
            <ul>
              {permissions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {children && <fieldset disabled={busy}>{children}</fieldset>}
            <div className="core-mcp-actions">
              <button
                type="button"
                className="core-mcp-approve"
                disabled={busy}
                onClick={() => void submit("approve")}
              >
                {busy ? "Confirmando…" : "Autorizar acesso"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit("deny")}
              >
                Recusar
              </button>
            </div>
          </>
        )}
        {complete && (
          <div role="status">
            <p>
              {phase === "approved"
                ? "O acesso foi autorizado. Continue agora no assistente para concluir a conexão."
                : phase === "denied"
                  ? "Nenhum novo acesso foi concedido. Volte ao assistente para encerrar este pedido."
                  : "O servidor devolveu o endereço de retorno. Continue no assistente para conferir o resultado da conexão."}
            </p>
            <button
              type="button"
              className="core-mcp-approve"
              onClick={() => {
                if (!destination) return;
                try {
                  window.location.assign(destination);
                } catch {
                  setError(
                    "Não foi possível abrir o assistente. Volte ao aplicativo que iniciou a conexão.",
                  );
                }
              }}
            >
              {phase === "denied"
                ? "Voltar ao assistente"
                : "Concluir conexão no assistente"}
            </button>
            <p>
              O retorno pode abrir um endereço local (127.0.0.1). A confirmação
              final da conexão aparece no aplicativo que iniciou o pedido.
            </p>
          </div>
        )}
      </div>
    </CoreLoginLayout>
  );
}
export function CoreMcpConnectionCard({
  systemName,
  endpoint,
}: {
  systemName: string;
  endpoint: string;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  return (
    <section
      className="core-mcp-card"
      aria-label={`Conectar MCP do ${systemName}`}
    >
      <span className="core-mcp-eyebrow">CORERX · INTEGRAÇÕES</span>
      <h2>Conectar ao {systemName}</h2>
      <p>
        Use este endereço no seu assistente e conclua o login com sua conta do
        sistema.
      </p>
      <div className="core-mcp-endpoint">
        <code>{endpoint}</code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(endpoint);
              setCopied(true);
              setError("");
            } catch {
              setError("Selecione e copie o endereço acima.");
            }
          }}
        >
          {copied ? "Copiado" : "Copiar endereço"}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <ol>
        <li>Adicione o servidor MCP no assistente.</li>
        <li>Entre e confira a conta e as permissões solicitadas.</li>
        <li>Autorize e clique em “Concluir conexão no assistente”.</li>
      </ol>
      <p>
        Se a conexão falhar, confira o estado no assistente. Login no navegador
        e conexão MCP são sessões diferentes. Evite reconectar repetidamente ou
        manter clientes auxiliares antigos abertos.
      </p>
    </section>
  );
}
