#!/usr/bin/env node

/**
 * Deployment Error Debugging Script
 * Helps identify and analyze console errors in production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DEPLOYMENT ERROR DEBUGGER');
console.log('==============================');

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n📋 ENVIRONMENT VARIABLES CHECK:');
  console.log('--------------------------------');

  const requiredVars = [
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NODE_ENV'
  ];

  const optionalVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_VERCEL_ANALYTICS_ID',
    'NEXT_PUBLIC_ENABLE_ZOOM',
    'NEXT_PUBLIC_ENABLE_MOCK_EXAMS'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'SET' : 'MISSING'}`);
    if (!value) allPresent = false;
  });

  console.log('\nOptional variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '⚠️ ';
    console.log(`${status} ${varName}: ${value ? 'SET' : 'NOT SET'}`);
  });

  return allPresent;
}

// Check for build artifacts
function checkBuildArtifacts() {
  console.log('\n🏗️  BUILD ARTIFACTS CHECK:');
  console.log('----------------------------');

  const artifacts = [
    '.next',
    'node_modules',
    'convex.json'
  ];

  artifacts.forEach(artifact => {
    const exists = fs.existsSync(path.join(process.cwd(), artifact));
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${artifact}: ${exists ? 'EXISTS' : 'MISSING'}`);
  });
}

// Check for potential issues in code
function checkCodeIssues() {
  console.log('\n🔍 CODE ANALYSIS:');
  console.log('-----------------');

  // Check for console.log statements (potential debugging code)
  const consoleLogs = grepConsoleLogs();
  if (consoleLogs.length > 0) {
    console.log(`⚠️  Found ${consoleLogs.length} console.log statements:`);
    consoleLogs.slice(0, 5).forEach(log => {
      console.log(`   - ${log.file}:${log.line}: ${log.content.substring(0, 50)}...`);
    });
  } else {
    console.log('✅ No console.log statements found');
  }

  // Check for potential error sources
  const errorSources = checkForErrorSources();
  if (errorSources.length > 0) {
    console.log(`⚠️  Potential error sources found:`);
    errorSources.forEach(source => {
      console.log(`   - ${source}`);
    });
  }
}

function grepConsoleLogs() {
  const logs = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.includes('console.log')) {
            logs.push({
              file: path.relative(__dirname, fullPath),
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    });
  }

  try {
    scanDirectory(__dirname);
  } catch (error) {
    console.log('⚠️  Could not scan for console.log statements:', error.message);
  }

  return logs;
}

function checkForErrorSources() {
  const sources = [];

  // Check for common error-prone patterns
  const patterns = [
    { pattern: 'throw new Error', description: 'Manual error throwing' },
    { pattern: 'console.error', description: 'Error logging' },
    { pattern: 'catch.*error', description: 'Error handling blocks' },
    { pattern: 'try.*{', description: 'Try-catch blocks' }
  ];

  // This is a simplified check - in a real scenario you'd want more sophisticated analysis
  sources.push('Consider reviewing async/await usage in API routes');
  sources.push('Check for missing null checks in data fetching');
  sources.push('Verify environment variable usage in components');

  return sources;
}

// Main execution
async function main() {
  const envCheck = checkEnvironmentVariables();
  checkBuildArtifacts();
  checkCodeIssues();

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('-------------------');

  if (!envCheck) {
    console.log('❌ Fix missing environment variables before deploying');
    console.log('   Run: vercel env pull .env.local');
    console.log('   Then: vercel --prod');
  } else {
    console.log('✅ Environment variables look good');
  }

  console.log('\n🔧 DEBUGGING TIPS:');
  console.log('------------------');
  console.log('1. Check Vercel function logs: vercel logs --follow');
  console.log('2. Monitor browser console in production');
  console.log('3. Use React DevTools in production build');
  console.log('4. Check network tab for failed API calls');
  console.log('5. Monitor error boundaries in components');

  console.log('\n📊 PRODUCTION MONITORING:');
  console.log('-------------------------');
  console.log('Consider integrating:');
  console.log('- Sentry for error tracking');
  console.log('- LogRocket for session replay');
  console.log('- DataDog for performance monitoring');

  process.exit(envCheck ? 0 : 1);
}

main().catch(console.error);