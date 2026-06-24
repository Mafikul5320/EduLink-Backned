import { NextFunction, Request, Response } from "express"
import { auth } from "../lib/auth"

export const Middleware = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await auth.api.getSession({
                headers: req.headers as any
            });
            
            if (!session) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized: No session found" 
                });
            }
            
            if (!session.user.emailVerified) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized: Please verify email" 
                });
            }
            
            if (session.user.status === "BANNED") {
                return res.status(403).json({ 
                    success: false,
                    message: "Forbidden: Your account has been banned" 
                });
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                status: session.user.status as string,
                emailverified: session.user.emailVerified
            }

            console.log("Authenticated user:", req.user);

            if (allowedRoles.length && (!req.user?.role || !allowedRoles.includes((req.user.role as string).toUpperCase()))) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You do not have permission to perform this action",
                })
            }

            next()
        } catch (error) {
            console.error("Auth middleware error:", error);
            next(error)
        }
    }
}