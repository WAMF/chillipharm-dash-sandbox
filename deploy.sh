#!/bin/bash

echo "🌶️ ChilliPharm Dashboard - Firebase Deployment"
echo "=============================================="
echo ""

echo "Step 1: Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

echo "Step 2: Firebase Authentication Required"
echo "Please run the following commands manually:"
echo ""
echo "  firebase login"
echo "  firebase use --add"
echo "  firebase deploy"
echo ""
echo "Or simply run: firebase deploy"
echo ""
echo "After deployment, your dashboard will be live!"
