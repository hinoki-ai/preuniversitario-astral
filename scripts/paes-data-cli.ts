#!/usr/bin/env node

/**
 * PAES Data Entry CLI Tool
 *
 * This script helps you:
 * 1. Generate PAES test templates
 * 2. Validate imported data
 * 3. Convert data to different formats
 * 4. Generate Convex insert statements
 *
 * Usage:
 * npx tsx scripts/paes-data-cli.ts generate matematica_m1 2024 Regular
 * npx tsx scripts/paes-data-cli.ts validate data/paes-sample.json
 * npx tsx scripts/paes-data-cli.ts convert data/paes-sample.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PaesDataImporter, PaesImportData } from '../lib/paes-importer';
import { PaesConverter } from '../lib/paes-converter';
import { PaesDataManager } from '../lib/paes-manager';

const [command, ...args] = process.argv.slice(2);

function showHelp() {
  console.log(`
PAES Data Entry CLI Tool

Usage:
  generate <assignment> <year> <session>  - Generate a test template
  validate <file>                         - Validate imported data
  convert <file>                          - Convert and show formats
  stats <file>                            - Show data statistics

Examples:
  npm run tsx scripts/paes-data-cli.ts generate matematica_m1 2024 Regular
  npm run tsx scripts/paes-data-cli.ts validate data/matematica-2024.json
  npm run tsx scripts/paes-data-cli.ts convert data/matematica-2024.json
  `);
}

function generateTemplate(assignment: string, year: string, session: string) {
  const template = PaesDataImporter.generateTemplate(
    assignment as any,
    parseInt(year),
    session
  );

  const filename = `${assignment}-${year}-${session.toLowerCase()}.template.json`;
  const filepath = join(process.cwd(), 'data', filename);

  writeFileSync(filepath, JSON.stringify(template, null, 2));
  console.log(`✅ Template generated: ${filepath}`);

  console.log('\n📝 Next steps:');
  console.log('1. Open the template file');
  console.log('2. Replace the questions array with real PAES questions');
  console.log('3. Run: npm run tsx scripts/paes-data-cli.ts validate', filename);
}

function validateData(filepath: string) {
  try {
    const data = JSON.parse(readFileSync(filepath, 'utf8'));
    const errors = PaesDataImporter.validateImportData(data);

    if (errors.length === 0) {
      console.log('✅ Data is valid!');
      console.log(`📊 ${data.questions.length} questions ready`);
      return true;
    } else {
      console.log('❌ Validation errors found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.field}: ${error.message}`);
        if (error.questionIndex !== undefined) {
          console.log(`     Question ${error.questionIndex + 1}`);
        }
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Error reading file:', error);
    return false;
  }
}

function convertData(filepath: string) {
  try {
    const data = JSON.parse(readFileSync(filepath, 'utf8'));

    console.log('\n🔄 Converting data formats...\n');

    // Convert to PAES test format
    const paesTest = PaesDataImporter.convertToPaesTest(data);

    // Show Convex format
    console.log('📦 CONVEX FORMAT (for database):');
    console.log(JSON.stringify(PaesConverter.toConvexFormat(paesTest), null, 2));

    console.log('\n📋 DEMO FORMAT (for fallback):');
    console.log(JSON.stringify(PaesConverter.toDemoFormat(paesTest), null, 2));

    // Generate insert statements
    console.log('\n💾 CONVEX INSERT STATEMENTS (for seed.ts):');
    const statements = PaesConverter.generateConvexInserts(paesTest);
    statements.forEach(stmt => console.log(stmt));

    console.log('\n📈 Statistics:');
    const stats = PaesDataManager.getPaesStats([paesTest]);
    console.log(`  - Questions: ${stats.totalQuestions}`);
    console.log(`  - Assignment: ${paesTest.assignmentLabel}`);
    console.log(`  - Duration: ${paesTest.durationSec / 60} minutes`);

  } catch (error) {
    console.error('❌ Error converting data:', error);
  }
}

function showStats(filepath: string) {
  try {
    const data = JSON.parse(readFileSync(filepath, 'utf8'));
    const test = PaesDataImporter.convertToPaesTest(data);

    console.log('\n📊 PAES TEST STATISTICS');
    console.log('=' .repeat(30));
    console.log(`Title: ${test.title}`);
    console.log(`Questions: ${test.questions.length}`);
    console.log(`Duration: ${test.durationSec / 60} minutes`);
    console.log(`Assignment: ${test.assignmentLabel}`);
    console.log(`Source: ${test.source}`);
    console.log(`Year: ${test.year}, Session: ${test.session}`);

    const issues = PaesDataManager.validateTest(test);
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ No issues found');
    }

  } catch (error) {
    console.error('❌ Error analyzing data:', error);
  }
}

switch (command) {
  case 'generate':
    if (args.length < 3) {
      console.log('❌ Missing arguments. Usage: generate <assignment> <year> <session>');
      process.exit(1);
    }
    generateTemplate(args[0], args[1], args[2]);
    break;

  case 'validate':
    if (args.length < 1) {
      console.log('❌ Missing file argument');
      process.exit(1);
    }
    const isValid = validateData(args[0]);
    process.exit(isValid ? 0 : 1);
    break;

  case 'convert':
    if (args.length < 1) {
      console.log('❌ Missing file argument');
      process.exit(1);
    }
    convertData(args[0]);
    break;

  case 'stats':
    if (args.length < 1) {
      console.log('❌ Missing file argument');
      process.exit(1);
    }
    showStats(args[0]);
    break;

  default:
    showHelp();
    break;
}