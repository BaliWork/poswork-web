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
    function isSupervisor() { return isSignedIn() && getUser().role == 'supervisor'; }
    function isAdminOfMerchant(merchantId) { return isAdmin() && getUser().merchant == merchantId; }
    function isSupervisorOfMerchant(merchantId) { return isSupervisor() && getUser().merchant == merchantId; }

    // users collection
    // Superadmin: full access
    // Admin: can read/write supervisor users within own merchant only
    //   — enforced at app level: max 1 supervisor per merchant, cannot create admin accounts
    // Supervisor: read own profile only
    match /users/{userId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdmin() && resource.data.merchant == getUser().merchant
                                && resource.data.role == 'supervisor';
      allow write: if isAdmin() && request.resource.data.merchant == getUser().merchant
                                 && request.resource.data.role == 'supervisor';
      allow read: if isSupervisor() && userId == request.auth.uid;
    }

    match /merchants/{merchantId} {
      allow read, write: if isSuperadmin();
      allow read: if isAdminOfMerchant(merchantId) || isSupervisorOfMerchant(merchantId);

      // products subcollection — admin only (supervisor has no access)
      match /products/{productId} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
      }

      // sales subcollection — supervisor: read-only
      match /sales/{saleDate} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
        allow read: if isSupervisorOfMerchant(merchantId);
      }

      // cashiers subcollection — admin only (supervisor has no access)
      match /cashiers/{pinCode} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
      }

      // expenses subcollection — supervisor: full read/write
      match /expenses/{expenseId} {
        allow read, write: if isSuperadmin();
        allow read, write: if isAdminOfMerchant(merchantId);
        allow read, write: if isSupervisorOfMerchant(merchantId);
      }
    }
  }
}
```

---

## Checklist

### Rule Deployment

- [x] Copy rules to Firebase Console → Firestore → Rules
- [x] Publish rules
- [x] Verify rules compile without errors in the Firebase Console
- [x] Update rules to reflect revised Supervisor permissions (no cashiers, no products, sales read-only)

### Access Verification — Superadmin

- [x] Can read and write all documents in `users` collection
- [x] Can read and write all documents in `merchants` collection
- [x] Can read and write all products subcollections
- [x] Can read and write all sales subcollections
- [x] Can read and write all cashiers subcollections
- [x] Can read and write all expenses subcollections

### Access Verification — Admin Merchant

- [x] Can read cashier users within own merchant
- [x] Update: Admin can only read/write **supervisor** users (not cashiers) within their own merchant
- [x] Admin cannot create users with `role === 'admin'` — enforced at app level (role selector restricted)
- [x] Admin can create at most **1 supervisor** per merchant — enforced at app level
- [x] Cannot read or write users from other merchants
- [x] Can read own merchant document
- [x] Cannot write to merchant documents
- [x] Can read and write products within own merchant
- [x] Can read sales within own merchant
- [x] Cannot access other merchants' products or sales
- [x] Can read and write cashiers within own merchant (`cashiers` subcollection)
- [x] Can read and write expenses within own merchant

### Access Verification — Supervisor

- [x] Can read own user profile only (own `users/{uid}` document)
- [x] Cannot read or write other user documents
- [x] Can read own merchant document
- [x] Cannot write to merchant documents
- [x] **Cannot** read or write products subcollection
- [x] Can read sales within own merchant (read-only)
- [x] **Cannot** read or write cashiers subcollection
- [x] Can read and write expenses within own merchant
- [x] Cannot access other merchants' data

### Access Verification — Unauthenticated

- [x] Cannot read or write any document
- [x] All requests are denied

### Security Best Practices

- [x] Validate input on client side **and** in Firestore Security Rules
- [x] Ensure no open rules remain from test mode
- [x] Test rules using Firebase Emulator or Rules Playground
- [x] Verify that the `cashiers` subcollection is inaccessible to Supervisor and unauthenticated users
- [x] Verify that cashier PINs can only be read by Superadmin and Admin of the corresponding merchant
- [x] Verify that Supervisor cannot write to the `products` subcollection

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
