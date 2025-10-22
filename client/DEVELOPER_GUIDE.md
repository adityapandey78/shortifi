# Shortifi - Developer Guide

## 📁 Project Structure

```
client/
├── jsconfig.json          ← Path aliases configuration
├── components.json        ← Shadcn/UI configuration
├── vite.config.js        ← Vite dev server & proxy setup
├── tailwind.config.js    ← Tailwind CSS configuration
└── src/
    ├── components/
    │   ├── ui/           ← Shadcn/UI components
    │   │   ├── button.jsx
    │   │   ├── card.jsx
    │   │   ├── dialog.jsx
    │   │   ├── aurora-text.jsx  ← Custom Magic UI component
    │   │   └── ...
    │   ├── Header.jsx
    │   ├── ThemeToggle.jsx
    │   └── EditLinkDialog.jsx
    ├── pages/
    │   ├── Home.jsx      ← Main landing page (single page layout)
    │   ├── Dashboard.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── Profile.jsx
    ├── services/         ← API calls
    │   ├── auth.service.js
    │   └── shortener.service.js
    ├── lib/
    │   ├── utils.js      ← Helper functions
    │   └── api.js        ← Axios instance
    ├── hooks/            ← Custom React hooks
    │   └── use-toast.js
    └── store/            ← Zustand state management
        └── useStore.js
```

## 🎨 Using Components

### Path Aliases (thanks to jsconfig.json)
You can now import components using clean paths:

```javascript
// ✅ Clean imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// ❌ No more relative paths like this:
import { Button } from '../../../components/ui/button'
```

### Adding Shadcn/UI Components

```bash
# Install a new component
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add alert-dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

### Using the AuroraText Component

```javascript
import { AuroraText } from '@/components/ui/aurora-text'

function MyComponent() {
  return (
    <h1>
      Make your text <AuroraText>beautiful</AuroraText>
    </h1>
  )
}
```

## 📄 Home Page Layout

The home page now uses a **single-page layout** with:
- ✅ Hero section and form **visible together** (no scrolling needed)
- ✅ Centered layout with `max-w-4xl`
- ✅ Vertically centered with `flex items-center`
- ✅ Compact spacing for better UX
- ✅ Recent links shown below form (first 3)
- ✅ CTA section for non-authenticated users

### Key Features:
1. **Aurora Text Animation** on "Loooooooong"
2. **Optional shortcode** - leave empty for random generation
3. **Inline link editing** with dialog
4. **Compact link cards** with hover actions
5. **Responsive design** - works on all screen sizes

## 🎯 Available Components

### UI Components (Shadcn)
- Button, Card, Input, Label
- Dialog (for modals)
- Toast notifications
- All using Tailwind CSS classes

### Custom Components
- **AuroraText** - Animated gradient text
- **EditLinkDialog** - Modal for editing links
- **Header** - Navigation bar
- **ThemeToggle** - Dark/Light mode switcher

## 🔧 Configuration Files

### jsconfig.json
Enables `@/` path aliases for clean imports

### components.json
Configures Shadcn/UI:
- Style: default
- No TypeScript (tsx: false)
- CSS variables enabled
- Path aliases configured

### vite.config.js
- Dev server on port 5173
- Proxies `/api/*` to backend (port 3000)
- React plugin enabled

## 💡 Tips

1. **Use path aliases** - `@/components/` instead of `../../../`
2. **Shadcn components are editable** - modify files in `src/components/ui/`
3. **Check components.json** before adding new components
4. **jsconfig.json enables IntelliSense** in VS Code

## 🚀 Quick Commands

```bash
# Start dev server
npm run dev

# Add new shadcn component
npx shadcn@latest add <name>

# Build for production
npm run build
```

## 📦 Key Dependencies

- React 18.3.1
- Vite 5.4.10
- Tailwind CSS 3.4.14
- Shadcn/UI components
- Framer Motion (animations)
- React Hook Form (forms)
- Zustand (state management)
- Axios (API calls)

---

**Note**: All imports use `@/` alias now. VS Code will provide autocomplete thanks to `jsconfig.json`!
