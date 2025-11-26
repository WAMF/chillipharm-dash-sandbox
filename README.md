# ChilliPharm Clinical Trial Dashboard

A comprehensive reporting dashboard for ChilliPharm's clinical trial video platform test instance.

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

- **Frontend Framework**: Svelte with TypeScript
- **Build Tool**: Vite
- **Authentication**: Firebase Authentication (Email/Password)
- **Hosting**: Firebase Hosting
- **Data Visualization**: Chart.js
- **Data Processing**: xlsx, date-fns
- **Styling**: Custom CSS with healthcare-focused design

## 🔐 Security & Authentication

This dashboard is protected by Firebase Authentication:
- Email/password login required
- Secure session management
- Logout functionality
- Protected from web crawlers (robots.txt)

**Quick Setup:** Run `./setup-auth.sh` or see `QUICK_START.md`

## Getting Started

### Prerequisites
- Node.js (v20.11.0 or compatible)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000` (or next available port)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Data Source

The dashboard loads data from `public/data.xlsx` which contains:
- 898 video assets
- 41 clinical sites
- 44 enrolled subjects
- Multiple study events and procedures
- Upload, review, and processing metrics

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

## Key Metrics

- **Total Assets**: 898 video recordings
- **Processing Rate**: Percentage of assets that have been de-identified
- **Review Rate**: Percentage of assets that have been reviewed
- **Compliance Score**: Overall regulatory compliance rating
- **Active Sites**: Number of participating clinical locations

## Design Philosophy

The dashboard uses a clean, medical/clinical design with:
- Blue and white color scheme for professional healthcare appearance
- Clear data visualizations that tell a story
- Emphasis on compliance and data security
- Mobile-responsive design
- Executive-presentation quality

## Future Enhancements

Potential additions:
- Real-time data refresh
- Advanced filtering by date range, site, or subject
- Export to PDF/CSV functionality
- User authentication
- Custom report generation
- Audit trail visualization

## Contact & Support

For questions or issues, contact ChilliPharm support.
