# Firebase Authentication Setup Guide

## Step 1: Get Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/project/chillipharm-dashboard)
2. Click on the **gear icon** (⚙️) next to "Project Overview"
3. Select **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app yet:
   - Click **Add app** and select the **Web** platform (</> icon)
   - Give it a nickname: "ChilliPharm Dashboard"
   - Click **Register app**
6. Copy your Firebase configuration object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "chillipharm-dashboard.firebaseapp.com",
  projectId: "chillipharm-dashboard",
  storageBucket: "chillipharm-dashboard.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 2: Update Firebase Config File

Open `src/lib/firebase.ts` and replace the configuration with your actual values:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "chillipharm-dashboard.firebaseapp.com",
  projectId: "chillipharm-dashboard",
  storageBucket: "chillipharm-dashboard.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

## Step 3: Enable Email/Password Authentication

1. In the Firebase Console, go to **Authentication** (in the left sidebar)
2. Click **Get started** (if this is your first time)
3. Go to the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

## Step 4: Create Your First User

### Option A: Using Firebase Console
1. In Authentication, go to the **Users** tab
2. Click **Add user**
3. Enter an email address (e.g., admin@chillipharm.com)
4. Enter a password (minimum 6 characters)
5. Click **Add user**

### Option B: Using Firebase CLI
```bash
firebase auth:import users.json --project chillipharm-dashboard
```

Create `users.json`:
```json
{
  "users": [
    {
      "email": "admin@chillipharm.com",
      "password": "YourSecurePassword123"
    }
  ]
}
```

## Step 5: Test the Authentication

1. Save all changes
2. The dev server should automatically reload
3. Visit http://localhost:3001
4. You should see a login screen
5. Enter the credentials you created
6. You should be redirected to the dashboard

## Step 6: Deploy to Firebase

Once authentication is working locally:

```bash
# Build the production version
npm run build

# Deploy to Firebase
firebase deploy
```

## Managing Users

### Add More Users
Go to Firebase Console > Authentication > Users > Add user

### Reset Password
Users can reset passwords through Firebase Authentication UI (you can add this feature later)

### View Login Activity
Firebase Console > Authentication > Users shows last sign-in time

## Security Notes

- The Firebase config (API keys, etc.) is safe to expose in client-side code
- Firebase Security Rules protect your data, not the config
- Email/password combinations are securely stored by Firebase
- Consider enabling 2FA in production for admin accounts

## Troubleshooting

### "Cannot read properties of undefined"
- Make sure you've updated the Firebase config in `src/lib/firebase.ts`
- Check that Authentication is enabled in Firebase Console

### "User not found" or "Wrong password"
- Verify the user exists in Firebase Console > Authentication > Users
- Check that Email/Password provider is enabled

### Login works locally but not after deployment
- Make sure you deployed after updating the Firebase config
- Run `npm run build && firebase deploy`

## Next Steps

Consider adding:
- Password reset functionality
- Email verification
- Multiple user roles (admin, viewer, etc.)
- Session timeout
- Remember me functionality
