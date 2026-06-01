import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables securely
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const isProd = 
    process.env.DB_ENV === 'prod' || 
    process.env.VERCEL_ENV === 'production' || 
    process.env.NODE_ENV === 'production';

  console.log('====================================================');
  console.log('🔄 PRISMA AUTOMATIC MIGRATION RUNNER');
  console.log(`🌍 Environment: ${isProd ? 'PRODUCTION 🔴' : 'DEVELOPMENT 🟢'}`);
  console.log('====================================================');

  if (isProd) {
    console.log('⚡ Production environment detected. Executing migrations and seeding...');
    try {
      console.log('1. Running migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      console.log('2. Running seed script...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      
      console.log('🎉 Production database migrations completed successfully!');
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR: Production database migration/seed failed:', error.message || error);
      // Fail the build in production so broken code isn't deployed against an old schema
      process.exit(1);
    }
  } else {
    console.log('ℹ️ Non-production environment detected.');
    console.log('👉 Skipping automatic migrations to prevent build failures on paused Supabase databases.');
    console.log('👉 If you need to run migrations locally or in dev, use: npm run db:migrate');
  }
  
  console.log('====================================================\n');
  process.exit(0);
}

main();
