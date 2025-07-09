# Menu Architecture

## Menu Naming Convention

### **Main Menu** (Bottom Navigation)
- **Location**: Bottom of screen
- **Purpose**: Primary app navigation
- **Visibility**: Only shows on feed screen
- **Icons**: Home, Dating, Marketplace, Create Post, Scan, Chat, Wallet, Profile

### **Context Menu** (Side Actions)
- **Location**: Right side of posts
- **Purpose**: Post-specific actions
- **Visibility**: Shows on each post
- **Actions**: Like, Comment, Share, Tip

## Implementation Details

### Main Menu Features
- ✅ **Single instance** - No duplicate menus
- ✅ **Feed-only display** - Only shows when viewing feed
- ✅ **SVG icons** - Uses custom icon pack
- ✅ **Theme support** - Adapts to light/dark themes

### Context Menu Features
- ✅ **Floating position** - Always visible on right side
- ✅ **Enhanced visibility** - Dark background with borders
- ✅ **Text shadows** - Improved readability
- ✅ **High z-index** - Appears above content

## Styling Classes

### Main Menu
```css
.bottomNav - Main navigation container
.navIcon - Individual navigation buttons
.navIconText - Navigation icon styling
```

### Context Menu
```css
.rightActions - Context menu container
.postActions - Action buttons container
.actionButton - Individual action buttons
.actionIcon - Action button icons
.actionText - Action button text
```

## Future Enhancements

### Main Menu
- [ ] Floating transparent design
- [ ] No visual distinction from screen
- [ ] Text doesn't cover menu

### Context Menu
- [ ] Haptic feedback on actions
- [ ] Animation on button press
- [ ] Custom action callbacks 