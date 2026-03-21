# Tailwind Color Configuration

## Color Choices

- **Primary:** `indigo` — Used for buttons, links, key accents
- **Secondary:** `amber` — Used for tags, highlights, secondary elements
- **Neutral:** `slate` — Used for backgrounds, text, borders

## Usage Examples

### Primary (Indigo)

```
Primary button: bg-indigo-600 hover:bg-indigo-700 text-white
Primary link: text-indigo-600 hover:text-indigo-700
Primary badge: bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400
Focus ring: focus:ring-indigo-500 focus:border-indigo-500
```

### Secondary (Amber)

```
Secondary badge: bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
Warning state: text-amber-600 dark:text-amber-400
Highlight: bg-amber-50 dark:bg-amber-900/20
```

### Neutral (Slate)

```
Background: bg-slate-50 dark:bg-slate-950
Card: bg-white dark:bg-slate-900
Border: border-slate-200 dark:border-slate-700
Text primary: text-slate-900 dark:text-slate-100
Text secondary: text-slate-500 dark:text-slate-400
Text muted: text-slate-400 dark:text-slate-500
```

## Dark Mode

All components use Tailwind's `dark:` prefix for dark mode support. The dark mode colors are designed to work with a dark background (`slate-950`).
