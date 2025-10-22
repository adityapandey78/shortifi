# Magic UI Highlighter - Usage Guide

## ✨ What is it?

The Magic UI Highlighter component uses the `rough-notation` library to create hand-drawn style annotations on text. It provides a sketch-like, playful appearance that makes text stand out.

## 🎨 Available Annotation Types

### 1. **Highlight**
```jsx
<Highlighter action="highlight" color="#FFD700">
  highlighted text
</Highlighter>
```
Creates a background highlight effect behind the text.

### 2. **Underline**
```jsx
<Highlighter action="underline" color="#FF6B6B" strokeWidth={3}>
  underlined text
</Highlighter>
```
Draws a hand-drawn underline beneath the text.

### 3. **Box**
```jsx
<Highlighter action="box" color="#4ECDC4" strokeWidth={2}>
  boxed text
</Highlighter>
```
Wraps text in a rectangular box.

### 4. **Circle**
```jsx
<Highlighter action="circle" color="#95E1D3" strokeWidth={2}>
  circled text
</Highlighter>
```
Draws a circle around the text.

### 5. **Crossed Off**
```jsx
<Highlighter action="crossed-off" color="#FF8C94">
  crossed out
</Highlighter>
```
Draws an X through the text.

### 6. **Strike Through**
```jsx
<Highlighter action="strike-through" color="#A8E6CF">
  strike through
</Highlighter>
```
Draws a horizontal line through the middle of text.

### 7. **Bracket**
```jsx
<Highlighter action="bracket" color="#B8B8D1" strokeWidth={2}>
  bracketed text
</Highlighter>
```
Adds brackets on both sides of text.

## 🔧 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | string | `"highlight"` | Type of annotation (see above) |
| `color` | string | `"#ffd1dc"` | Color of the annotation (hex/rgb) |
| `strokeWidth` | number | `2` | Thickness of the annotation line |
| `animationDuration` | number | `800` | Animation duration in ms |
| `iterations` | number | `1` | Number of times to draw (2-3 = more sketchy) |
| `padding` | number | `5` | Padding around the text |
| `multiline` | boolean | `false` | Whether to support multiline text |
| `isView` | boolean | `false` | Animate on scroll into view |

## 📝 Usage Examples

### In Your Home Page
```jsx
<p>
  Make your app{" "}
  <Highlighter action="highlight" color="#FFE66D" strokeWidth={3}>
    super fast
  </Highlighter>{" "}
  and{" "}
  <Highlighter action="underline" color="#FF6B6B" strokeWidth={3}>
    easy to use
  </Highlighter>
</p>
```

### With Animation on Scroll
```jsx
<Highlighter 
  action="highlight" 
  color="#87CEFA" 
  isView={true}
  animationDuration={1000}
>
  Appears when scrolled into view
</Highlighter>
```

### Sketchy Style (Multiple Iterations)
```jsx
<Highlighter 
  action="box" 
  color="#FF9800" 
  iterations={3}
  strokeWidth={2}
>
  More hand-drawn look
</Highlighter>
```

## 🎯 Current Usage in Home.jsx

```jsx
<p>
  The Shortifi is an{" "}
  <Highlighter action="underline" color="#FF9800" strokeWidth={3} padding={3}>
    efficient
  </Highlighter>{" "}
  and easy-to-use{" "}
  <Highlighter action="highlight" color="#87CEFA" strokeWidth={3} padding={3}>
    URL shortening
  </Highlighter>{" "}
  service that streamlines your online experience.
</p>
```

## 🎨 Recommended Color Palettes

### Warm Colors
- 🟡 Yellow: `#FFD700`, `#FFE66D`
- 🟠 Orange: `#FF9800`, `#FFA726`
- 🔴 Red: `#FF6B6B`, `#FF8C94`
- 🟣 Pink: `#FFB6C1`, `#FF69B4`

### Cool Colors
- 🔵 Blue: `#87CEFA`, `#4ECDC4`
- 🟢 Green: `#95E1D3`, `#A8E6CF`
- 🟣 Purple: `#B8B8D1`, `#9B59B6`
- 🔷 Teal: `#20B2AA`, `#48D1CC`

## 🐛 Troubleshooting

### Issue: Annotation appears in wrong position
**Fix:** Ensure proper spacing around the Highlighter component:
```jsx
// ✅ Good
text{" "}<Highlighter>word</Highlighter>{" "}more text

// ❌ Bad  
text<Highlighter>word</Highlighter>more text
```

### Issue: Annotation doesn't show
**Fix:** Check if `rough-notation` is installed:
```bash
npm install rough-notation
```

### Issue: Animation doesn't trigger on scroll
**Fix:** Set `isView={true}` prop:
```jsx
<Highlighter isView={true} action="highlight" color="#FFD700">
  text
</Highlighter>
```

## 📚 Demo Page

Check out `HighlighterDemo.jsx` for a comprehensive example of all annotation styles!

## 🔗 Library Used

- **rough-notation**: https://roughnotation.com/
- **Framer Motion**: For scroll-based animations

---

**Note**: The highlighter uses inline spacing (`mx-0.5`) for better positioning. All CSS fixes for proper SVG positioning are in `index.css`.
