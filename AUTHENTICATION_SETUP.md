# Firebase Authentication Setup

## Architecture Overview

Authentication is handled by two components:

1. **Frontend (`libs/firebase/`)**: React context provider that manages user state
2. **Backend (`apps/functions/`)**: Middleware that verifies Firebase ID tokens

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/project/chillipharm-dashboard/settings/general)
2. Click the **gear icon** next to "Project Overview"
3. Select **Project settings**
4. Scroll to **Your apps** section
5. If no web app exists, click **Add app** and select **Web** (</> icon)
6. Copy the configuration values

## Step 2: Configure Environment Variables

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

## Step 3: Enable Email/Password Authentication

1. Go to [Firebase Console > Authentication](https://console.firebase.google.com/project/chillipharm-dashboard/authentication/providers)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

## Step 4: Create Users

### Via Firebase Console

1. Go to [Authentication > Users](https://console.firebase.google.com/project/chillipharm-dashboard/authentication/users)
2. Click **Add user**
3. Enter email and password (minimum 6 characters)
4. Click **Add user**

### Via Firebase CLI

```bash
firebase auth:import users.json --project chillipharm-dashboard
```

## Step 5: Test Authentication

1. Start the development servers:

```bash
# Terminal 1: Functions emulator
firebase emulators:start --only functions

# Terminal 2: Next.js
npx nx run dashboard:dev
```

2. Visit `http://localhost:3000`
3. Login with your credentials
4. You should be redirected to the dashboard

## How Authentication Works

### Frontend Flow

```
User visits /login
    ↓
AuthProvider checks Firebase auth state
    ↓
If not logged in → Show login form
    ↓
User submits credentials
    ↓
Firebase authenticates → Sets user state
    ↓
useEffect redirects to /dashboard
```

### API Authentication

```
Frontend makes API request
    ↓
getIdToken() gets Firebase token
    ↓
Token sent in Authorization header
    ↓
Backend verifyIdToken middleware validates
    ↓
If valid → Process request
If invalid → Return 401
```

## Code Structure

### Frontend Authentication (`libs/firebase/`)

```typescript
// libs/firebase/src/auth-context.tsx
export function AuthProvider({ children }) {
    // Manages user state
    // Provides signIn, signOut, getIdToken
}

export function useAuth() {
    // Hook to access auth context
}
```

### Backend Authentication (`apps/functions/`)

```javascript
// apps/functions/index.js
const verifyIdToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
};

app.get('/api/assets', verifyIdToken, async (req, res) => {
    // Protected endpoint
});
```

## Managing Users

### Add Users

Firebase Console > Authentication > Users > Add user

### Reset Password

Users can use the password reset flow (if implemented) or admins can reset via Console.

### View Login Activity

Firebase Console > Authentication > Users shows last sign-in time.

### Delete Users

Firebase Console > Authentication > Users > Select user > Delete

## Security Considerations

- Firebase config values (API keys) are safe to expose in client code
- Actual security is enforced by Firebase Security Rules and backend token verification
- All API endpoints should use `verifyIdToken` middleware
- Consider enabling 2FA for admin accounts

## Troubleshooting

### "Invalid API key"

- Check `apps/dashboard/.env.local` has correct values
- Restart dev server after changing env vars

### "User not found"

- Create user in Firebase Console > Authentication > Users
- Check Email/Password provider is enabled

### "Token verification failed"

- Ensure Firebase Admin SDK is properly initialized in functions
- Check `GOOGLE_CLOUD_PROJECT` environment variable is set

### Login works locally but not in production

- Rebuild and redeploy after changing environment variables
- Verify production env vars in `apps/dashboard/.env.production`

## Firebase Console Links

- [Authentication Settings](https://console.firebase.google.com/project/chillipharm-dashboard/authentication/providers)
- [Users](https://console.firebase.google.com/project/chillipharm-dashboard/authentication/users)
- [Project Settings](https://console.firebase.google.com/project/chillipharm-dashboard/settings/general)
