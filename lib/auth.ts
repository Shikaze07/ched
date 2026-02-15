import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./prisma"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {

        provider: "mysql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
    },
    plugins: [
        nextCookies()
    ]
});
