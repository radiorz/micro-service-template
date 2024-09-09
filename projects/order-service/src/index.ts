import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { t, Order } from "shared";
import { z } from "zod";
import type { UserRouter } from "../../user-service/src";

const app = express();

const orders: Order[] = [];

const userService = createTRPCProxyClient<UserRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

const orderRouter = t.router({
  createOrder: t.procedure
    .input(z.object({ userId: z.string(), product: z.string() }))
    .mutation(async (req) => {
      const user = await userService.getUser.query(req.input.userId);
      if (!user) throw new Error("User not found");

      const newOrder: Order = {
        id: (orders.length + 1).toString(),
        userId: user.id,
        product: req.input.product,
      };
      orders.push(newOrder);
      return newOrder;
    }),
  getOrders: t.procedure.input(z.string()).query((req) => {
    return orders.filter((o) => o.userId === req.input);
  }),
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: orderRouter,
  })
);

app.listen(3001, () => {
  console.log("Order service listening on port 3001");
});
