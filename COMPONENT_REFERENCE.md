# Quick Reference: Before and After Migration

## Component Usage Examples

### Buttons

**Before:**

```tsx
<button className="btn btn-primary">Click me</button>
<button className="btn btn-secondary">Cancel</button>
```

**After:**

```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="secondary">Cancel</Button>
```

### Inputs

**Before:**

```tsx
<input type="text" className="..." />
<textarea className="..." />
```

**After:**

```tsx
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

<Input type="text" />
<Textarea />
```

### Cards

**Before:**

```tsx
<div className="card">Content here</div>
```

**After:**

```tsx
import { Card } from "@/components/ui/card";

<Card>Content here</Card>;
```

### Toggle Switches

**Before:**

```tsx
<button
  className={`toggle-switch ${active ? "active" : ""}`}
  onClick={toggle}
/>
```

**After:**

```tsx
import { Switch } from "@/components/ui/switch";

<Switch checked={active} onCheckedChange={toggle} />;
```

### Icons

**Before:**

```tsx
// Using emojis
<span>⚙️</span>
<span>🌙</span>
<span>☀️</span>

// Using custom SVG
<svg width="18" height="18" viewBox="0 0 18 18">
  <circle cx="9" cy="9" r="2.5" />
  <path d="M9 1V3M9 15V17..." />
</svg>
```

**After:**

```tsx
import { Settings, Moon, Sun } from 'lucide-react'

<Settings className="h-4 w-4" />
<Moon className="h-4 w-4" />
<Sun className="h-4 w-4" />
```

### Tabs

**Before:**

```tsx
<nav className="flex border-b">
  <button
    className={activeTab === "tab1" ? "active" : ""}
    onClick={() => setActiveTab("tab1")}
  >
    Tab 1
  </button>
</nav>
```

**After:**

```tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
</Tabs>;
```

### Modal/Dialog

**Before:**

```tsx
<div className="fixed inset-0 bg-black/60">
  <div className="bg-white rounded-2xl">
    <h2>Title</h2>
    <div>Content</div>
    <button>Close</button>
  </div>
</div>
```

**After:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>;
```

## Theme/Color References

### Before:

```css
.dark .my-element {
  background-color: #1a1a2e;
  color: #e4e4e7;
}
```

### After:

```tsx
<div className="bg-background text-foreground">
  {/* Automatically adapts to dark/light mode */}
</div>
```

### Common shadcn Color Classes:

- `bg-background` / `text-foreground` - Main background and text
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-muted` / `text-muted-foreground` - Muted/disabled states
- `bg-destructive` / `text-destructive-foreground` - Destructive actions
- `border-border` - Borders
- `text-accent` - Accent text

## Import Paths

All imports now use path aliases:

```tsx
// Before
import { useReminderStore } from "../store/reminderStore";
import Header from "./Header";

// After
import { useReminderStore } from "@/store/reminderStore";
import Header from "@/components/Header";
```

## Available lucide-react Icons Used

- **Actions:** `Play`, `Pause`, `Edit2`, `Trash2`, `Plus`, `X`, `Check`
- **Time:** `Clock`, `Timer`
- **UI:** `Settings`, `Sun`, `Moon`, `Inbox`, `Bell`
- **Window Controls:** `Minus`, `Maximize2`, `X`
- **Data:** `Download`, `Upload`

Browse all icons at: https://lucide.dev/icons/
