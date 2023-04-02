import { Configuration, OpenAIApi } from "openai";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ json }) => {
  const configuration = new Configuration({
    apiKey: process.env["OPENAI_API"],
  });
  const openai = new OpenAIApi(configuration);

  const res = await openai.listModels();

  if (res.data) {
    if (res.data.data) {
      json(200, res.data.data.map((model) => model.id).sort());
    }
  }
};
