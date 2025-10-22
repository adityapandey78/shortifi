# Shortifi Client

Modern React frontend for Shortifi URL Shortener.

## Features

- 🎨 Modern, clean UI with dark/light mode
- ⚡ Built with React + Vite for lightning-fast development
- 🎭 Shadcn UI components for consistency
- 🌊 Framer Motion animations
- 📱 Fully responsive design
- 🔐 Google OAuth integration
- 🎯 Form validation with React Hook Form
- 🚀 Axios for API calls
- 💾 Zustand for state management

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Shadcn UI components
│   ├── Header.jsx      # Navigation header
│   └── ThemeToggle.jsx # Dark/light mode toggle
├── pages/              # Page components
│   ├── Home.jsx        # Landing + URL shortener
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # User's links dashboard
│   └── Profile.jsx     # User profile
├── services/           # API service layer
│   ├── auth.service.js     # Authentication APIs
│   └── shortener.service.js # URL shortener APIs
├── store/              # Global state management
│   └── useStore.js     # Zustand store
├── lib/                # Utilities
│   ├── api.js          # Axios instance
│   └── utils.js        # Helper functions
├── hooks/              # Custom React hooks
│   └── use-toast.js    # Toast notifications hook
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features Implementation

### Authentication
- Email/password login and registration
- Google OAuth integration
- Session management with cookies
- Protected routes

### URL Shortener
- Create short links with optional custom codes
- Copy short links to clipboard
- View all user's links
- Edit and delete links
- Real-time validation

### UI/UX
- Dark/light theme toggle
- Smooth animations and transitions
- Responsive design (mobile-first)
- Toast notifications
- Loading states
- Form validation with error messages

## API Integration

The frontend connects to the backend through Vite's proxy configuration:
- API calls go to `/api/*`
- Proxied to `http://localhost:3000`
- Cookies are automatically sent with requests

## Environment Variables

No environment variables needed - all configuration is in `vite.config.js`

## Contributing

1. Follow the existing code style
2. Add comments for complex logic
3. Test on both dark and light themes
4. Ensure responsive design works on all screen sizes

## License

ISC
