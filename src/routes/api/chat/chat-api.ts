import type { CreateCompletionResponse } from "openai";

export async function getMessage(
  prompt: string,
  model: string,
  controller?: AbortController
): Promise<CreateCompletionResponse> {
  const response = await fetch(`http://localhost:5173/api/chat`, {
    signal: controller?.signal,
    method: "POST",
    body: JSON.stringify({
      prompt,
      model,
    }),
  });

  if (!response.ok) {
    return { choices: [], model: "", object: "", created: 0, id: "" };
  }

  return await response.json();
}
