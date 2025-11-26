# Firebase Deployment Guide

## Prerequisites
- Firebase CLI installed ✓ (v14.12.0)
- Google account
- Production build created ✓

## Step 1: Login to Firebase

Open a new terminal window and run:

```bash
cd /Users/leehiggins/Desktop/Reporting/chillipharm-dashboard
firebase login
```

This will open your browser to authenticate with your Google account.

## Step 2: Create a New Firebase Project

### Option A: Create via Firebase Console (Recommended)
1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: `chillipharm-dashboard` (or your preferred name)
4. Click Continue
5. Disable Google Analytics (optional for this project)
6. Click "Create project"
7. Wait for project creation to complete
8. Copy your project ID from the console

### Option B: Create via CLI
```bash
# This will guide you through creating a new project
firebase projects:create
```

## Step 3: Initialize Firebase Project

Link your local project to the Firebase project:

```bash
firebase use --add
```

Select the project you just created and give it an alias (e.g., "default")

Or create a `.firebaserc` file manually:

```json
{
  "projects": {
    "default": "your-project-id-here"
  }
}
```

## Step 4: Deploy to Firebase Hosting

```bash
firebase deploy
```

This will:
- Upload your `dist` folder to Firebase Hosting
- Configure the hosting rules
- Provide you with a live URL

## Step 5: View Your Dashboard

After deployment, you'll see output like:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

Visit the Hosting URL to see your live dashboard!

## Updating the Dashboard

Whenever you make changes:

```bash
# Build the latest version
npm run build

# Deploy to Firebase
firebase deploy
```

## Troubleshooting

### Build fails
```bash
npm install
npm run build
```

### Authentication issues
```bash
firebase logout
firebase login
```

### Deploy fails
Check that:
- You're in the correct directory
- The `dist` folder exists and contains files
- You have the correct permissions for the Firebase project

## Configuration Files

The following files have been created:

- `firebase.json` - Firebase hosting configuration
- `.gitignore` - Git ignore rules
- `dist/` - Production build output (created by `npm run build`)

## Notes

- The dashboard loads data from `public/data.xlsx`
- All data processing happens client-side
- No backend server required
- Free tier should be sufficient for this dashboard
