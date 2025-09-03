# Firebase Setup for Multi-Admin JagaWarga

This guide explains how to set up Firebase for the multi-admin JagaWarga system.

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Initial Setup

1. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```
   
   Select:
   - Firestore: Configure security rules and indexes files
   - Hosting: Configure files for Firebase Hosting
   - Authentication (optional for local testing)

2. Deploy Firestore rules and indexes:
   ```bash
   firebase deploy --only firestore
   ```

## Security Rules Overview

The `firestore.rules` file implements province-based isolation:

### User Access Rules
- **Owners**: Can access all data across all provinces
- **Volunteers**: Can only access data for their assigned province
- **Users**: Can read their own profile and update limited fields

### Map Elements Rules
- **Read**: Public access (for public map display)
- **Create/Update/Delete**: Only authenticated active users in the correct province

### Invitation Rules
- **Read**: Public access (for token validation)
- **Create**: Only owners can create invitations
- **Update**: Mark as used during registration, or revoke by creator
- **Delete**: Not allowed (use revocation instead)

## Required Indexes

The system requires several composite indexes for efficient queries:

### Users Collection
- `role` + `createdAt` (for user listings)
- `assignedProvince` + `isActive` (for province filtering)
- `role` + `assignedProvince` + `isActive` (for complex filters)

### Map Elements Collection
- `province` + `createdAt` (for province-specific listings)
- `createdBy` + `createdAt` (for user's elements)

### Invitations Collection
- `createdBy` + `createdAt` (for creator's invitations)
- `province` + `createdAt` (for province-specific invitations)
- `isUsed` + `createdAt` (for filtering by status)
- `isRevoked` + `createdAt` (for filtering by status)
- `province` + `isUsed` + `isRevoked` (for complex filters)

## Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Authentication Setup

1. Enable Authentication in Firebase Console
2. Configure sign-in methods:
   - Google (recommended)
   - Phone (for Indonesia)
   - Email/Password (optional)

3. Set up authorized domains:
   - localhost (for development)
   - Your production domain

## Testing Security Rules

Use Firebase emulators for local testing:

```bash
firebase emulators:start
```

This will start:
- Firestore emulator on port 8080
- Authentication emulator on port 9099
- Hosting emulator on port 5000

## Deployment Commands

Deploy different parts of your Firebase project:

```bash
# Deploy everything
firebase deploy

# Deploy only Firestore rules and indexes
firebase deploy --only firestore

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions (if you add them later)
firebase deploy --only functions
```

## Security Best Practices

1. **Never store sensitive data in Firestore documents**
2. **Always validate user permissions in security rules**
3. **Use server timestamps for audit trails**
4. **Implement proper error handling in your application**
5. **Monitor Firebase usage and set up billing alerts**

## Monitoring and Maintenance

1. **Monitor Firestore usage** in Firebase Console
2. **Set up billing alerts** to avoid unexpected costs
3. **Regularly review security rules** for any changes needed
4. **Monitor authentication patterns** for suspicious activity
5. **Keep indexes optimized** as your query patterns evolve

## Common Issues and Solutions

### Index Creation Failed
- Check the `firestore.indexes.json` file syntax
- Deploy indexes manually: `firebase deploy --only firestore:indexes`

### Permission Denied
- Verify user authentication status
- Check security rules match your data structure
- Ensure user document exists with correct role/province

### Query Performance Issues
- Verify required composite indexes are created
- Check query patterns match available indexes
- Consider denormalization for frequently accessed data

## Support and Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)