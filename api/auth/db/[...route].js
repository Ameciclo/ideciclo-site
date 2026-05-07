import { handleAuthRequest } from "../../../server/auth-server.mjs";

export default async function handler(request, response) {
  return handleAuthRequest(request, response);
}
