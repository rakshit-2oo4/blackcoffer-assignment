import mongoose from "mongoose";
import { seedDatabase } from "../utils/seedData.js";
import DataRecord from "../models/DataRecord.js";

export let isMongoConnected = false;

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/assignment";
    try {
        console.log("🔌 Connecting to MongoDB...");
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 4000
        });
        isMongoConnected = true;
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);

        const count = await DataRecord.countDocuments();
        if (count === 0) {
            console.log("🌱 Database empty, auto-seeding records...");
            await seedDatabase();
        }
    } catch (err) {
        isMongoConnected = false;
        console.warn(`⚠️ MongoDB connection warning: ${err.message}`);
        console.log("⚡ Enabling resilient JSON data engine fallback so backend serves all API requests seamlessly!");
    }
};

export default connectDB;