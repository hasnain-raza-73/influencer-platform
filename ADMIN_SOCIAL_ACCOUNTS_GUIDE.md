# Admin Social Accounts Management - Quick Guide

**Last Updated**: March 3, 2026
**Access**: Admin role only
**Page**: `/admin/social-accounts`

---

## 🎯 Overview

The Admin Social Accounts Management page provides a comprehensive interface for managing and verifying influencer social media accounts across Instagram, Facebook, and TikTok.

---

## 🚀 Quick Start

### Accessing the Page

1. Login with admin credentials
2. Navigate to **Admin Panel** → **Social Accounts** in the sidebar
3. Or visit: `http://localhost:3001/admin/social-accounts`

### Admin Credentials (Development)
- **Email**: admin@platform.com
- **Password**: Admin@123456!

---

## 📊 Dashboard Features

### Statistics Cards

The dashboard displays four key metrics at the top:

1. **Total Accounts** (Blue) - All connected social accounts across all influencers
2. **Verified** (Green) - Accounts that have been admin-verified
3. **Pending** (Orange) - Accounts awaiting verification
4. **Featured** (Purple) - Premium verified accounts with Featured level

### Account Cards

Each social account is displayed in a card showing:

- **Platform Icon**: Color-coded gradient icon (Instagram purple/pink, Facebook blue, TikTok black)
- **Username**: Platform username with @handle
- **Platform Badge**: Small tag showing the platform name
- **Verification Badge**: Checkmark and level badge (Basic/Verified/Featured)
- **Influencer Info**: Display name and avatar
- **Metrics**: Follower count and engagement rate (if available)
- **Connected Date**: When the account was first connected
- **Action Buttons**: Verification toggle and level dropdown

---

## 🔍 Filtering & Search

### Search Bar

Real-time search by:
- Platform username (e.g., @influencer_handle)
- Influencer name
- Platform name (instagram, facebook, tiktok)

### Filter Panel

Click **"Filters"** button to reveal advanced filtering options:

#### Platform Filter
- **All** - Show all platforms
- **Instagram** - Show only Instagram accounts
- **Facebook** - Show only Facebook accounts
- **TikTok** - Show only TikTok accounts

#### Verification Status Filter
- **All** - Show all verification statuses
- **Verified** - Show only verified accounts
- **Unverified** - Show only unverified accounts

#### Verification Level Filter
- **All** - Show all verification levels
- **Basic** - Show Basic level accounts
- **Verified** - Show Verified level accounts
- **Featured** - Show Featured level accounts

### Clear Filters

When no results are found, click **"Clear Filters"** button in the empty state to reset all filters.

---

## ⚡ Actions

### Verify/Unverify Account

Click the verification status button on any account card:
- **Unverified** (gray) → Click to verify
- **Verified** (green) → Click to unverify

The button shows a spinner while processing and updates immediately on success.

### Change Verification Level

Use the dropdown below the verification button to set the verification level:
- **⭐ Basic Level** - Standard verification
- **✓ Verified Level** - Trusted verification
- **🌟 Featured Level** - Premium verification (highlighted)

The level updates immediately and the verification badge updates accordingly.

### Export to CSV

Click **"Export"** button in the header to download all filtered accounts as a CSV file containing:
- Platform
- Username
- Influencer name
- Follower count
- Verification status
- Verification level
- Connected date

### Refresh Data

Click **"Refresh"** button in the header to reload the data from the server. The button shows a spinning icon while loading.

---

## 📄 Pagination

For large datasets:

- **Results Info**: Shows "Showing X to Y of Z accounts"
- **Page Buttons**: Click page numbers (1, 2, 3, etc.)
- **Previous/Next**: Navigate through pages
- **Disabled States**: Previous disabled on page 1, Next disabled on last page

Default: 20 accounts per page

---

## 🎨 UI/UX Features

### Visual Design
- **Gradient Header**: Professional gradient text for the title
- **Colored Cards**: Each stat card has a unique colored left border
- **Platform Gradients**: Instagram (purple/pink), Facebook (blue), TikTok (black)
- **Hover Effects**: Cards have subtle shadow on hover
- **Smooth Animations**: All interactive elements have transitions

### States
- **Loading State**: Centered spinner with "Loading accounts..." message
- **Empty State**: Helpful message with icon when no results
- **Error State**: Red-bordered card with error message and retry button
- **Disabled States**: Buttons disable during actions to prevent double-clicks

### Dark Mode Support
- Full dark mode compatibility
- Automatic theme detection
- Proper contrast ratios for accessibility

### Responsive Design
- **Desktop**: Full-width layout with multi-column grids
- **Tablet**: Adjusted grid layout
- **Mobile**: Stacked cards, compact layout

---

## 🔒 Permissions

**Required Role**: ADMIN

**API Endpoints Used**:
- `GET /v1/social-integrations/admin/accounts` - List accounts with filters
- `PATCH /v1/social-integrations/admin/accounts/:id/verification` - Update verification

**Access Control**:
- Only admins can access this page
- Non-admin users are redirected
- All API calls include JWT authentication

---

## 💡 Tips & Best Practices

### Verification Guidelines

**When to Verify**:
- Account has been validated through platform APIs
- Influencer has provided proof of ownership
- Account metrics have been confirmed
- No suspicious activity detected

**Verification Levels**:
- **Basic**: Self-verified accounts, minimal checks
- **Verified**: Admin-verified, platform confirmed, trusted
- **Featured**: High-quality accounts, top influencers, premium showcase

**When to Unverify**:
- Suspicious activity detected
- Platform account disconnected
- Metrics inconsistencies found
- Terms of service violations

### Using Filters Effectively

1. **Find Pending Verifications**: Set Status to "Unverified"
2. **Review Featured Accounts**: Set Level to "Featured"
3. **Platform-Specific Review**: Filter by specific platform
4. **Combine Filters**: Use multiple filters together for precise results

### Export Use Cases

- **Monthly Reports**: Export all verified accounts
- **Platform Analysis**: Filter by platform then export
- **Audit Trail**: Regular exports for compliance
- **Data Backup**: Periodic snapshots

---

## 🐛 Troubleshooting

### "Failed to load social accounts"

**Possible Causes**:
1. Backend server not running
2. Database connection issues
3. Authentication token expired
4. Network connectivity problems

**Solutions**:
1. Check backend is running on port 3000
2. Click "Try Again" button in error message
3. Refresh the page
4. Re-login if token expired
5. Check browser console for detailed errors

### Verification not updating

**Check**:
1. Button shows spinner during update
2. No error messages in console
3. Admin permissions are active
4. Account ID is valid

### Filters not working

**Verify**:
1. Backend endpoint accepts filter parameters
2. At least one filter is selected
3. Clear browser cache if issues persist
4. Check network tab for API response

### Export button disabled

**Reason**: No accounts match the current filters

**Solution**: Adjust filters or clear them to show more results

---

## 📝 Data Flow

```
User Action → Frontend Component → Service Layer → Backend API → Database
     ↓               ↓                  ↓                ↓            ↓
  Click         State Update      HTTP Request    Controller    Query DB
  Button        Loading State     with Auth       Validation    Execute

Database → Backend API → Service Layer → Frontend Component → UI Update
   ↓           ↓              ↓                ↓                  ↓
Results    Format JSON    Update State    Re-render           Display
Return     Add Metadata   Handle Errors   Update UI           Success
```

---

## 🚀 Performance

### Optimization Features
- **Pagination**: Only load 20 accounts at a time
- **Client-side Search**: Fast filtering without API calls
- **Lazy Loading**: Images load as needed
- **Debounced Actions**: Prevent rapid-fire API calls
- **Optimistic Updates**: UI updates before API confirms

### Best Performance
- Use filters to reduce dataset size
- Search is client-side for instant results
- Export only necessary data
- Keep page sizes reasonable

---

## 🔮 Future Enhancements

### Planned Features
- Bulk verification (select multiple accounts)
- Verification notes/comments
- Audit log for verification changes
- Advanced analytics dashboard
- Auto-verification based on criteria
- Verification request workflow
- Email notifications for status changes
- API rate limiting display
- Account health score
- Fraud detection indicators

### API Integrations
- Direct Instagram API verification
- Facebook Business API integration
- TikTok Creator API connection
- Automatic metrics sync
- Real-time webhook updates

---

## 📚 Related Documentation

- **Full Feature Spec**: See `SOCIAL_MEDIA_INTEGRATION_COMPLETE.md`
- **API Documentation**: Check backend controller documentation
- **Database Schema**: See migration `1772303200000-CreateSocialIntegrationTables.ts`
- **Component Source**: `app/admin/social-accounts/page.tsx`

---

## 🎓 Training Resources

### For New Admins

1. **Watch for Patterns**: Look for suspicious metrics jumps
2. **Verify Authenticity**: Cross-check platform usernames
3. **Monitor Featured**: Higher scrutiny for featured accounts
4. **Document Decisions**: Use verification levels appropriately
5. **Regular Reviews**: Periodic audits of verified accounts

### Common Tasks

**Daily**:
- Review new unverified accounts
- Respond to verification requests
- Check for anomalies

**Weekly**:
- Export verification report
- Review featured accounts
- Update verification guidelines

**Monthly**:
- Full audit of verified accounts
- Platform-specific reviews
- Metrics validation

---

**Need Help?**
- Check error messages in the UI
- Review browser console logs
- Contact technical support
- Reference SOCIAL_MEDIA_INTEGRATION_COMPLETE.md

**Feedback?**
- Report issues on GitHub
- Suggest improvements
- Request new features
