#!/bin/bash

echo "🔐 ChilliPharm Dashboard - Authentication Setup"
echo "=============================================="
echo ""

echo "Opening Firebase Console pages for you..."
echo ""

echo "1️⃣  Opening Project Settings (get your Firebase config)..."
open "https://console.firebase.google.com/project/chillipharm-dashboard/settings/general"
sleep 2

echo "2️⃣  Opening Authentication Providers (enable Email/Password)..."
open "https://console.firebase.google.com/project/chillipharm-dashboard/authentication/providers"
sleep 2

echo "3️⃣  Opening Users Panel (create your first user)..."
open "https://console.firebase.google.com/project/chillipharm-dashboard/authentication/users"

echo ""
echo "✅ Firebase Console pages opened!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. In Project Settings:"
echo "   - Scroll to 'Your apps' section"
echo "   - Copy apiKey, messagingSenderId, and appId"
echo "   - Update src/lib/firebase.ts with these values"
echo ""
echo "2. In Authentication Providers:"
echo "   - Click 'Email/Password'"
echo "   - Toggle 'Enable' to ON"
echo "   - Click 'Save'"
echo ""
echo "3. In Users Panel:"
echo "   - Click 'Add user'"
echo "   - Enter email and password"
echo "   - Click 'Add user'"
echo ""
echo "4. Test locally:"
echo "   - Visit http://localhost:3001"
echo "   - Login with your credentials"
echo ""
echo "5. Deploy:"
echo "   - Run: npm run build && firebase deploy"
echo ""
echo "For detailed instructions, see: QUICK_START.md"
