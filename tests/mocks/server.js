import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Configure a server to mock requests
export const server = setupServer(...handlers);
