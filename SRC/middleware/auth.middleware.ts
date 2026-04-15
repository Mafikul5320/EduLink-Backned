import { NextFunction, Request, Response } from "express"
import { auth } from "../lib/auth"

export const Middleware = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await auth.api.getSession({
                headers: req.headers as any
            });
            if (!session) {
                return res.status(401).json({ message: "Unauthorized: No session found" });
            };
            if (!session.user.emailVerified) {
                return res.status(401).json({ message: "Unauthorized: Please verify email" });
            };

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailverified: session.user.emailVerified
            }



            console.log(req.user)
            if (allowedRoles.length && !allowedRoles.includes(req.user?.role as string)) {
                return res.status(500).json({
                    sucess: false,
                    error: "Unauthorized...",
                })
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}