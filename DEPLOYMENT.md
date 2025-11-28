# Firebase Deployment Guide

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Google account with access to the Firebase project
- Node.js v20.11.0 or later

## Project Configuration

The project uses:
- `firebase.json` - Firebase hosting and functions configuration
- `.firebaserc` - Project aliases

## Step 1: Login to Firebase

```bash
firebase login
```

This opens your browser for Google account authentication.

## Step 2: Build the Dashboard

```bash
npx nx run dashboard:build
```

This creates a production build in `apps/dashboard/out/` (static export).

## Step 3: Deploy

### Deploy Everything (Hosting + Functions)

```bash
firebase deploy
```

### Deploy Only Hosting

```bash
firebase deploy --only hosting
```

### Deploy Only Functions

```bash
firebase deploy --only functions
```

## Step 4: View Your Dashboard

After deployment, you'll see:

```
Deploy complete!

Project Console: https://console.firebase.google.com/project/chillipharm-dashboard/overview
Hosting URL: https://chillipharm-dashboard.web.app
```

## Environment Variables

### Dashboard (Frontend)

Environment variables are embedded at build time. For production, set these in `apps/dashboard/.env.production`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chillipharm-dashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chillipharm-dashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chillipharm-dashboard.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://us-central1-chillipharm-dashboard.cloudfunctions.net
```

### Functions (Backend)

Set runtime environment variables using Firebase:

```bash
firebase functions:config:set google.cloud_project="chillipharm-dashboard"
```

Or use `.env` files in `apps/functions/` for local development.

## Updating the Dashboard

```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Build
npx nx run dashboard:build

# Deploy
firebase deploy
```

## Deployment Targets

| Target | Source | Destination |
|--------|--------|-------------|
| Hosting | `apps/dashboard/out/` | Firebase Hosting |
| Functions | `apps/functions/` | Cloud Functions |

## Troubleshooting

### Build fails

```bash
# Clear caches and rebuild
rm -rf apps/dashboard/.next apps/dashboard/out
npm install
npx nx run dashboard:build
```

### Authentication issues

```bash
firebase logout
firebase login
```

### Deploy fails with permission error

- Ensure you have Editor or Owner role on the Firebase project
- Check project ID in `.firebaserc` matches your Firebase project

### Functions not updating

```bash
# Force redeploy functions
firebase deploy --only functions --force
```

### API calls failing in production

- Verify `NEXT_PUBLIC_API_URL` points to production Functions URL
- Check Firebase Functions logs: `firebase functions:log`

## Firebase Console Links

- [Project Overview](https://console.firebase.google.com/project/chillipharm-dashboard/overview)
- [Hosting](https://console.firebase.google.com/project/chillipharm-dashboard/hosting)
- [Functions](https://console.firebase.google.com/project/chillipharm-dashboard/functions)
- [Authentication](https://console.firebase.google.com/project/chillipharm-dashboard/authentication)
- [Firestore](https://console.firebase.google.com/project/chillipharm-dashboard/firestore)

## CI/CD Integration

For automated deployments, use Firebase GitHub Actions or similar CI tools:

```yaml
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    channelId: live
    projectId: chillipharm-dashboard
```
