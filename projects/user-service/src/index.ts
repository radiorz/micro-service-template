import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { t, User } from "shared";
import { z } from "zod";

const app = express();

const users: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const userRouter = t.router({
  getUser: t.procedure.input(z.string()).query((req) => {
    const user = users.find((u) => u.id === req.input);
    if (!user) throw new Error("User not found");
    return user;
  }),
  createUser: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation((req) => {
      const newUser: User = {
        id: (users.length + 1).toString(),
        name: req.input.name,
      };
      users.push(newUser);
      return newUser;
    }),
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: userRouter,
  })
);

app.listen(3000, () => {
  console.log("User service listening on port 3000");
});

export type UserRouter = typeof userRouter;
