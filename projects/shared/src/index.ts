import { initTRPC } from "@trpc/server";

export const t = initTRPC.create();

export interface User {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  product: string;
}
