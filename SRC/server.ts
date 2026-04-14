import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 5000
async function main() {
    try {
        await prisma.$connect();
        console.log("Database connect sucessfull..")
        app.listen(port, () => {
            console.log(`server is running on port ${port}`)
        })
    } catch (error) {
        console.log(error)
        await prisma.$disconnect()
        process.exit(1)
    }
}
main()