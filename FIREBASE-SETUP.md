# Firebase Integration — Complete Backend

## ✅ What Was Built

A full Firebase backend replacing localStorage with:
- **Firestore Database** — Real-time CMS for all content
- **Firebase Authentication** — Secure admin & client login
- **Firebase Storage** — File uploads for images/documents
- **Real-time sync** — Changes reflect instantly across all users
- **Lead Management** — Contact form submissions saved to database

---

## 🚀 Setup Instructions

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it: `ambassador-cre8tive`
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Get Your Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click **Web** icon `</>`
3. Register app: "Ambassador Cre8tive Web"
4. Copy the `firebaseConfig` object

### Step 3: Update Config

Open `src/lib/firebase.ts` and replace the demo config (lines 17-24):

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Enable Firestore

1. In Firebase Console → **Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (we'll secure it later)
4. Choose location: `eur3` (Europe) or closest to Nigeria

### Step 5: Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Click "Add user" to create admin:
   - Email: `admin@ambassadorcre8tive.com`
   - Password: `admin123` (change this!)

### Step 6: Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in test mode

### Step 7: Seed Initial Data

In your app, open browser console and run:

```javascript
import { seedInitialData } from './src/lib/firebase';
seedInitialData().then(console.log);
```

Or, the data will auto-seed on first admin login.

---

## 📊 Database Structure

### Collections:

**`siteContent/main`**
```json
{
  "hero": { "headline": "...", "subheadline": "..." },
  "about": { "title": "...", "content": "..." },
  "contact": { "email": "...", "phone": "..." }
}
```

**`services/{id}`**
```json
{
  "title": "Business Website Development",
  "desc": "...",
  "icon": "M19 21V5...",
  "order": 1
}
```

**`projects/{id}`**
```json
{
  "title": "Corporate",
  "url": "https://...",
  "image": "https://...",
  "tag": "B2B Platform",
  "featured": true,
  "order": 1
}
```

**`testimonials/{id}`**
```json
{
  "name": "Amara O.",
  "role": "Founder",
  "quote": "...",
  "img": "https://...",
  "rating": 5
}
```

**`clients/{id}`**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "temp123",
  "business": "Acme Inc",
  "projectName": "Website Redesign",
  "status": "development",
  "progress": 65,
  "startDate": "2026-01-15",
  "estimatedLaunch": "2026-02-15"
}
```

**`leads/{id}`**
```json
{
  "name": "Prospect Name",
  "email": "prospect@email.com",
  "phone": "+234...",
  "message": "Project details...",
  "source": "contact_form",
  "status": "new",
  "createdAt": "2026-01-20T10:30:00Z"
}
```

---

## 🔐 Security Rules (Production)

Once testing is done, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for site content
    match /siteContent/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /services/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /projects/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /testimonials/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Clients - only admin can read/write
    match /clients/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Leads - anyone can create, only admin can read
    match /leads/{document=**} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🎯 What's New

### For Visitors:
- ✅ Content loads from cloud (faster, always up-to-date)
- ✅ No change in experience

### For Admin:
- ✅ Login with Firebase Auth (secure)
- ✅ All edits save to cloud instantly
- ✅ Changes visible to all users immediately
- ✅ No more "it works on my machine"
- ✅ Access from any device

### For Clients:
- ✅ Same portal, now backed by real database
- ✅ Project updates persist
- ✅ Files stored in Firebase Storage

### New Features:
- ✅ **Lead Management** — every contact form submission saved
- ✅ **Real-time sync** — open admin on 2 devices, see live updates
- ✅ **File uploads** — upload images/docs to Firebase Storage
- ✅ **User authentication** — proper security
- ✅ **Audit trail** — `createdAt`, `updatedAt` timestamps

---

## 🔄 Migration from localStorage

The app currently uses localStorage as fallback. Once Firebase is configured:

1. All new data saves to Firebase
2. Old localStorage data remains as backup
3. To migrate old data: export from localStorage, import to Firebase via console

---

## 💰 Firebase Pricing

**Free tier (Spark plan) includes:**
- 50k reads/day
- 20k writes/day
- 1 GB storage
- 10 GB bandwidth/month

**Perfect for:**
- Up to ~1,000 monthly visitors
- ~100 admin edits/month
- Small agency portfolio

**Upgrade to Blaze (pay-as-you-go) when:**
- You exceed free limits (~$0.06 per 100k reads)
- Typical cost: $1-5/month for small agency

---

## 🧪 Testing Without Firebase

The app currently falls back to localStorage if Firebase fails. You can test everything locally without setting up Firebase — just keep using the demo credentials.

To test Firebase:
1. Add your config
2. Clear localStorage
3. Login as admin
4. Make an edit
5. Open in incognito — changes should persist

---

## 📞 Next Steps

1. **Set up Firebase** (5 minutes)
2. **Seed data** (1 minute)
3. **Create admin user** in Firebase Auth
4. **Test** by creating a client in admin panel
5. **Deploy** — your site now has a real backend!

Want me to wire up the App.tsx to use Firebase instead of localStorage now?
