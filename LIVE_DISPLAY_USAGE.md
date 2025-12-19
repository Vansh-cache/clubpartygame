# Live Question Display - Usage Guide

## Overview
The Live Question Display is a dedicated view for showing questions and results on a main screen (TV, projector, etc.) in clubs or event venues. It provides a clean, large-format display without any user interaction controls.

## Access URL

To access the live display, open the application with the `display=live` query parameter:

```
http://localhost:5173/?display=live
```

For production:
```
https://your-domain.com/?display=live
```

## Features

### 1. **Waiting State**
- Shows a large animated clock and "Waiting for Next Question..." message
- Animated background particles
- Automatically detects when a question goes live

### 2. **Active Question Display**
- **Large Timer**: Displays remaining time in seconds with visual progress bar
- **Question Text**: Shows the question in large, animated text (6xl-8xl font size)
- **Live Vote Counts**: Real-time vote counts for each employee displayed in a grid
- **Color Changes**: Timer turns red when less than 10 seconds remain
- Polls for updates every 2-3 seconds

### 3. **Results Display**
- **Winner Announcement**: Large trophy icon with animated effects
- **Winner Name**: Displays winner's name in huge text (8xl font size)
- **Vote Details**: Shows vote count and total votes
- **Celebration Effects**: Animated particles and sparkles
- **Auto-dismiss**: Results show for 10 seconds, then returns to waiting state

## Technical Details

### Polling Intervals
- **Active Question Check**: Every 2 seconds
- **Live Vote Counts**: Every 3 seconds
- **Timer Update**: Every 1 second

### Auto-Transitions
- Question → Results: Automatically when timer reaches 0
- Results → Waiting: After 10 seconds

### Responsive Design
- Optimized for large screens (TVs, projectors)
- Scales text appropriately for different screen sizes
- Full-screen gradient backgrounds

## Setup Instructions

### 1. For Club Display (Recommended Setup)

1. Open a browser in **full-screen mode** (F11 on most browsers)
2. Navigate to: `http://your-server-url/?display=live`
3. Keep this window/tab open throughout the event
4. The display will automatically update as questions are activated

### 2. For Testing

1. Start your development server
2. Open browser tab: `http://localhost:5173/?display=live`
3. In another tab, open admin panel: `http://localhost:5173/?admin=true`
4. Activate questions from admin panel and watch the live display update

### 3. Multiple Displays

You can open multiple live displays on different screens:
- All will sync automatically
- Each display independently polls the backend
- Useful for multiple TVs in different rooms

## Admin Workflow

1. **Admin** activates a question from the admin panel
2. **Live Display** automatically detects and shows the question with timer
3. **Users** vote on their devices (phones/tablets)
4. **Live Display** shows real-time vote counts
5. When timer ends, **Live Display** automatically shows the winner
6. After 10 seconds, **Live Display** returns to waiting state
7. Repeat for next question

## Styling & Customization

The component uses:
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Lucide Icons** for icons (Clock, Trophy, Sparkles)
- **Gradient backgrounds** (purple-900 → black → cyan-900)

### Color Scheme
- Primary: Cyan (#06B6D4)
- Secondary: Purple (#A855F7)
- Accent: Yellow (#FACC15)
- Danger: Red (#EF4444)

## Browser Compatibility

Tested and works on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Brave

For best performance, use Chrome or Edge in full-screen mode.

## Troubleshooting

### Display not updating?
- Check internet connection
- Verify backend server is running
- Open browser console (F12) for errors
- Refresh the page (F5)

### Timer out of sync?
- The timer syncs based on server activation time
- All displays should show the same time
- If not, refresh the page

### Results not showing?
- Ensure at least one vote was cast
- Check that the question was marked as completed in admin panel
- Results auto-show after 10 seconds

## Performance Notes

- Lightweight polling (2-3 second intervals)
- Minimal bandwidth usage
- No localStorage or session management
- Stateless component (can refresh anytime)
- No database writes (read-only)

---

**Pro Tip**: For events, set up the live display on the main screen before the event starts. It will show the waiting screen until you're ready to activate the first question from the admin panel.

