# Quick Start Guide

## Prerequisites

- Node.js v20.11.0 or later
- npm
- Firebase CLI (`npm install -g firebase-tools`)

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Create `apps/dashboard/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chillipharm-dashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chillipharm-dashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chillipharm-dashboard.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5002/chillipharm-dashboard/europe-west2
```

Get these values from [Firebase Console](https://console.firebase.google.com/project/chillipharm-dashboard/settings/general) under **Your apps > SDK setup and configuration > Config**.

Create `apps/functions/.env`:

```env
GOOGLE_CLOUD_PROJECT=chillipharm-dashboard
```

## 3. Start Development Servers

### Terminal 1: Firebase Functions Emulator

```bash
firebase emulators:start --only functions
```

This starts the API at `http://localhost:5002`

### Terminal 2: Next.js Dashboard

```bash
npx nx run dashboard:dev
```

This starts the frontend at `http://localhost:3000`

## 4. Create a User (First Time Only)

1. Go to [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/chillipharm-dashboard/authentication/users)
2. Click **Add user**
3. Enter email and password
4. Click **Add user**

## 5. Login

Visit `http://localhost:3000` and login with your credentials.

## Common Commands

| Command | Description |
|---------|-------------|
| `npx nx run dashboard:dev` | Start Next.js dev server |
| `npx nx run dashboard:build` | Build for production |
| `firebase emulators:start --only functions` | Start Functions emulator |
| `firebase deploy` | Deploy to Firebase |
| `npx eslint apps/ libs/` | Run ESLint |
| `npx stylelint "**/*.css"` | Run Stylelint |
| `npx prettier --write .` | Format code |

## Project Structure

```
apps/
├── dashboard/           # Next.js frontend
│   ├── app/            # Pages and layouts
│   ├── components/     # React components
│   └── .env.local      # Environment variables
└── functions/          # Firebase Functions API
    ├── index.js        # API endpoints
    └── .env            # Functions environment

libs/
├── api/                # API client library
├── firebase/           # Authentication context
└── ui/                 # Shared components
```

## Troubleshooting

### "Invalid API key"
- Check `apps/dashboard/.env.local` has correct Firebase config
- Restart the dev server after changing env vars

### "No user signed in"
- Create a user in Firebase Console > Authentication > Users

### "Network error" or API not responding
- Ensure Firebase emulator is running (`firebase emulators:start --only functions`)
- Check `NEXT_PUBLIC_API_URL` matches emulator URL

### ESLint "No cached ProjectGraph" warnings
- This is expected when running ESLint outside of Nx context
- Run via Nx for full functionality: `npx nx lint dashboard`
