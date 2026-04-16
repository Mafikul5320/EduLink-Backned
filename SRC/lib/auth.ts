import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    baseURL: process.env.APP_URL,
     trustedOrigins: [process.env.APP_URL as string],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "STUDENT",
                input: false,
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "ACTIVE",
                input: false,
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false
    }
});