import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI environment variable");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`DB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

export { connectDB };
