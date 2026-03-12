# SpringAI

An AI-powered onboarding tour generator. Add a tracking script to your website and SpringAI automatically analyzes your pages, then uses Claude to generate interactive guided tours for new users.

## Tech Stack

Node.js · Express · MongoDB · EJS · Azure MSAL (Microsoft login) · Anthropic API

## Getting Started

```bash
git clone https://github.com/Amuo007/project_spring
cd project_spring
npm install
```

Create a `.env` file:

```
MONGODB_URL=your_mongodb_url
SESSION_SECRET=your_secret
AZURE_CLIENT_ID=your_client_id
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_CALLBACK_URL=http://localhost:3000/auth/callback
ANTHROPIC_API_KEY=your_api_key
```

```bash
npm start
```

App runs at `http://localhost:3000`

## How It Works

1. Sign in with Microsoft
2. Create a project and copy the generated tracking script
3. Paste the script into your website's `<head>`
4. Visit your pages — SpringAI captures page structure automatically
5. Click **Generate Script** on any tracked page to create an AI onboarding tour

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Microsoft OAuth login |
| `/dashboard` | User projects |
| `/project/:id` | Project dashboard |
| `/project/:id/page/:pageId` | Page details + script generation |

## License

ISC
