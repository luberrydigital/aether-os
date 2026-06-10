import { paystackPublicKeyFromEnv } from "@/lib/payments/gateways";
import { getChatModelConfig } from "@/lib/llm/chat-model";

function set(v: string | undefined | null): boolean {
  return Boolean(v && String(v).trim());
}

export type EnvCheckSnapshot = {
  generatedAt: string;
  nodeEnv: string;
  nextAuth: {
    secretSet: boolean;
    urlSet: boolean;
    /** In production, both should be set for stable sessions and callbacks. */
    productionReady: boolean;
  };
  auth: {
    credentials: true;
    googleOAuthReady: boolean;
  };
  llm: {
    configured: boolean;
    provider: string | null;
    model: string | null;
  };
  openai: {
    /** Used for DALL·E product images and some blueprint paths. */
    apiKeySet: boolean;
  };
  anthropic: {
    /** Used when `LLM_PROVIDER=anthropic` or as fallback LLM. */
    apiKeySet: boolean;
  };
  printful: {
    apiKeySet: boolean;
    storeIdSet: boolean;
  };
  database: {
    /** Optional override; default is `data/aether-db.json` under cwd. */
    customPathSet: boolean;
  };
  payments: {
    sandbox: true;
    payfast: { configured: boolean };
    paystack: { configured: boolean };
  };
};

export function getPaymentsGatewayFlags(): EnvCheckSnapshot["payments"] {
  const payfastOk = Boolean(
    process.env.PAYFAST_MERCHANT_ID?.trim() &&
      process.env.PAYFAST_MERCHANT_KEY?.trim() &&
      process.env.PAYFAST_PASSPHRASE?.trim()
  );
  const paystackOk = Boolean(paystackPublicKeyFromEnv() && process.env.PAYSTACK_SECRET_KEY?.trim());
  return {
    sandbox: true,
    payfast: { configured: payfastOk },
    paystack: { configured: paystackOk },
  };
}

export function getEnvCheckSnapshot(): EnvCheckSnapshot {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const cfg = getChatModelConfig();
  const llmProvider = cfg?.provider ?? null;
  const llmKeyOk =
    llmProvider === "openai"
      ? set(process.env.OPENAI_API_KEY)
      : llmProvider === "anthropic"
        ? set(process.env.ANTHROPIC_API_KEY)
        : false;

  const secretSet = set(process.env.NEXTAUTH_SECRET);
  const urlSet = set(process.env.NEXTAUTH_URL);
  const productionReady =
    nodeEnv !== "production" || (secretSet && urlSet);

  return {
    generatedAt: new Date().toISOString(),
    nodeEnv,
    nextAuth: {
      secretSet,
      urlSet,
      productionReady,
    },
    auth: {
      credentials: true,
      googleOAuthReady: set(process.env.GOOGLE_CLIENT_ID) && set(process.env.GOOGLE_CLIENT_SECRET),
    },
    llm: {
      configured: cfg != null && llmKeyOk,
      provider: llmProvider,
      model: cfg?.model ?? null,
    },
    openai: {
      apiKeySet: set(process.env.OPENAI_API_KEY),
    },
    anthropic: {
      apiKeySet: set(process.env.ANTHROPIC_API_KEY),
    },
    printful: {
      apiKeySet: set(process.env.PRINTFUL_API_KEY),
      storeIdSet: set(process.env.PRINTFUL_STORE_ID),
    },
    database: {
      customPathSet: set(process.env.AETHER_DB_PATH),
    },
    payments: getPaymentsGatewayFlags(),
  };
}
