# iGFAP Emergency Department Kiosk

Real-time stroke case monitoring display for hospital emergency rooms.

## Overview

This kiosk application provides emergency department staff with a live dashboard of incoming stroke cases from ambulances. It displays:

- Real-time case updates from field assessments
- Risk predictions (ICH, LVO)
- GPS tracking and ETA information
- Urgency classification and routing recommendations

## Features

- **Live Case Monitoring**: Automatic polling for new cases every 5 seconds
- **Visual Priority System**: Color-coded urgency levels (Immediate, Time-Critical, Urgent)
- **GPS Integration**: Real-time location tracking and ETA calculations
- **Detailed Case Views**: Click any case for full assessment details
- **Hospital Filtering**: Configurable to show cases for specific hospital

## Configuration

Edit `src/config.js` to configure for your hospital:

```javascript
hospitalId: 'BY-NS-001',  // Your hospital identifier
hospitalName: 'Your Hospital Name',
googleMapsApiKey: 'your-api-key'  // For GPS tracking
```

## Installation

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
# Deploy the dist/ folder
```

## Deployment

This app is configured to deploy to GitHub Pages at `igfap.eu/kiosk/`.

The production build is automatically served via GitHub Pages when pushed to the main branch.

## Backend API

Connects to Case Sharing API at:
```
https://case-sharing-564499947017.europe-west3.run.app
```

## Technology Stack

- Vite (build tool)
- Vanilla JavaScript
- CSS3 with responsive design
- Real-time polling architecture

## License

Proprietary - iGFAP Project
