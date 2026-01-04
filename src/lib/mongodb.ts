// ============================================
// MongoDB Connection Utility
// ============================================
// Singleton pattern for MongoDB connection in Next.js
// Caches connection in development to prevent multiple connections
// during hot reloading

import { MongoClient, Db, Collection } from 'mongodb';
import type { PriceDocument, VolumeDocument, MetadataDocument } from '@/types';

// ============================================
// Type Declarations
// ============================================

interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

// Extend global type for connection caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// ============================================
// Configuration
// ============================================

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'near-trading-dashboard';

// Collection names
export const COLLECTIONS = {
  PRICES: 'prices',
  VOLUMES: 'volumes',
  METADATA: 'metadata',
} as const;

// ============================================
// Connection Management
// ============================================

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Get MongoDB client with connection pooling
 * Uses global caching in development to prevent connection exhaustion
 */
async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable in .env.local'
    );
  }

  // In development, use global variable to preserve connection across hot reloads
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  // In production, create a new connection
  if (!cachedClient) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    cachedClient = await client.connect();
  }

  return cachedClient;
}

/**
 * Get database connection
 */
export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await getMongoClient();
  cachedDb = client.db(DB_NAME);

  return cachedDb;
}

/**
 * Get full connection (client + db)
 */
export async function connectToDatabase(): Promise<MongoDBConnection> {
  const client = await getMongoClient();
  const db = client.db(DB_NAME);

  return { client, db };
}

// ============================================
// Collection Helpers
// ============================================

/**
 * Get prices collection with proper typing
 */
export async function getPricesCollection(): Promise<Collection<PriceDocument>> {
  const db = await getDatabase();
  return db.collection<PriceDocument>(COLLECTIONS.PRICES);
}

/**
 * Get volumes collection with proper typing
 */
export async function getVolumesCollection(): Promise<Collection<VolumeDocument>> {
  const db = await getDatabase();
  return db.collection<VolumeDocument>(COLLECTIONS.VOLUMES);
}

/**
 * Get metadata collection with proper typing
 */
export async function getMetadataCollection(): Promise<Collection<MetadataDocument>> {
  const db = await getDatabase();
  return db.collection<MetadataDocument>(COLLECTIONS.METADATA);
}

// ============================================
// Database Initialization
// ============================================

/**
 * Initialize database with required indexes
 * Call this once during setup or deployment
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  // Prices collection indexes
  const pricesCollection = db.collection(COLLECTIONS.PRICES);
  await pricesCollection.createIndex({ timestamp: -1 });
  await pricesCollection.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // TTL: 90 days
  );

  // Volumes collection indexes
  const volumesCollection = db.collection(COLLECTIONS.VOLUMES);
  await volumesCollection.createIndex({ timestamp: -1 });
  await volumesCollection.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // TTL: 90 days
  );

  // Metadata collection indexes
  const metadataCollection = db.collection(COLLECTIONS.METADATA);
  await metadataCollection.createIndex({ key: 1 }, { unique: true });

  console.log('Database indexes initialized successfully');
}

// ============================================
// Health Check
// ============================================

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    const latency = Date.now() - startTime;

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
