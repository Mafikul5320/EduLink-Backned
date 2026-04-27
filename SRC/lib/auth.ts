import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { oAuthProxy } from "better-auth/plugins";

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
        // requireEmailVerification: false
    },
    // for deploy
    advanced: {
        cookies: {
            session_token: {
                name: "session_token",
                attributes: {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    partitioned: true
                }
            },
            state: {
                name: "session_token",
                attributes: {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    partitioned: true
                }
            }
        }
    },
    plugins: [oAuthProxy()]
});