#!/bin/bash

# CareerFix.AI Setup Helper Script
# This script helps you set up the environment variables for the application

echo "🚀 CareerFix.AI Setup Helper"
echo "=============================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📋 This script will help you create your .env file with Firebase and Gemini API credentials."
echo ""
echo "You'll need:"
echo "  1. Firebase project credentials (from Firebase Console)"
echo "  2. Gemini API key (from Google AI Studio)"
echo ""
read -p "Press Enter to continue..."
echo ""

# Collect Firebase credentials
echo "🔥 Firebase Configuration"
echo "-------------------------"
read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Auth Domain (e.g., project-id.firebaseapp.com): " FIREBASE_AUTH_DOMAIN
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Firebase Storage Bucket (e.g., project-id.appspot.com): " FIREBASE_STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID
echo ""

# Collect Gemini API key
echo "🤖 Gemini AI Configuration"
echo "---------------------------"
read -p "Gemini API Key: " GEMINI_API_KEY
echo ""

# Create .env file
cat > .env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Gemini AI Configuration
VITE_GEMINI_API_KEY=${GEMINI_API_KEY}
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Visit http://localhost:5173 in your browser"
echo "  3. Test the application with guest and authenticated flows"
echo ""
echo "🎉 Happy building!"
