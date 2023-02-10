import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler<string[]> = async ({
  headers,
}): Promise<string[]> => {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API ?? ""}`,
    },
    method: "GET",
  });

  const models = await res.json();

  if (models && models.data) {
    headers.set("Content-Type", "application/json");
    return models.data.map((model: { id: any }) => model.id).sort();
  } else {
    throw new Error("No models found.");
  }
};
