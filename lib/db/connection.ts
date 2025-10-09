import postgres from 'postgres';

// Create a singleton PostgreSQL connection
// The DATABASE_URL environment variable is automatically provided by Render
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please configure it in your Render dashboard or .env file.'
  );
}

// Configure the postgres client with connection pooling
const sql = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false, // Require SSL in production
  // Transform column names from snake_case to camelCase automatically
  transform: {
    column: {
      to: postgres.toCamel,
      from: postgres.toSnake,
    },
  },
  // Enable debugging in development
  debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Test the connection when the module is first imported
(async () => {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

export default sql;
