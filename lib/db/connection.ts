import postgres from 'postgres';

// Create a singleton PostgreSQL connection
// The DATABASE_URL environment variable is automatically provided by Render
const connectionString = process.env.DATABASE_URL;

// During build time, DATABASE_URL might not be available
// Create a mock connection that will throw errors if actually used
let sql: ReturnType<typeof postgres>;

if (!connectionString) {
  // Only throw error if we're not in build phase
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    console.warn('⚠️  DATABASE_URL not set. Database operations will fail at runtime.');
  }

  // Create a proxy that throws errors when called
  sql = new Proxy({} as ReturnType<typeof postgres>, {
    get: () => {
      throw new Error('DATABASE_URL environment variable is not set. Please configure it in your Render dashboard or .env file.');
    }
  });
} else {
  // Configure the postgres client with connection pooling
  sql = postgres(connectionString, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false, // Require SSL in production
    // Enable debugging in development
    debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Test the connection when the module is first imported (only if connectionString exists and not during build)
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    (async () => {
      try {
        await sql`SELECT 1 as test`;
        console.log('✅ Database connection established successfully');
      } catch (error) {
        console.error('❌ Database connection failed:', error);
      }
    })();
  }
}

export default sql;
