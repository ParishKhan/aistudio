import type { CollectionEntry } from 'astro:content';

/**
 * Copy-paste API snippets per vendor, using the model's real primary model ID.
 * xAI, Mistral, and DeepSeek expose OpenAI-compatible chat-completions APIs.
 */
export function apiSnippets(model: CollectionEntry<'models'>, vendorSlug: string) {
  const id = model.data.api.modelIds[0];

  if (vendorSlug === 'anthropic') {
    return {
      curl: `curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "${id}",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'`,
      python: `from anthropic import Anthropic

client = Anthropic()  # reads ANTHROPIC_API_KEY

message = client.messages.create(
    model="${id}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
print(message.content[0].text)`,
      typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const message = await client.messages.create({
  model: "${id}",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});
console.log(message.content);`,
    };
  }

  if (vendorSlug === 'google') {
    return {
      curl: `curl "https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent" \\
  -H "x-goog-api-key: $GEMINI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'`,
      python: `from google import genai

client = genai.Client()  # reads GEMINI_API_KEY

response = client.models.generate_content(
    model="${id}", contents="Hello"
)
print(response.text)`,
      typescript: `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY

const response = await ai.models.generateContent({
  model: "${id}",
  contents: "Hello",
});
console.log(response.text);`,
    };
  }

  // OpenAI and OpenAI-compatible providers (xAI, Mistral, DeepSeek).
  const bases: Record<string, { base: string; env: string }> = {
    openai: { base: 'https://api.openai.com/v1', env: 'OPENAI_API_KEY' },
    xai: { base: 'https://api.x.ai/v1', env: 'XAI_API_KEY' },
    mistral: { base: 'https://api.mistral.ai/v1', env: 'MISTRAL_API_KEY' },
    deepseek: { base: 'https://api.deepseek.com', env: 'DEEPSEEK_API_KEY' },
  };
  const { base, env } = bases[vendorSlug] ?? bases.openai;
  const isOpenAI = vendorSlug === 'openai';

  return {
    curl: `curl ${base}/chat/completions \\
  -H "Authorization: Bearer $${env}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${id}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`,
    python: `from openai import OpenAI

client = OpenAI(${isOpenAI ? '' : `\n    base_url="${base}",\n    api_key=os.environ["${env}"],\n`})  ${isOpenAI ? `# reads ${env}` : ''}

response = client.chat.completions.create(
    model="${id}",
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].message.content)`,
    typescript: `import OpenAI from "openai";

const client = new OpenAI(${isOpenAI ? '' : `{\n  baseURL: "${base}",\n  apiKey: process.env.${env},\n}`}); ${isOpenAI ? `// reads ${env}` : ''}

const response = await client.chat.completions.create({
  model: "${id}",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(response.choices[0].message.content);`,
  };
}
