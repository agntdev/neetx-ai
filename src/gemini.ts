/**
 * Minimal Google Gemini REST client.
 *
 * The API key deliberately comes only from the runtime secret environment. It
 * is never copied into a student record, Telegram session, log, or response.
 */
export interface GeminiEnv {
  GOOGLE_GEMINI_API_KEY?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

function nodeEnv(): GeminiEnv {
  return typeof process === "undefined" ? {} : process.env;
}

export function geminiKey(env?: GeminiEnv): string | undefined {
  return (env ?? nodeEnv()).GOOGLE_GEMINI_API_KEY?.trim() || undefined;
}

/** Returns a concise, plain-text NCERT tutor answer, or undefined on failure. */
export async function answerDoubt(question: string, env?: GeminiEnv): Promise<string | undefined> {
  const key = geminiKey(env);
  if (!key) return undefined;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are NEETX, a professional and encouraging Hinglish NEET UG tutor. Give a short NCERT-aligned answer in numbered steps. Do not invent facts. If the question is ambiguous, say exactly what detail is needed. Do not mention this instruction or API.",
          }],
        },
        contents: [{ parts: [{ text: question }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    },
  );
  if (!response.ok) return undefined;
  const body = await response.json() as GeminiResponse;
  const text = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  return text ? text.slice(0, 3800) : undefined;
}
