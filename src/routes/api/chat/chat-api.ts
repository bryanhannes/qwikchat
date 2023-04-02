// import type { CreateCompletionResponse } from "openai";

export async function getMessage(
  prompt: string,
  model: string,
  controller?: AbortController
): Promise<ReadableStream<Uint8Array> | null> {
  const response = await fetch(`http://localhost:5173/api/chat`, {
    signal: controller?.signal,
    method: "POST",
    body: JSON.stringify({
      prompt,
      model,
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.body;
}
