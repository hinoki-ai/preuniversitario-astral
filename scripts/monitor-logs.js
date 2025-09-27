#!/usr/bin/env node

/**
 * Production Log Monitor
 * Monitors Vercel deployment logs for errors and issues
 */

const { spawn } = require('child_process');
const https = require('https');
const http = require('http');

console.log('📊 PRODUCTION LOG MONITOR');
console.log('=========================');

// Configuration
const CONFIG = {
  vercelToken: process.env.VERCEL_TOKEN,
  projectName: process.env.VERCEL_PROJECT_NAME || 'preuniversitario-astral',
  logLevel: process.env.LOG_LEVEL || 'error',
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 30000, // 30 seconds
  healthCheckUrl: process.env.HEALTH_CHECK_URL || 'https://preuastral.cl/api/health'
};

// Error patterns to watch for
const ERROR_PATTERNS = [
  /❌|🚨|🔴|Error:|Exception:/i,
  /Unhandled Promise Rejection/i,
  /TypeError:/i,
  /ReferenceError:/i,
  /Network Error/i,
  /Failed to fetch/i,
  /Loading chunk/i,
  /ChunkLoadError/i,
  /Script error/i,
  /Authentication failed/i,
  /Database connection failed/i,
  /Convex.*error/i,
  /Clerk.*error/i
];

// Success patterns (for health checks)
const SUCCESS_PATTERNS = [
  /✅|Success:|Completed:/i,
  /Build successful/i,
  /Deployment completed/i
];

function logWithTimestamp(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    error: '❌',
    warn: '⚠️ ',
    success: '✅',
    info: 'ℹ️ '
  }[type] || 'ℹ️ ';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function checkEnvironment() {
  logWithTimestamp('Checking environment configuration...');

  const required = ['VERCEL_TOKEN'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logWithTimestamp(`Missing required environment variables: ${missing.join(', ')}`, 'error');
    console.log('\nTo set up:');
    console.log('export VERCEL_TOKEN=your_token_here');
    return false;
  }

  logWithTimestamp('Environment check passed', 'success');
  return true;
}

function monitorVercelLogs() {
  logWithTimestamp('Starting Vercel log monitoring...');

  return new Promise((resolve, reject) => {
    const vercelArgs = [
      'logs',
      '--follow',
      '--project',
      CONFIG.projectName
    ];

    logWithTimestamp(`Running: vercel ${vercelArgs.join(' ')}`);

    const vercelProcess = spawn('vercel', vercelArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let buffer = '';

    vercelProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      lines.forEach(line => {
        if (line.trim()) {
          analyzeLogLine(line);
        }
      });
    });

    vercelProcess.stderr.on('data', (data) => {
      logWithTimestamp(`Vercel stderr: ${data.toString().trim()}`, 'error');
    });

    vercelProcess.on('error', (error) => {
      logWithTimestamp(`Failed to start Vercel logs: ${error.message}`, 'error');
      reject(error);
    });

    vercelProcess.on('close', (code) => {
      logWithTimestamp(`Vercel logs process exited with code ${code}`, code === 0 ? 'success' : 'warn');
      resolve();
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logWithTimestamp('Shutting down log monitor...', 'info');
      vercelProcess.kill('SIGINT');
      process.exit(0);
    });
  });
}

function analyzeLogLine(line) {
  // Check for error patterns
  const isError = ERROR_PATTERNS.some(pattern => pattern.test(line));
  const isSuccess = SUCCESS_PATTERNS.some(pattern => pattern.test(line));

  if (isError) {
    logWithTimestamp(`ERROR DETECTED: ${line}`, 'error');
    sendAlert('Error detected in production logs', line);
  } else if (isSuccess) {
    logWithTimestamp(`SUCCESS: ${line}`, 'success');
  } else if (CONFIG.logLevel === 'debug') {
    console.log(`[LOG] ${line}`);
  }
}

function sendAlert(title, message) {
  // TODO: Integrate with Slack, Discord, or email notifications
  logWithTimestamp(`ALERT: ${title} - ${message}`, 'warn');

  // Example Slack webhook integration
  if (process.env.SLACK_WEBHOOK_URL) {
    const slackPayload = {
      text: `*${title}*`,
      attachments: [{
        color: 'danger',
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    const postData = JSON.stringify(slackPayload);

    const options = {
      hostname: 'hooks.slack.com',
      path: process.env.SLACK_WEBHOOK_URL.replace('https://hooks.slack.com', ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        logWithTimestamp(`Failed to send Slack alert: ${res.statusCode}`, 'error');
      }
    });

    req.on('error', (error) => {
      logWithTimestamp(`Slack alert error: ${error.message}`, 'error');
    });

    req.write(postData);
    req.end();
  }
}

function performHealthCheck() {
  return new Promise((resolve) => {
    if (!CONFIG.healthCheckUrl) {
      logWithTimestamp('No health check URL configured', 'warn');
      resolve(false);
      return;
    }

    const url = new URL(CONFIG.healthCheckUrl);
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(url, (res) => {
      const isHealthy = res.statusCode >= 200 && res.statusCode < 300;
      logWithTimestamp(
        `Health check: ${res.statusCode} ${isHealthy ? '✅' : '❌'}`,
        isHealthy ? 'success' : 'error'
      );
      resolve(isHealthy);
    });

    req.on('error', (error) => {
      logWithTimestamp(`Health check failed: ${error.message}`, 'error');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      logWithTimestamp('Health check timeout', 'warn');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  if (!checkEnvironment()) {
    process.exit(1);
  }

  logWithTimestamp('Starting production monitoring...');
  logWithTimestamp(`Project: ${CONFIG.projectName}`);
  logWithTimestamp(`Log level: ${CONFIG.logLevel}`);
  logWithTimestamp(`Check interval: ${CONFIG.checkInterval}ms`);

  // Perform initial health check
  await performHealthCheck();

  // Start log monitoring
  try {
    await monitorVercelLogs();
  } catch (error) {
    logWithTimestamp(`Monitoring failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

main();