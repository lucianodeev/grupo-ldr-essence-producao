import { createServerFn } from "@tanstack/react-start";
import { resolveRequestAuth } from "./request-auth.server";

export const getClientAuthState = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await resolveRequestAuth();
  return {
    authenticated: auth.authenticated,
    userId: auth.userId,
    email: auth.email,
    source: auth.source,
  };
});
