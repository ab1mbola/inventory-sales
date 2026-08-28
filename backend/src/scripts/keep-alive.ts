import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from backend/.env securely
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

import { pingAllDatabases } from '../services/keepAliveService.js';

async function run() {
  console.log('====================================================');
  console.log('🚀 SUPABASE DATABASE KEEP-ALIVE SYSTEM');
  console.log(`📅 Executed At: ${new Date().toLocaleString()}`);
  console.log('====================================================');

  try {
    const results = await pingAllDatabases();

    console.log('\n🔧 [Development Database Ping]');
    if (results.development.success) {
      console.log('🟢 Status: SUCCESS');
    } else {
      console.log('🔴 Status: FAILED');
    }
    console.log(`💬 Detail: ${results.development.message}`);

    console.log('\n📦 [Production Database Ping]');
    if (results.production.success) {
      console.log('🟢 Status: SUCCESS');
    } else {
      console.log('🔴 Status: FAILED');
    }
    console.log(`💬 Detail: ${results.production.message}`);

    console.log('\n====================================================');
    
    const overallSuccess = results.development.success && results.production.success;
    if (overallSuccess) {
      console.log('🎉 Database keep-alive runs completed successfully!');
      process.exit(0);
    } else {
      console.error('⚠️ Keep-alive runs completed with some errors.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ CRITICAL: Unhandled error in keep-alive script:', error);
    process.exit(1);
  }
}

run();
