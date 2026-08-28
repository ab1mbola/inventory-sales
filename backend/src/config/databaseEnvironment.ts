export type DatabaseEnvironment = 'dev' | 'prod';

function normalise(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

/**
 * Resolve the application's database target without allowing one deployment
 * environment to silently fall back to the other.
 */
export function getDatabaseEnvironment(
  env: NodeJS.ProcessEnv = process.env
): DatabaseEnvironment {
  const configuredEnvironment = normalise(env.DB_ENV);

  if (configuredEnvironment === 'prod' || configuredEnvironment === 'production') {
    return 'prod';
  }

  if (
    configuredEnvironment === 'dev' ||
    configuredEnvironment === 'development' ||
    configuredEnvironment === 'preview'
  ) {
    return 'dev';
  }

  const vercelEnvironment = normalise(env.VERCEL_ENV);
  if (vercelEnvironment) {
    return vercelEnvironment === 'production' ? 'prod' : 'dev';
  }

  return normalise(env.NODE_ENV) === 'production' ? 'prod' : 'dev';
}

export function getDatabaseConnectionString(
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const databaseEnvironment = getDatabaseEnvironment(env);
  const environmentUrl =
    databaseEnvironment === 'prod' ? env.DATABASE_URL_PROD : env.DATABASE_URL_DEV;

  if (environmentUrl?.trim()) {
    return environmentUrl;
  }

  // DATABASE_URL remains a local-development fallback only. In a configured
  // Vercel/DB_ENV deployment, fail clearly instead of connecting to the wrong DB.
  const hasExplicitRouting = Boolean(normalise(env.DB_ENV)) || Boolean(normalise(env.VERCEL_ENV));
  return hasExplicitRouting ? undefined : env.DATABASE_URL;
}
