#!/usr/bin/env node

/**
 * Quick setup script for Langfuse integration
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupLangfuse() {
  console.log('\n🚀 Welcome to Langfuse Setup for Agent Tracking!\n');
  
  console.log('📝 First, you need to:');
  console.log('1. Go to https://cloud.langfuse.com');
  console.log('2. Create a free account');
  console.log('3. Create a new project');
  console.log('4. Go to Settings → API Keys');
  console.log('5. Copy your Public Key (pk_lf_...) and Secret Key (sk_lf_...)\n');
  
  const hasAccount = await question('Do you have a Langfuse account and API keys? (y/n): ');
  
  if (hasAccount.toLowerCase() !== 'y') {
    console.log('\n📚 Please visit https://cloud.langfuse.com to set up your account first.');
    console.log('📄 See docs/LANGFUSE_SETUP.md for detailed instructions.');
    rl.close();
    return;
  }
  
  console.log('\n🔑 Enter your Langfuse credentials:');
  const publicKey = await question('Public Key (pk_lf_...): ');
  const secretKey = await question('Secret Key (sk_lf_...): ');
  const baseUrl = await question('Base URL (press Enter for https://cloud.langfuse.com): ') || 'https://cloud.langfuse.com';
  
  // Create .env file
  const envContent = `# Langfuse Configuration for Agent Tracking
LANGFUSE_PUBLIC_KEY=${publicKey}
LANGFUSE_SECRET_KEY=${secretKey}
LANGFUSE_BASE_URL=${baseUrl}

# Optional: Set to true to disable auth for testing
# DANGEROUSLY_OMIT_AUTH=true
`;

  fs.writeFileSync('.env', envContent);
  
  console.log('\n✅ Successfully created .env file!');
  console.log('\n🧪 Test your setup:');
  console.log('npm run build && npm start');
  console.log('\n📊 Your agent traces will now appear in Langfuse dashboard!');
  console.log(`🌐 View them at: ${baseUrl}`);
  
  rl.close();
}

async function main() {
  try {
    await setupLangfuse();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
  }
}

main();
