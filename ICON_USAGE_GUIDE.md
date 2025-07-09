# Icon Usage Guide

## Overview
Your BRNApp now has a comprehensive icon system that automatically handles light and dark theme variants. Since your app uses a black and white color scheme, high-contrast variants are not needed.

## How to Use Icons

### Basic Usage
```tsx
import { SvgIcon } from '../components/SvgIcon';

// Simple icon usage
<SvgIcon name="home" size={24} />

// With custom color
<SvgIcon name="like" size={32} color="#FF0000" />

// With custom styling
<SvgIcon name="profile" size={48} style={{ marginRight: 8 }} />
```

### Available Icons

#### Core Navigation Icons
- `home` / `home_dark` - Home icon
- `profile` / `profile_dark` - Profile icon  
- `scan` / `scan_dark` - QR Scanner icon
- `wallet` / `wallet_dark` - Wallet icon

#### Action Icons
- `like` / `like_dark` - Like/Heart icon
- `share` / `share_dark` - Share icon
- `comment` / `comment_dark` - Comment icon
- `report` / `report_dark` - Report icon

#### Content Creation Icons
- `create_post` / `create_post_dark` - Create post icon
- `photo` / `photo_dark` - Photo icon
- `video` / `video_dark` - Video icon
- `text_post` / `text_post_dark` - Text post icon

#### Quest Icons
- `quest` / `quest_dark` - General quest icon
- `tutorial_quest` / `tutorial_quest_dark` - Tutorial quest
- `first_like_quest` / `first_like_quest_dark` - First like quest
- `first_scan_quest` / `first_scan_quest_dark` - First scan quest
- `smoke_match_quest` / `smoke_match_quest_dark` - Smoke match quest
- `workout_match_quest` / `workout_match_quest_dark` - Workout match quest

#### Matching Icons
- `dating_matching` / `dating_matching_dark` - Dating matching
- `friendship_matching` / `friendship_matching_dark` - Friendship matching
- `smoke_matching` / `smoke_matching_dark` - Smoke matching
- `workout_matching` / `workout_matching_dark` - Workout matching

#### QR and Scanning Icons
- `qr_scanner_frame` / `qr_scanner_frame_dark` - QR scanner frame
- `scan_target` / `scan_target_dark` - Scan target

#### Utility Icons
- `info` / `info_dark` - Information icon
- `close_modal` / `close_modal_dark` - Close modal
- `more_menu` / `more_menu_dark` - More menu
- `back_arrow` / `back_arrow_dark` - Back arrow

#### Communication Icons
- `send_message` / `send_message_dark` - Send message
- `message` / `message_dark` - Message icon
- `voice` / `voice_dark` - Voice message

#### Token and Earning Icons
- `tip` / `tip_dark` - Tip icon
- `custom_amount` / `custom_amount_dark` - Custom amount
- `earned_tokens` / `earned_tokens_dark` - Earned tokens
- `spent_tokens` / `spent_tokens_dark` - Spent tokens
- `earning_potential` / `earning_potential_dark` - Earning potential

#### Verification and Status Icons
- `verified` / `verified_dark` - Verified badge
- `milestone` / `milestone_dark` - Milestone icon

#### Additional Icons from New Pack
- `camera` / `camera_dark` - Camera icon
- `chat` / `chat_dark` - Chat icon
- `check` / `check_dark` - Check mark
- `dating` / `dating_dark` - Dating icon
- `info_new` / `info_new_dark` - Alternative info icon
- `talk` / `talk_dark` - Talk icon
- `water` / `water_dark` - Water icon
- `report_toxicity` / `report_toxicity_dark` - Report toxicity
- `quests` / `quests_dark` - Quests icon
- `scan_new` / `scan_new_dark` - Alternative scan icon
- `smoke_match` / `smoke_match_dark` - Smoke match icon
- `tutorial_quest_new` / `tutorial_quest_new_dark` - Alternative tutorial quest
- `custom_amount_new` / `custom_amount_new_dark` - Alternative custom amount
- `dating_icon` / `dating_icon_dark` - Alternative dating icon
- `friendship_matching_new` / `friendship_matching_new_dark` - Alternative friendship matching
- `home_new` / `home_new_dark` - Alternative home icon
- `info_icon` / `info_icon_dark` - Alternative info icon
- `like_new` / `like_new_dark` - Alternative like icon
- `message_icon` / `message_icon_dark` - Alternative message icon
- `photo_new` / `photo_new_dark` - Alternative photo icon
- `profile_new` / `profile_new_dark` - Alternative profile icon
- `scan_qr` / `scan_qr_dark` - Alternative QR scan icon
- `text_post_new` / `text_post_new_dark` - Alternative text post icon
- `tip_new` / `tip_new_dark` - Alternative tip icon
- `video_new` / `video_new_dark` - Alternative video icon
- `workout_match` / `workout_match_dark` - Alternative workout match icon

#### Additional Missing Icons
- `wet` / `wet_dark` - Wet/Drench icon
- `share_alt` - Alternative share icon
- `wallet_alt` / `wallet_alt_dark` - Alternative wallet icon

## Theme Support

The icon system automatically handles two theme modes:

1. **Light Mode** - Uses base icon names (e.g., `home`)
2. **Dark Mode** - Uses `_dark` variants (e.g., `home_dark`)
3. **High-Contrast Mode** - Uses dark variants for better visibility in your black and white app

## Usage Examples

```tsx
// Basic usage with automatic theme switching
<SvgIcon name="home" size={24} />

// Custom color override
<SvgIcon name="like" size={32} color="#FF0000" />

// Large icon with custom styling
<SvgIcon 
  name="profile" 
  size={48} 
  style={{ marginRight: 8, opacity: 0.8 }} 
/>

// Using alternative icon variants
<SvgIcon name="home_new" size={24} />
<SvgIcon name="like_new" size={24} />
```

## Icon Categories

### Navigation Icons
Used for main app navigation and core functionality.

### Action Icons
Used for user interactions like liking, sharing, commenting.

### Content Creation Icons
Used for creating different types of content.

### Quest Icons
Used for various quest and achievement systems.

### Matching Icons
Used for different types of matching features.

### Communication Icons
Used for messaging and communication features.

### Token Icons
Used for earning, spending, and token-related features.

### Utility Icons
Used for general UI elements like modals, menus, and navigation.

## Notes

- All icons support light and dark themes
- Icons automatically adapt to the current theme
- Missing icons fall back gracefully to available variants
- The system includes both original and alternative icon variants
- High-contrast mode uses dark variants for better visibility in your black and white app
- No separate high-contrast variants needed since your app is already high-contrast by design 