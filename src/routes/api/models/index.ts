export const config = {
  runtime: "edge",
};

const handler = async (): Promise<Response> => {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API ?? ""}`,
    },
    method: "GET",
  });

  const models = await res.json();

  if (models && models.data) {
    return models.data.map((model: { id: any }) => model.id).sort();
  } else {
    throw new Error("No models found.");
  }
};

export default handler;
