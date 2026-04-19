# Phase 6 — Firebase Security Rules

> Part of the [Master Plan](./master-plan.md)

---

## Security Rules

Apply these rules in the Firebase Console before production:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function getUser() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function isSuperadmin() { return isSignedIn() && getUser().role == 'superadmin'; }
    function isAdmin() { return isSignedIn() && getUser().role == 'admin'; }
    function isAdminOfMerchant(merchantId) { return isAdmin() && getUser().merchant == merchantId; }

    match /users/{userId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdmin() && resource.data.merchant == getUser().merchant && resource.data.role == 'cashier';
      allow write: if isAdmin() && request.resource.data.merchant == getUser().merchant && request.resource.data.role == 'cashier';
    }

    match /merchants/{merchantId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdminOfMerchant(merchantId);

      match /products/{productId} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
      }

      match /sales/{saleDate} {
        allow read, write: if isSuperadmin();
        allow read: if isAdminOfMerchant(merchantId);
      }
    }
  }
}
```

---

## Checklist

### Rule Deployment

- [ ] Copy rules to Firebase Console → Firestore → Rules
- [ ] Publish rules
- [ ] Verify rules compile without errors in the Firebase Console

### Access Verification — Superadmin

- [ ] Can read and write all documents in `users` collection
- [ ] Can read and write all documents in `merchants` collection
- [ ] Can read and write all products subcollections
- [ ] Can read and write all sales subcollections

### Access Verification — Admin Merchant

- [ ] Can read cashier users within own merchant
- [ ] Can write (create/update) cashier users within own merchant
- [ ] Cannot read or write users from other merchants
- [ ] Can read own merchant document
- [ ] Cannot write to merchant documents
- [ ] Can read and write products within own merchant
- [ ] Can read sales within own merchant
- [ ] Cannot access other merchants' products or sales

### Access Verification — Unauthenticated

- [ ] Cannot read or write any document
- [ ] All requests are denied

### Security Best Practices

- [ ] Validate input on client side **and** in Firestore Security Rules
- [ ] Ensure no open rules remain from test mode
- [ ] Test rules using Firebase Emulator or Rules Playground

---

## Conventions for This Phase

### Firestore Conventions

- Always scope queries to the user's merchant when the role is `admin`
- Use `where()` before `orderBy()` to satisfy Firestore index requirements
- Create Firestore indexes for compound queries (e.g., filter by category + order by date)

### Security Conventions

- Validate user input on both client and Firestore Security Rules level
- Never leave Firestore in test mode for production
- Keep Firebase API keys in `.env` and never expose them in public repositories
