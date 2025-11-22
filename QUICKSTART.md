# CareerFix.AI - Quick Start Guide 🚀

## Prerequisites Setup

### 1. Firebase Project Setup (5 minutes)

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Name it "CareerFix-AI" and complete setup
4. **Enable Authentication**:
   - Go to Build → Authentication → Get Started
   - Enable "Email/Password" provider
   - Enable "Google" provider
5. **Create Firestore Database**:
   - Go to Build → Firestore Database → Create Database
   - Start in production mode
   - Choose your region (closest to you)
6. **Get Configuration**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click web icon (</>) to add a web app
   - Register app with nickname "CareerFix-Web"
   - Copy the firebaseConfig object

### 2. Gemini API Key (2 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

## Running the Application

### Option 1: Interactive Setup (Recommended)

```bash
# Run the setup script
./setup.sh

# Start development server
npm run dev
```

### Option 2: Manual Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# (Use your favorite text editor)

# Start development server
npm run dev
```

## Testing the Application

### Test as Guest User
1. Open http://localhost:5173
2. Fill in the roadmap form:
   - Current Role: "Junior Developer"
   - Career Goal: "Senior Full-Stack Engineer"
   - Skills: "JavaScript, React, Node.js"
   - Timeline: "2 years"
3. Click "Generate My Roadmap"
4. Verify roadmap displays
5. Try downloading PDF (should show lock icon)
6. Try generating another roadmap (should show limit message)

### Test as Authenticated User
1. Click "Sign Up" in header
2. Create account with email/password or Google
3. Generate a roadmap
4. Click "Download PDF" (should work)
5. Generate second roadmap
6. Try generating third (should show limit)

## Common Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Project Structure at a Glance

```
src/
├── components/      # UI components
├── services/        # Business logic (auth, AI, PDF, usage)
├── context/         # React context (auth state)
├── pages/          # Page components
├── config/         # Firebase config
└── index.css       # Design system
```

## Key Features Implemented ✅

- ✅ Firebase Authentication (Email/Password + Google)
- ✅ AI Roadmap Generation (Gemini Pro)
- ✅ Usage Limits (1 for guests, 2 for authenticated)
- ✅ PDF Export (authenticated only)
- ✅ Responsive Design
- ✅ Professional UI/UX

## Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase Connection Issues
- Check `.env` file has correct credentials
- Verify Firebase project has Authentication and Firestore enabled
- Check browser console for specific errors

### AI Generation Fails
- Verify Gemini API key is correct in `.env`
- Check API key has no usage restrictions
- Review browser console for API errors

## Next Steps

1. **Customize**: Update colors, fonts, or copy to match your brand
2. **Deploy**: Deploy to Vercel, Netlify, or Firebase Hosting
3. **Enhance**: Add features like roadmap history, paid tiers, etc.

## Support

- Check [README.md](file:///Users/abhijithpsubash/AJ_BLACK/SIDE-PROJECTS/CAREERFIX.AI/code/README.md) for detailed documentation
- Review [walkthrough.md](file:///Users/abhijithpsubash/.gemini/antigravity/brain/6bb6dd2a-6618-4fa1-b1ce-e06d06cc0466/walkthrough.md) for implementation details

---

**Ready to build careers? Start with `npm run dev`! 🎉**
