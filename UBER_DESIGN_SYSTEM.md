# Uber-Inspired Design System Documentation

## Overview

This healthcare dashboard now uses Uber's Base Design System principles while maintaining all existing functionality. The design system provides a clean, modern, and professional aesthetic inspired by Uber's brand.

---

## Color Palette

Based on Uber's official brand guidelines:

### Primary Colors
- **Black** (`--uber-black: #000000`) - Primary brand color
- **White** (`--uber-white: #FFFFFF`) - Background and text
- **Blue** (`--uber-blue: #276EF1`) - Interactive elements, links, CTAs
- **Green** (`--uber-green: #166C3B`) - Success states, positive indicators
- **Red** (`--uber-red: #BB032A`) - Errors, warnings, critical actions
- **Yellow** (`--uber-yellow: #FDB924`) - Warnings, alerts

### Gray Scale
- `--uber-gray-50` to `--uber-gray-900` (9 shades)
- Use for borders, backgrounds, disabled states, and text hierarchy

### Usage Examples
```html
<!-- Tailwind utility classes -->
<div class="bg-uber-black text-uber-white"></div>
<button class="bg-uber-blue text-uber-white"></button>
<span class="text-uber-green">Success</span>

<!-- CSS custom properties -->
<div style="background: var(--uber-black); color: var(--uber-white);"></div>
```

---

## Typography

### Font Family
- **Primary**: "Uber Move Text" (fallback to system fonts)
- **Monospace**: System monospace fonts for code

### Font Sizes
| Class | Size | Use Case |
|-------|------|----------|
| `--text-xs` | 12px | Small labels, captions |
| `--text-sm` | 14px | Secondary text, table cells |
| `--text-base` | 16px | Body text (default) |
| `--text-lg` | 18px | Emphasized text |
| `--text-xl` | 20px | Subheadings |
| `--text-2xl` | 24px | H4 headings |
| `--text-3xl` | 30px | H3 headings |
| `--text-4xl` | 40px | H2 headings |
| `--text-5xl` | 48px | H1 headings (desktop) |
| `--text-6xl` | 60px | Hero headings |

### Heading Classes
```html
<h1 class="uber-heading-1">Large Hero Heading</h1>
<h2 class="uber-heading-2">Section Heading</h2>
<h3 class="uber-heading-3">Subsection Heading</h3>
<h4 class="uber-heading-4">Card Heading</h4>
```

### Line Heights
- `--line-height-tight: 1.2` - Headings
- `--line-height-normal: 1.4` - Body text
- `--line-height-relaxed: 1.6` - Long-form content

---

## Buttons

### Button Variants

#### Primary Button (Black)
```html
<button class="uber-btn uber-btn-primary">
  Continue
</button>
```
- **Use for**: Primary actions, submit buttons, main CTAs
- **Background**: Black (#000000)
- **Text**: White
- **Hover**: Gray-800 with lift effect

#### Secondary Button (White with Border)
```html
<button class="uber-btn uber-btn-secondary">
  Cancel
</button>
```
- **Use for**: Secondary actions, cancel buttons
- **Background**: White
- **Border**: Gray-300
- **Hover**: Gray-50 background

#### Blue Accent Button
```html
<button class="uber-btn uber-btn-blue">
  Save
</button>
```
- **Use for**: Important secondary actions, links
- **Background**: Uber Blue (#276EF1)
- **Text**: White
- **Hover**: Darker blue with lift effect

#### Green Success Button
```html
<button class="uber-btn uber-btn-green">
  Confirm
</button>
```
- **Use for**: Success actions, confirmations
- **Background**: Uber Green (#166C3B)
- **Text**: White

#### Ghost Button
```html
<button class="uber-btn uber-btn-ghost">
  Learn More
</button>
```
- **Use for**: Tertiary actions, less emphasis
- **Background**: Transparent
- **Hover**: Gray-100 background

### Button Sizes

```html
<!-- Small -->
<button class="uber-btn uber-btn-primary uber-btn-sm">Small</button>

<!-- Default -->
<button class="uber-btn uber-btn-primary">Default</button>

<!-- Large -->
<button class="uber-btn uber-btn-primary uber-btn-lg">Large</button>
```

### Button with Icons

```html
<button class="uber-btn uber-btn-blue">
  <svg class="w-5 h-5">...</svg>
  Export CSV
</button>
```

### Disabled State

```html
<button class="uber-btn uber-btn-primary" disabled>
  Loading...
</button>
```

---

## Form Inputs

### Text Input
```html
<input
  type="text"
  class="uber-input"
  placeholder="Enter your name"
/>
```

**Features**:
- Border changes to black on focus
- 3px black shadow on focus
- Hover state with gray-400 border
- Smooth transitions (200ms)

### Select / Dropdown
```html
<select class="uber-input uber-select">
  <option>Choose an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Features**:
- Custom dropdown arrow (black)
- Same styling as text inputs
- Focus states match inputs

### Form Labels
```html
<label class="block text-sm font-medium text-uber-gray-700 mb-1">
  Client Name
</label>
<input type="text" class="uber-input" />
```

### Input Sizes
```html
<!-- Small -->
<input class="uber-input uber-btn-sm" />

<!-- Default -->
<input class="uber-input" />

<!-- Large -->
<input class="uber-input uber-btn-lg" />
```

---

## Cards

### Hover Card
```html
<div class="uber-card">
  <h3 class="uber-heading-4 mb-2">Card Title</h3>
  <p class="text-uber-gray-600">Card content goes here.</p>
</div>
```
- **Use for**: Interactive cards, clickable items
- **Hover effect**: Lifts with shadow

### Flat Card (No Hover)
```html
<div class="uber-card-flat">
  <h3 class="uber-heading-4 mb-2">Static Card</h3>
  <p class="text-uber-gray-600">Content without hover effect.</p>
</div>
```
- **Use for**: Static information, non-interactive cards

---

## Navigation

### Navigation Bar
```html
<nav class="uber-nav">
  <div class="uber-container flex items-center justify-between">
    <a href="/" class="uber-nav-link uber-nav-link-active">
      Dashboard
    </a>
    <a href="/analytics" class="uber-nav-link">
      Analytics
    </a>
    <a href="/settings" class="uber-nav-link">
      Settings
    </a>
  </div>
</nav>
```

**Features**:
- Black background (#000000)
- White text
- Hover effect: 10% white overlay
- Active state: 15% white overlay with bold text

---

## Badges

### Status Badges
```html
<!-- Green Success -->
<span class="uber-badge uber-badge-green">Active</span>

<!-- Blue Info -->
<span class="uber-badge uber-badge-blue">Pending</span>

<!-- Red Error -->
<span class="uber-badge uber-badge-red">Terminated</span>

<!-- Yellow Warning -->
<span class="uber-badge uber-badge-yellow">Warning</span>

<!-- Gray Neutral -->
<span class="uber-badge uber-badge-gray">COBRA</span>
```

**Use cases**:
- Status indicators
- Tags
- Counts
- Labels

---

## Tables

### Uber-Style Table
```html
<table class="uber-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td><span class="uber-badge uber-badge-green">Active</span></td>
      <td>$1,250.00</td>
    </tr>
  </tbody>
</table>
```

**Features**:
- Black header background
- White header text
- Hover effect on rows (gray-100 background)
- Rounded corners (12px)
- Subtle shadow
- Clean borders between rows

---

## Alerts

### Alert Variants
```html
<!-- Info -->
<div class="uber-alert uber-alert-info">
  <svg>...</svg>
  <div>
    <strong>Info:</strong> This is an informational message.
  </div>
</div>

<!-- Success -->
<div class="uber-alert uber-alert-success">
  <svg>...</svg>
  <div>
    <strong>Success:</strong> Operation completed successfully.
  </div>
</div>

<!-- Warning -->
<div class="uber-alert uber-alert-warning">
  <svg>...</svg>
  <div>
    <strong>Warning:</strong> Please review this carefully.
  </div>
</div>

<!-- Error -->
<div class="uber-alert uber-alert-error">
  <svg>...</svg>
  <div>
    <strong>Error:</strong> Something went wrong.
  </div>
</div>
```

**Features**:
- Color-coded left border (4px)
- Light background matching color
- Icon support
- Flexible content

---

## Spacing

Use Uber's spacing scale for consistent padding/margins:

| Variable | Value | Use Case |
|----------|-------|----------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Input padding |
| `--space-4` | 16px | Default spacing |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Card padding, section gaps |
| `--space-8` | 32px | Large spacing |
| `--space-10` | 40px | XL spacing |
| `--space-12` | 48px | Section spacing |
| `--space-16` | 64px | Hero spacing |
| `--space-20` | 80px | Page margins |

```html
<!-- Example using Tailwind-style utilities -->
<div class="p-6 mb-4 gap-2">
  <!-- p-6 = padding: var(--space-6) (24px) -->
  <!-- mb-4 = margin-bottom: var(--space-4) (16px) -->
  <!-- gap-2 = gap: var(--space-2) (8px) -->
</div>
```

---

## Border Radius

| Variable | Value | Use Case |
|----------|-------|----------|
| `--radius-sm` | 4px | Small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards |
| `--radius-2xl` | 24px | Hero sections |
| `--radius-full` | 9999px | Pills, badges |

```html
<div class="uber-rounded-lg">Large radius (12px)</div>
<button class="uber-rounded-md">Medium radius (8px)</button>
<span class="uber-rounded-full">Full radius (pill)</span>
```

---

## Shadows

| Class | Shadow | Use Case |
|-------|--------|----------|
| `uber-shadow-sm` | Subtle | Input fields, flat cards |
| `uber-shadow-md` | Medium | Dropdowns, hover effects |
| `uber-shadow-lg` | Large | Modals, popovers |
| `uber-shadow-xl` | Extra large | Hero cards |

```html
<div class="uber-card uber-shadow-lg">
  Card with large shadow
</div>
```

---

## Animations

### Fade In
```html
<div class="uber-fade-in">
  Content fades in with upward motion
</div>
```

### Slide In
```html
<div class="uber-slide-in">
  Content slides in from left
</div>
```

### Loading Spinner
```html
<div class="uber-spinner"></div>
```

**Features**:
- Black spinner
- 24px × 24px
- Smooth rotation (0.6s)

---

## Layout Utilities

### Container
```html
<div class="uber-container">
  <!-- Max-width: 1280px, centered, responsive padding -->
</div>
```

### Divider
```html
<hr class="uber-divider" />
```

---

## Migration Guide

### Replacing Existing Buttons

**Before:**
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>
```

**After:**
```html
<button class="uber-btn uber-btn-blue">
  Click Me
</button>
```

### Replacing Existing Inputs

**Before:**
```html
<input
  type="text"
  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
/>
```

**After:**
```html
<input type="text" class="uber-input" />
```

### Replacing Existing Cards

**Before:**
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  Content
</div>
```

**After:**
```html
<div class="uber-card-flat">
  Content
</div>
```

---

## Best Practices

### 1. **Use Black as Primary**
- Uber's brand color is black (#000000)
- Use for primary buttons, navigation, headers

### 2. **Blue for Interactive Elements**
- Use Uber Blue (#276EF1) for links, secondary CTAs
- Provides good contrast and clarity

### 3. **Green for Success**
- Use Uber Green (#166C3B) for success states
- Great for badges showing "Active" or "Completed"

### 4. **Consistent Spacing**
- Use the spacing scale (multiples of 4px)
- Maintains visual rhythm

### 5. **Subtle Shadows**
- Use `uber-shadow-sm` for most cards
- Reserve `uber-shadow-lg` for modals/overlays

### 6. **Smooth Transitions**
- All interactive elements have 200ms transitions
- Buttons lift on hover (translateY(-1px))

### 7. **Mobile-First**
- All components are responsive
- Font sizes adjust on mobile (<768px)

---

## Component Examples

### KPI Card
```html
<div class="uber-card-flat">
  <div class="text-sm text-uber-gray-600 mb-1">Total Revenue</div>
  <div class="text-3xl font-bold text-uber-black">$1,245,320</div>
  <div class="text-xs text-uber-green mt-1 flex items-center gap-1">
    <svg class="w-4 h-4">↑</svg>
    +12.5% from last month
  </div>
</div>
```

### Data Table Row
```html
<tr class="border-t border-uber-gray-200 hover:bg-uber-gray-50">
  <td class="px-4 py-3">John Doe</td>
  <td class="px-4 py-3">
    <span class="uber-badge uber-badge-green">Active</span>
  </td>
  <td class="px-4 py-3 text-right">$2,500.00</td>
</tr>
```

### Filter Bar
```html
<div class="flex gap-4 items-end mb-6">
  <div>
    <label class="block text-sm font-medium text-uber-gray-700 mb-1">
      Client
    </label>
    <select class="uber-input uber-select">
      <option>Flavio's Dog House</option>
    </select>
  </div>

  <div>
    <label class="block text-sm font-medium text-uber-gray-700 mb-1">
      Plan Year
    </label>
    <select class="uber-input uber-select">
      <option>2024 Plan Year</option>
    </select>
  </div>

  <button class="uber-btn uber-btn-blue">
    <svg class="w-5 h-5">...</svg>
    Export
  </button>
</div>
```

---

## Accessibility

All Uber-style components include:

✅ **Focus States** - Visible 2px blue outline with offset
✅ **Keyboard Navigation** - Tab through interactive elements
✅ **ARIA Labels** - Semantic HTML and ARIA where needed
✅ **Color Contrast** - WCAG AA compliant
✅ **Disabled States** - 50% opacity, not-allowed cursor

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 14+, Chrome Android latest

---

## Need Help?

Refer to:
- [Uber Base Design System](https://base.uber.com/)
- [Uber Brand Guidelines](https://brand.uber.com/)
- This project's `app/globals.css` for all CSS custom properties

---

**Design System Version:** 1.0.0
**Last Updated:** 2025-10-10
**Maintained by:** Healthcare Dashboard Team
