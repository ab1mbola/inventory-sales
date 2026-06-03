import { Client } from 'pg';

export interface PingResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface KeepAliveResults {
  development: PingResult;
  production: PingResult;
}

async function pingDatabase(name: string, envVarName: string, connectionString: string | undefined): Promise<PingResult> {
  const timestamp = new Date().toISOString();
  if (!connectionString) {
    return {
      success: false,
      message: `${name} database URL (${envVarName}) is not defined in environment variables.`,
      timestamp
    };
  }

  // Set TLS reject unauthorized to '0' to avoid self-signed cert issues with Supabase in dev
  const previousTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000, // 15 seconds timeout
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ping;');
    if (res.rows[0]?.ping === 1) {
      return {
        success: true,
        message: `Successfully connected and pinged ${name} database.`,
        timestamp
      };
    } else {
      return {
        success: false,
        message: `Connected to ${name} database but received unexpected ping response: ${JSON.stringify(res.rows)}`,
        timestamp
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to ping ${name} database: ${error.message || error}`,
      timestamp
    };
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore client closing errors
    }
    // Restore previous environment state
    if (previousTls !== undefined) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTls;
    } else {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
  }
}

export async function pingAllDatabases(): Promise<KeepAliveResults> {
  const devUrl = process.env.DATABASE_URL_DEV;
  const prodUrl = process.env.DATABASE_URL_PROD;

  const [devResult, prodResult] = await Promise.all([
    pingDatabase('development', 'DATABASE_URL_DEV', devUrl),
    pingDatabase('production', 'DATABASE_URL_PROD', prodUrl)
  ]);

  return {
    development: devResult,
    production: prodResult
  };
}
