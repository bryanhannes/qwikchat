export async function getModels(
  controller?: AbortController
): Promise<string[]> {
  const response = await fetch(`http://localhost:5173/api/models`, {
    signal: controller?.signal,
    method: "GET",
  });

  if (!response.ok) {
    return Promise.resolve([]);
  }

  return await response.json();
}
