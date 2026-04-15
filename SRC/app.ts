import express, { Application } from "express"
import cors from "cors"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth"
import { TutorRouter } from "./modules/tutor/tutor.route"
import { StudentRouter } from "./modules/student/student.route"

const app: Application = express()
app.use(express.json())
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}))


app.get('/', (req, res) => {
    res.send('Hello World!')
});

// TUTOR
app.use("/api/v1", TutorRouter);

// STUDENT
app.use("/api/v1", StudentRouter);

app.all("/api/auth/*splat", toNodeHandler(auth));


export default app;