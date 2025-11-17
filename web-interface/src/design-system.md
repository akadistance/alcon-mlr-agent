# EyeQ Design System
## Following OpenAI Apps SDK Guidelines

### 🎨 CSS Variables

```css
/* Light Mode Colors */
--background: #ffffff
--text-primary: #1e293b
--text-secondary: #475569
--border: #e0e0e0
--surface: #ffffff
--surface-hover: #f5f5f5

/* Dark Mode Colors */
--background: #212121
--text-primary: #ececec
--text-secondary: #b4b4b4
--border: #404040
--surface: #2a2a2a
--surface-hover: #333333

/* Brand Colors - Use sparingly, only on primary buttons */
--alcon-primary: #003595
```

### 📝 Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
```

**Rationale**: System fonts ensure native feel across platforms (OpenAI Apps SDK guideline)

### 🎭 Typography Scale

Following OpenAI's minimal approach:

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| **Heading 1** | 2xl-4xl | 600 | Page titles |
| **Heading 2** | xl | 600 | Section headers |
| **Body** | base | 400 | Main content |
| **Body Small** | sm | 400 | Metadata, captions |

### 🎨 Iconography

**Library**: lucide-react (outlined, monochromatic)

**Sizes**: 
- Small: 16px
- Medium: 20px  
- Large: 24px

**Color**: Inherit from parent text color (no custom icon colors)

### 📱 Responsive Breakpoints

Following mobile-first design:

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

**Max widths for readability**:
- Message bubbles: `max-w-3xl` (768px)
- Main content: `max-w-4xl` (896px)
- Full width: On mobile only

### ♿ Accessibility Guidelines

#### 1. **Color Contrast**
- Text on background: minimum 4.5:1 (WCAG AA)
- Interactive elements: 3:1
- Dark mode: verified contrast ratios

#### 2. **Focus States**
All interactive elements have visible focus rings:

```css
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
```

#### 3. **Keyboard Navigation**
- Tab order follows visual flow
- All buttons accessible via keyboard
- Escape closes modals
- Enter submits forms

#### 4. **ARIA Labels**
All icon-only buttons have `aria-label`:

```tsx
<button aria-label="Send message">
  <Send size={20} />
</button>
```

#### 5. **Screen Reader Support**
- Semantic HTML (`<header>`, `<nav>`, `<main>`)
- Alt text on images
- Live regions for dynamic content:

```tsx
<div role="status" aria-live="polite">
  Loading...
</div>
```

### 🎯 Component States

#### Interactive States
1. **Default** - Resting state
2. **Hover** - Mouse over (desktop only)
3. **Focus** - Keyboard focus (visible ring)
4. **Active** - Being clicked/pressed
5. **Disabled** - Not interactive (opacity: 0.5)
6. **Loading** - Processing (spinner/skeleton)

#### Visual Feedback
- Transitions: `transition-colors duration-200`
- Hover effects: Subtle background change
- Click feedback: Scale down slightly

### 🌗 Dark Mode Strategy

**Method**: Class-based (`class="dark"`)

**Implementation**:
```tsx
// ThemeContext handles this
document.documentElement.classList.toggle('dark')
```

**Colors**: Use Tailwind's dark: variants
```css
bg-white dark:bg-zinc-900
text-gray-900 dark:text-gray-100
```

### 📐 Spacing System

Using Tailwind's 4px-based scale:

| Token | Pixels | Usage |
|-------|--------|-------|
| `1` | 4px | Tight spacing |
| `2` | 8px | Small gaps |
| `3` | 12px | Default padding |
| `4` | 16px | Standard spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Large spacing |

### 🎪 Animation Guidelines

**Keep animations subtle** (OpenAI guideline):

```css
/* Approved animations */
animate-fade-in: 0.3s ease-in-out
animate-slide-up: 0.3s ease-out
transition-colors: 0.2s

/* Avoid */
❌ Bounce effects
❌ Rotate/flip animations
❌ Parallax scrolling
❌ Custom easing beyond ease/linear
```

### 🧩 Component Architecture

#### Message Bubbles
- **User**: Subtle gray background (`bg-gray-100 dark:bg-zinc-700`)
- **Assistant**: NO background, text on page
- **Max width**: `max-w-3xl`
- **Padding**: `p-4`
- **Border radius**: `rounded-xl` (12px)

#### Input Area
- **Auto-resize**: Yes, up to 200px max-height
- **Focus ring**: Blue, 2px
- **Send button**: Only enabled when text present
- **File upload**: Clear visual feedback

#### Sidebar
- **Width**: `w-64` (256px) on desktop
- **Mobile**: Full-screen overlay
- **Animation**: Slide from left
- **Scrollable**: Conversation list only

### 📦 Component Variants

#### Buttons

**Primary** (Brand actions):
```tsx
className="bg-blue-600 text-white hover:bg-blue-700 
           focus:ring-2 focus:ring-blue-500"
```

**Secondary** (Default actions):
```tsx
className="bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white
           hover:bg-gray-300 dark:hover:bg-zinc-600"
```

**Ghost** (Subtle actions):
```tsx
className="hover:bg-gray-100 dark:hover:bg-zinc-800 
           text-gray-700 dark:text-gray-300"
```

**Danger** (Destructive):
```tsx
className="bg-red-600 text-white hover:bg-red-700
           focus:ring-2 focus:ring-red-500"
```

### 🔍 Testing Checklist

#### Accessibility
- [ ] Tab through all interactive elements
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify color contrast (Chrome DevTools)
- [ ] Test keyboard-only navigation
- [ ] Check focus indicators visible

#### Responsive
- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] Verify touch targets ≥44px
- [ ] Check horizontal scroll (shouldn't exist)

#### Dark Mode
- [ ] Toggle works smoothly
- [ ] All colors visible in both modes
- [ ] Images/icons adapt properly
- [ ] Shadows visible in dark mode
- [ ] Text readable on all backgrounds

#### Performance
- [ ] No layout shift on load
- [ ] Smooth 60fps scrolling
- [ ] Animations don't cause jank
- [ ] Images lazy load
- [ ] Bundle size optimized

### 📚 Documentation Standards

All components should document:

1. **Props** - TypeScript interfaces
2. **States** - All possible UI states
3. **Accessibility** - ARIA usage, keyboard support
4. **Examples** - Common use cases
5. **Mobile notes** - Touch-specific behavior

---

**Last Updated**: ${new Date().toLocaleDateString()}  
**Compliance**: OpenAI Apps SDK Components Guidelines

