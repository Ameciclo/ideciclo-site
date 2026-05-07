import { handleDbRequest } from "../../../server/db-server.mjs";

export default async function handler(request, response) {
  return handleDbRequest(request, response);
}
