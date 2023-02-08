import { Configuration, OpenAIApi } from "openai";
import { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler<string[]> = async () => {
  const configuration = new Configuration({
    apiKey: process.env["OPENAI_API"],
  });
  const openai = new OpenAIApi(configuration);

  try {
    const res = await openai.listModels();

    if (res.data) {
      if (res.data.data) {
        return res.data.data.map((model) => model.id).sort();
      }
    }
  } catch (e) {
    console.log(e);
  }
};
