import mongoose from "mongoose";

export async function connectToDB() {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("mongoDB connected",conn.connection.host);
    }
    catch (error){
        console.log("error connecting to mongo", error.message);
        // process.exit(1); // Commented out to keep server running
    }
}
