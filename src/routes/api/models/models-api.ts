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

  console.log(response.headers);

  try {
    console.log(await response.json());
    // return response.json();
    return [];
  } catch (e) {
    console.log(e);
  }

  return [];

  // const result = await response.json();

  // return result;
}
