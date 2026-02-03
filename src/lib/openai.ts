import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Export a proxy that initializes on first use
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
