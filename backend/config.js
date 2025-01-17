import mongoose  from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const DB_NAME=process.env.DB_NAME;
const MONGO_URL=process.env.MONGO_URL;



const connectToMongo = async()=>{
    try {
    if(!MONGO_URL){
        console.log('Database url not found');
    }
        await mongoose.connect(MONGO_URL, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS:3000,
            socketTimeoutMS:5000
        });
        console.log(`Connected to MongoDB ${DB_NAME}`);
    } catch (error) {
        console.error('Database error server not found');
    }
};


export default connectToMongo;
