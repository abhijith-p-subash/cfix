# CareerFix.AI 🚀

An AI-powered career roadmap builder that helps professionals plan their career journey with personalized guidance.

## Features ✨

- **AI-Powered Roadmaps**: Generate personalized career roadmaps using Google's Gemini AI
- **Free Trial**: Unauthenticated users get 1 free roadmap generation
- **User Authentication**: Firebase authentication with email/password and Google sign-in
- **PDF Downloads**: Registered users can download roadmaps as professional PDFs
- **Usage Tracking**: Smart usage limits (1 for guests, 2 for authenticated users)
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack 💻

- **Frontend**: React 18 with Vite
- **Backend**: Firebase (Authentication & Firestore)
- **AI**: Google Gemini API
- **PDF Generation**: jsPDF
- **Styling**: Vanilla CSS with custom design system

## Getting Started 🏁

### Prerequisites

- Node.js 16+ and npm
- Firebase project
- Google Gemini API key

### Installation

1. **Clone and install dependencies**

```bash
cd /Users/abhijithpsubash/AJ_BLACK/SIDE-PROJECTS/CAREERFIX.AI/code
npm install
```

2. **Set up Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase configuration

3. **Get Gemini API Key**

   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

4. **Configure environment variables**

   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration and Gemini API key:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

   Navigate to `http://localhost:5173`

## Usage 📖

### For Guest Users

1. Visit the homepage
2. Fill in the roadmap form with your career details
3. Generate 1 free roadmap (PDF download restricted)

### For Registered Users

1. Sign up with email/password or Google
2. Generate up to 2 free roadmaps
3. Download roadmaps as professional PDFs

## Project Structure 📁

```
src/
├── components/          # React components
│   ├── Header.jsx      # Navigation header
│   ├── AuthModal.jsx   # Authentication modal
│   ├── UsageIndicator.jsx
│   ├── RoadmapGenerator.jsx
│   └── RoadmapDisplay.jsx
├── services/           # Business logic
│   ├── authService.js  # Firebase authentication
│   ├── usageService.js # Usage tracking
│   ├── aiService.js    # Gemini AI integration
│   └── pdfService.js   # PDF generation
├── context/            # React context
│   └── AuthContext.jsx # Authentication state
├── pages/              # Page components
│   └── Home.jsx        # Main landing page
├── config/             # Configuration
│   └── firebase.js     # Firebase initialization
├── App.jsx            # Root component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Firestore Database Schema

### users collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  roadmapCount: number,
  maxFreeRoadmaps: number
}
```

### roadmaps collection
```javascript
{
  userId: string,
  content: string,
  userInputs: object,
  createdAt: timestamp
}
```

## Building for Production 🏗️

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Future Enhancements 🔮

- Dashboard for viewing roadmap history
- Paid subscription tiers
- Resume builder integration
- LinkedIn optimization tools
- Career coaching recommendations

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React, Firebase, and Google Gemini AI
