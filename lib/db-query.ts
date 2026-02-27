import { prisma } from './prisma';

const QUERY_TIMEOUT_MS = 8000;

type QueryFunction<T> = () => Promise<T>;

/**
 * Executes a database query with timeout and error handling
 * Prevents connection pool exhaustion by ensuring proper cleanup
 */
export async function executeQuery<T>(
  queryFn: QueryFunction<T>,
  timeoutMs: number = QUERY_TIMEOUT_MS
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  
  // Ensure connection before attempting the query
  await ensureConnection();

  // Attempt the query and on pool-timeout try one reconnect+retry
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Query timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const result = await Promise.race([queryFn(), timeoutPromise]);

      if (timeoutId) clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      const message = (error && error.message) ? String(error.message) : '';

      // If it's a pool timeout or connection issue, attempt reconnect once
      if (message.includes('pool timeout') || message.includes('failed to retrieve a connection') || message.includes('ETIMEDOUT')) {
        console.warn(`Database pool timeout detected (attempt ${attempt}). Trying to reconnect...`);
        try {
          await ensureConnection();
        } catch (reconnectError) {
          // If reconnect fails and no more attempts, throw original error
          if (attempt >= maxAttempts) throw error;
          continue;
        }

        // Retry the query on next loop iteration
        if (attempt >= maxAttempts) {
          throw error;
        }
        continue;
      }

      // Timeout error -> surface as-is
      if (error instanceof Error && error.message.includes('timeout')) {
        throw error;
      }

      throw error;
    }
  }
  
  // Should not reach here
  throw new Error('Unexpected query execution flow');
}

/**
 * Reconnect to database if connection is lost
 */
export async function ensureConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Database connection lost, attempting to reconnect...');
    try {
      await prisma.$disconnect();
      await prisma.$connect();
    } catch (reconnectError) {
      console.error('Failed to reconnect:', reconnectError);
      throw reconnectError;
    }
  }
}

/**
 * Cleanup database connection on process exit
 */
export async function cleanupDatabase(): Promise<void> {
  await prisma.$disconnect();
}
