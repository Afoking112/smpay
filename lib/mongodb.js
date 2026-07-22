import mongoose from "mongoose";

const getMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

async function connectDB() {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
        const error = new Error(
            "MongoDB is not configured. Set MONGODB_URI (or MONGO_URI/MONGODB_URL) in your deployment environment."
        );
        console.error(error.message);
        throw error;
    }

    // If already connected
    if (cached.conn) {
        return cached.conn;
    }

    // If connection is in progress
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 30000,
        };

        cached.promise = mongoose
            .connect(mongoUri, opts)
            .then((mongooseInstance) => {
                console.log("MongoDB connected");
                return mongooseInstance;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB error:", error);
        throw error;
    }

    return cached.conn;
}

export default connectDB;