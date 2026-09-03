import { fetchMock } from "./mock.js";
import { fetchXai } from "./xai.js";

const useMock = process.env.USE_MOCK !== "0";

export function getComentarios() {
  return useMock ? fetchMock() : fetchXai();
}
