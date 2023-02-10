export async function getModels(
  controller?: AbortController
): Promise<string[]> {
  const response = await fetch(`http://localhost:5173/api/models`, {
    signal: controller?.signal,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}
