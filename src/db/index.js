import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        console.log("MongoDB_URI:", process.env.MongoDB_URI);
        const connectionInstance = await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // await mongoose.connection.collection("users").dropIndex("name_1");
        // console.log("Dropped index name_1");
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB