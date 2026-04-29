import express, { Application } from "express"
import cors from "cors"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth"
import { TutorRouter } from "./modules/tutor/tutor.route"
import { StudentRouter } from "./modules/student/student.route"
import { AdminRoutes } from "./modules/admin/admin.route"
import { PaymentRouter } from "./modules/payment/payment.route"
import notFound from "./middleware/notFound"
import globalErrorHandler from "./middleware/globalErrorHandler"

const app: Application = express()
app.use(express.json())
// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);



app.get('/', (req, res) => {
    res.send('Hello World!')
});

// TUTOR
app.use("/api/v1", TutorRouter);

// STUDENT
app.use("/api/v1", StudentRouter);

// ADMIN
app.use("/api/v1", AdminRoutes)

// PAYMENT
app.use("/api/payment", PaymentRouter);

app.all("/api/auth/*splat", toNodeHandler(auth));

// Handle unmatched routes
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;