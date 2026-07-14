import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = conn.connection.readyState === 1;
    return mongoose;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
