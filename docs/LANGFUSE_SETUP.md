# Setting Up Langfuse for Agent Tracking

## Quick Setup Guide

### 1. Create Langfuse Account
1. Go to [https://cloud.langfuse.com](https://cloud.langfuse.com)
2. Sign up for a free account
3. Create a new project

### 2. Get API Keys
1. In your Langfuse project, go to **Settings** → **API Keys**
2. Copy your **Public Key** (starts with `pk_lf_`)
3. Copy your **Secret Key** (starts with `sk_lf_`)

### 3. Set Environment Variables
Create a `.env` file in the root directory:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit the .env file with your keys
LANGFUSE_PUBLIC_KEY=pk_lf_your_actual_key_here
LANGFUSE_SECRET_KEY=sk_lf_your_actual_key_here
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### 4. Test the Integration
```bash
# Load environment variables and start server
source .env && npm run build && npm start
```

### 5. Alternative: Quick Test Setup
If you just want to test without Langfuse, you can disable it:
```bash
export LANGFUSE_PUBLIC_KEY=""
export LANGFUSE_SECRET_KEY=""
```

The system will work without Langfuse - you just won't get persistent trace storage.

## What Langfuse Provides

- **Trace Storage**: Persistent storage of all agent interactions
- **Analytics**: Performance metrics and usage patterns  
- **Debugging**: Detailed logs of tool calls and responses
- **Collaboration**: Share traces with team members
- **API**: Query trace data programmatically

## Langfuse Dashboard Features

Once connected, you'll see in Langfuse:
- All agent sessions as traces
- Tool calls as spans within traces
- Performance metrics (latency, token usage)
- Error tracking and debugging info
- User segmentation by agent ID
