# Admin Panel Access Guide

## How to Access the Admin Panel

The admin panel is accessed via a URL parameter. You can open it in a **separate browser tab** to monitor both the user view and admin panel simultaneously.

### Method 1: Direct URL

**Admin Panel:**
```
http://localhost:5173?admin=true
```

**User View (Regular App):**
```
http://localhost:5173
```

### Method 2: Manual URL Modification

1. Open the application: `http://localhost:5173`
2. Add `?admin=true` to the end of the URL in your browser's address bar
3. Press Enter

## Using Two Tabs

**Recommended Setup:**

1. **Tab 1 - Admin Panel:**
   - Open: `http://localhost:5173?admin=true`
   - Use this to:
     - Upload employee Excel files
     - Manage questions
     - View user list
     - Monitor live votes
     - Start questions
     - Show results
     - Control lucky draw

2. **Tab 2 - User View:**
   - Open: `http://localhost:5173`
   - Use this to:
     - Test the user experience
     - See how users interact with the app
     - Monitor the flow from signup to voting

## Features Available in Admin Panel

- **Questions Tab:**
  - Upload Excel file with employee names
  - Add/edit/delete questions
  - Start questions (go live)

- **Users Tab:**
  - View all registered users/employees
  - See user count
  - Refresh user list

- **Live Monitor Tab:**
  - View live vote counts
  - Check question status
  - Show results

- **Lucky Draw Tab:**
  - Start lucky draw wheel
  - Pick random winners

## Notes

- The bottom navigation bar has been removed for a cleaner experience
- Admin access is controlled by the URL parameter `?admin=true`
- You can open multiple tabs with different URLs to monitor both views
- Changes in admin panel (like starting questions) will affect all user views in real-time

