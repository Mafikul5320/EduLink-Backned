import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { oAuthProxy } from "better-auth/plugins";
import { prisma } from "./prisma";

const isDevelopment = process.env.NODE_ENV === "development";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const backendUrl = process.env.APP_URL || "http://localhost:5000";

export const auth = betterAuth({
    baseURL: backendUrl,
    trustedOrigins: [frontendUrl, backendUrl],
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
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
    advanced: {
        cookies: {
            session_token: {
                name: "better-auth.session_token",
                attributes: {
                    httpOnly: true,
                    secure: !isDevelopment, // true in production, false in development
                    sameSite: isDevelopment ? "lax" : "none",
                    path: "/",
                    ...(isDevelopment ? {} : { partitioned: true }),
                },
            },
        },
    },

    // plugins: [oAuthProxy()]
});