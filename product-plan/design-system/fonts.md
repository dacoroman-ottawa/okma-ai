# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
```

Or in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
```

## Font Usage

- **Headings:** DM Sans — Clean, modern sans-serif
- **Body text:** DM Sans — Consistent with headings for a unified look
- **Code/technical:** JetBrains Mono — Excellent readability for code and numbers

## Tailwind Configuration

If using Tailwind, add to your CSS:

```css
@theme {
  --font-sans: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```
