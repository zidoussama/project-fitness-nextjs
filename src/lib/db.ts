// lib/db.ts
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

// === Mongoose (for custom User model) ===
declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var mongo: { conn: MongoClient | null; promise: Promise<MongoClient> | null } | undefined;
}

const cachedMongoose = global.mongoose ?? { conn: null, promise: null };
if (!global.mongoose) global.mongoose = cachedMongoose;

export async function dbConnectMongoose() {
  if (cachedMongoose.conn) return cachedMongoose.conn;

  if (!cachedMongoose.promise) {
    cachedMongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cachedMongoose.conn = await cachedMongoose.promise;
  return cachedMongoose.conn;
}

// === Native MongoDB Client (for MongoDBAdapter) ===
const cachedMongoClient = global.mongo ?? { conn: null, promise: null };
if (!global.mongo) global.mongo = cachedMongoClient;

export async function dbConnectMongo(): Promise<MongoClient> {
  if (cachedMongoClient.conn) {
    return cachedMongoClient.conn;
  }

  if (!cachedMongoClient.promise) {
    cachedMongoClient.promise = MongoClient.connect(MONGODB_URI);
  }

  cachedMongoClient.conn = await cachedMongoClient.promise;
  return cachedMongoClient.conn;
}
