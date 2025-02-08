import mongoose from "mongoose";    
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connectionVariable = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); 
        console.log("Connected to MongoDB: Here is the detailes of variable: ", connectionVariable.connection.host)       
    } catch (error) {
        console.error("ERROR: ",error);
        process.exit(1);
        
    }
    
}

export default connectDB;