# ChilliPharm Clinical Trial Dashboard

A comprehensive reporting dashboard for ChilliPharm's clinical trial video platform.

## Overview

This dashboard provides real-time insights into:
- **Executive Overview**: Key performance indicators and activity trends
- **Site Performance**: Analytics on clinical site activity and review metrics
- **Compliance Monitoring**: Regulatory compliance and data quality tracking
- **Integration Health**: System usage, evaluator activity, and geographic distribution

## About ChilliPharm

ChilliPharm is the "Stripe of Clinical Video" - providing essential video infrastructure for clinical trials:
- Secure video capture & storage at clinical sites
- Automated video de-identification services
- Seamless EDC system integration
- Full regulatory compliance (FDA, HIPAA, GDPR)
- Training and standardization tools

## Technology Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Monorepo**: Nx workspace
- **Authentication**: Firebase Authentication (Email/Password)
- **Backend API**: Firebase Functions with Express.js
- **Database**: Google Cloud Firestore
- **Hosting**: Firebase Hosting
- **Data Visualization**: Chart.js, Recharts
- **Styling**: Tailwind CSS v4

## Project Structure

```
chillipharm-dashboard/
├── apps/
│   ├── dashboard/          # Next.js frontend application
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # React components
│   │   └── public/        # Static assets
│   └── functions/         # Firebase Functions API
│       ├── index.js       # API endpoints
│       └── src/           # Helper modules
├── libs/
│   ├── api/               # API client library
│   ├── firebase/          # Firebase authentication
│   └── ui/                # Shared UI components
├── eslint.config.mjs      # ESLint flat config
├── firebase.json          # Firebase configuration
└── nx.json                # Nx workspace config
```

## Security & Authentication

This dashboard is protected by Firebase Authentication:
- Email/password login required
- Secure session management with Firebase ID tokens
- Protected API endpoints with token verification
- Protected from web crawlers (robots.txt)

## Getting Started

### Prerequisites
- Node.js v20.11.0 or later
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` in `apps/dashboard/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5002/your_project/europe-west2
```

### Development

Start the Next.js development server:

```bash
npx nx run dashboard:dev
```

Start Firebase Functions emulator (in a separate terminal):

```bash
firebase emulators:start --only functions
```

The dashboard will be available at `http://localhost:3000`

### Build for Production

```bash
npx nx run dashboard:build
```

### Linting

```bash
npx eslint apps/dashboard libs/
npx stylelint "**/*.css"
npx prettier --check .
```

## API Endpoints

The backend provides these authenticated endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/assets` | Fetch video assets from Firestore |
| `GET /api/events` | Fetch events data |
| `GET /api/procedures` | Fetch procedures data |
| `GET /api/geocodeCountry` | Geocode country codes to names |

All endpoints require a valid Firebase ID token in the Authorization header.

## Dashboard Features

### Executive Overview
- Total video assets across all sites
- Active sites and enrolled subjects
- Processing and review completion rates
- Compliance scores
- Time-series activity trends

### Site Performance
- Top sites by asset volume
- Review rates per site
- Upload trends
- Interactive charts and tables

### Compliance Monitoring
- PII detection status
- Asset review completion
- Processing status tracking
- Compliance rate by category

### Integration Health
- Recent upload activity
- Top evaluators by asset count
- Geographic distribution
- EDC integration status

## Deployment

### Firebase Hosting & Functions

```bash
# Build the dashboard
npx nx run dashboard:build

# Deploy everything
firebase deploy

# Or deploy separately
firebase deploy --only hosting
firebase deploy --only functions
```

## Design Philosophy

The dashboard uses a clean, medical/clinical design with:
- Red and white color scheme matching ChilliPharm branding
- Clear data visualizations
- Emphasis on compliance and data security
- Mobile-responsive design
- Executive-presentation quality

## Contact & Support

For questions or issues, contact ChilliPharm support.
