import express, { Application } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth"
import { TutorRouter } from "./modules/tutor/tutor.route"
import { StudentRouter } from "./modules/student/student.route"
import { AdminRoutes } from "./modules/admin/admin.route"
import { PaymentRouter } from "./modules/payment/payment.route"
import notFound from "./middleware/notFound"
import globalErrorHandler from "./middleware/globalErrorHandler"

const app: Application = express()

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json())
app.use(cookieParser())
// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.PROD_FRONTEND_URL, // Production frontend URL

].filter(Boolean); // Remove undefined values

// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:5000"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }))

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://your-frontend-domain.vercel.app",
//     ],
//     credentials: true,
//   })
// );

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



// Handle unmatched routes
app.use(notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;