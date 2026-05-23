# Admin Dashboard Access - FIXED

## Issue Resolved
Changed from BrowserRouter to HashRouter to work with single-file static hosting.

## How to Access Admin

### Method 1: Footer Icon (Recommended)
1. Scroll to the very bottom of the website
2. In the footer, next to the copyright text, you'll see a **tiny lock icon** (20% opacity)
3. Hover over it to see it more clearly
4. Click to access admin login

### Method 2: Direct URL
Add `#/admin` to the end of your website URL:
- `https://your-site.com/#/admin`
- Or `https://your-site.com/index.html#/admin`

### Method 3: Browser Console
Open console and type:
```javascript
window.location.hash = '#/admin'
```

## Login Credentials
- **Email:** admin@ambassadorcre8tive.com
- **Password:** admin123

## Features
✅ Full CMS control
✅ Edit all text content
✅ Manage services
✅ Add projects with auto-generated mockups from URLs
✅ Live preview of projects (non-functional iframe)
✅ Manage testimonials
✅ Blog management
✅ All changes saved to browser localStorage

## Project Upload Feature
1. Go to Projects tab in admin
2. Enter project title and URL
3. Click "Generate Mockup" - automatically creates screenshot
4. Click "Add Project"
5. On main site, hover portfolio card → click eye icon for preview

The admin is now working with hash-based routing which works on all static hosts!
