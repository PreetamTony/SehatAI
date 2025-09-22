// Lightweight Groq-based translator helper used to generate translations
// for missing languages. This uses the Groq chat completions endpoint and
// expects VITE_GROQ_API_KEY to be set in the environment.

type FlatDict = Record<string, string>;

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

function flattenObject(obj: any, prefix = ''): FlatDict {
  const out: FlatDict = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flattenObject(val, path));
    } else {
      out[path] = String(val ?? '');
    }
  });
  return out;
}

function unflattenObject(flat: FlatDict) {
  const result: any = {};
  Object.keys(flat).forEach((compound) => {
    const parts = compound.split('.');
    let node = result;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        node[p] = flat[compound];
      } else {
        node[p] = node[p] || {};
        node = node[p];
      }
    }
  });
  return result;
}

function extractJsonFromMarkdown(content: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(content);
  if (fenced) return fenced[1].trim();

  const match = content.match(/[\{\[]([\s\S]*)[\}\]]/);
  if (match) {
    // try to extract from first bracket to last bracket
    const first = content.search(/[\{\[]/);
    const last = Math.max(content.lastIndexOf('}'), content.lastIndexOf(']'));
    if (first !== -1 && last !== -1 && last > first) {
      return content.slice(first, last + 1).trim();
    }
  }

  return content.trim();
}

export async function generateTranslationsForLanguage(lang: string, baseTranslations: Record<string, any>): Promise<Record<string, any>> {
  const API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (!API_KEY) throw new Error('VITE_GROQ_API_KEY is not configured');

  const flat = flattenObject(baseTranslations);

  // Build prompt: ask the model to translate the values and return JSON mapping
  const prompt = `Translate the following JSON object values into ${lang}. Return ONLY a valid JSON object mapping the same keys to the translated strings (no extra commentary).\n\n${JSON.stringify(flat, null, 2)}`;

  const body = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 1500,
  };

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq translation request failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? ''; // best-effort
  const jsonText = extractJsonFromMarkdown(content);

  try {
    const parsed = JSON.parse(jsonText);
    // parsed should be a flat mapping; unflatten and return
    return unflattenObject(parsed as FlatDict);
  } catch (err) {
    // Attempt small cleanup: remove trailing commas
    const cleaned = jsonText.replace(/,\s*(?=\}|\])/g, '');
    try {
      const parsed2 = JSON.parse(cleaned);
      return unflattenObject(parsed2 as FlatDict);
    } catch (err2) {
      const e = new Error('Failed to parse translations from Groq response');
      (e as any).raw = content;
      throw e;
    }
  }
}
