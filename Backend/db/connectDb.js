import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB is connected");
        
    }
    catch(error){
        console.log(`DataBase is not loaded ${error}`);
        process.exit(1);
    }
}

export default connectDb;