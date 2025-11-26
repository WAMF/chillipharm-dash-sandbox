# Quick Start: Setting Up Authentication

## 🔐 What's New

Your dashboard now has:
- ✅ Email/password authentication
- ✅ Login screen
- ✅ Logout button
- ✅ Protected routes
- ✅ Robots.txt to prevent crawling

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Firebase Config

Run this command to open your Firebase project settings:
```bash
open "https://console.firebase.google.com/project/chillipharm-dashboard/settings/general"
```

Scroll down to **Your apps** → **SDK setup and configuration** → **Config**

Copy the values you need:
- apiKey
- messagingSenderId
- appId

### Step 2: Update Firebase Config

Edit `src/lib/firebase.ts` and update these three values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",           // ← Update this
  authDomain: "chillipharm-dashboard.firebaseapp.com",
  projectId: "chillipharm-dashboard",
  storageBucket: "chillipharm-dashboard.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",   // ← Update this
  appId: "YOUR_APP_ID"                   // ← Update this
};
```

### Step 3: Enable Authentication

Run this command to open Authentication settings:
```bash
open "https://console.firebase.google.com/project/chillipharm-dashboard/authentication/providers"
```

1. Click on **Email/Password**
2. Toggle **Enable** to ON
3. Click **Save**

### Step 4: Create Your First User

Run this command to open Users panel:
```bash
open "https://console.firebase.google.com/project/chillipharm-dashboard/authentication/users"
```

1. Click **Add user**
2. Enter email: `admin@chillipharm.com` (or your email)
3. Enter a strong password
4. Click **Add user**

### Step 5: Test Locally

The dev server should still be running. Visit:
```
http://localhost:3001
```

You should see a login screen. Try logging in with your credentials!

### Step 6: Deploy

Once login works locally:

```bash
npm run build
firebase deploy
```

Your authenticated dashboard will be live at:
**https://chillipharm-dashboard.web.app**

## 📝 Login Credentials

Make sure to save your login credentials:
- **Email:** _________________
- **Password:** _________________

## 🔒 Security Features

- Firebase Authentication handles all security
- No passwords stored in your code
- Session management automatic
- Logout button in header
- Protected routes (can't access without login)

## 🐛 Troubleshooting

**Can't see login screen?**
- Check that you updated `src/lib/firebase.ts` with your actual config values

**"Firebase: Error (auth/invalid-api-key)"**
- Your API key in `src/lib/firebase.ts` is incorrect
- Copy it again from Firebase Console

**"User not found"**
- Create a user in Firebase Console > Authentication > Users

**Login works locally but not online?**
- Make sure you ran `npm run build && firebase deploy` after updating the config

## 📚 Full Documentation

For detailed setup instructions, see: `AUTHENTICATION_SETUP.md`

## ✅ Current Status

- [x] Firebase SDK installed
- [x] Auth store created
- [x] Login component created
- [x] Protected routes implemented
- [x] Logout functionality added
- [x] Robots.txt added
- [ ] Firebase config updated (YOU NEED TO DO THIS)
- [ ] Authentication enabled in Firebase Console
- [ ] First user created
- [ ] Deployed to production
