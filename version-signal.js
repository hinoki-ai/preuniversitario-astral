#!/usr/bin/env node

/**
 * Version Signal Script
 *
 * This script creates a .version-signal file that tells the gg script
 * to increment the version and update the changelog.
 *
 * Usage:
 *   node version-signal.js [type] [message]
 *
 * Types:
 *   - patch: for bug fixes (0.1.0 -> 0.1.1)
 *   - minor: for new features (0.1.0 -> 0.2.0)
 *   - major: for breaking changes (0.1.0 -> 1.0.0)
 *
 * Examples:
 *   node version-signal.js patch "Fixed login bug"
 *   node version-signal.js minor "Added new dashboard feature"
 *   node version-signal.js major "Complete UI redesign"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const type = args[0] || 'patch';
const message = args.slice(1).join(' ') || 'Version increment';

const validTypes = ['patch', 'minor', 'major'];

if (!validTypes.includes(type)) {
  console.error(`Invalid version type: ${type}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Read current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);
console.log(`Version type: ${type}`);
console.log(`Message: ${message}`);

// Create signal file
const signalData = {
  type,
  message,
  timestamp: new Date().toISOString(),
  currentVersion
};

fs.writeFileSync('.version-signal', JSON.stringify(signalData, null, 2));
console.log('✅ Created .version-signal file');
console.log('Run "gg" to apply the version increment and update the changelog.');