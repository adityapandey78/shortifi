# Shortifi Client

Modern React frontend for the Shortifi URL Shortener.

## Tech Stack

- React 18 + Vite
- Zustand (state management)
- TailwindCSS + shadcn/ui
- React Hook Form + Zod
- Framer Motion
- Axios

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`

## Environment Variables

```env
VITE_API_URL=              # Backend URL (empty = proxy)
VITE_PORT=5173            # Dev server port
```

## Project Structure

```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.jsx      # Navigation
│   └── ThemeToggle.jsx # Dark/light mode
├── pages/              # Pages
│   ├── Home.jsx        # Homepage
│   ├── Login.jsx       # Login
│   ├── Register.jsx    # Register
│   ├── Dashboard.jsx   # Dashboard
│   └── Profile.jsx     # Profile
├── services/           # API calls
│   ├── auth.service.js
│   └── shortener.service.js
├── store/              # State
│   └── useStore.js     # Zustand store
├── lib/                # Utils
│   ├── api.js          # Axios config
│   └── utils.js
└── hooks/
    └── use-toast.js
```

## Features

- Email/password authentication
- Google OAuth
- Create short links (with custom codes)
- Manage links (edit, delete, copy)
- Dark/light theme
- Responsive design

## Development

**Run dev server:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

**Preview:**
```bash
npm run preview
```

## API Integration

Vite proxy forwards `/api/*` to `http://localhost:3000`

Axios configured with:
- `baseURL: ''` (uses proxy)
- `withCredentials: true` (sends cookies)

## Deploy

```bash
vercel --prod
```

Set `VITE_API_URL` to your backend URL in Vercel.

## License

MIT
