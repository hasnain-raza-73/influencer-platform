# Social Media Integration Feature Plan

## Overview
Enable influencers to connect their Instagram, Facebook, and TikTok accounts to verify their identity and automatically sync follower metrics, engagement data, and audience insights.

---

## Features & Capabilities

### 1. Platform Connections
**Supported Platforms:**
- Instagram Business/Creator Accounts
- Facebook Pages
- TikTok Creator Accounts
- (Future: YouTube, Twitter/X, LinkedIn)

**Connection Flow:**
1. Influencer navigates to Settings → Connected Accounts
2. Clicks "Connect [Platform]" button
3. Redirects to OAuth authorization page
4. Platform asks for permissions
5. User authorizes the connection
6. Redirected back with access token
7. System stores encrypted tokens
8. Fetch and display account verification status

---

## 2. Data Collection & Metrics

### Instagram Business API
**Available Metrics:**
- Username & Profile Picture
- Follower Count
- Following Count
- Media Count (posts)
- Engagement Rate (likes, comments per post)
- Top Posts (by engagement)
- Audience Demographics:
  - Age ranges
  - Gender distribution
  - Top locations/countries
  - Active hours
- Story Views (if available)
- Reel Views & Plays

**API Endpoints:**
- `GET /{instagram-business-account-id}` - Basic profile info
- `GET /{instagram-business-account-id}/insights` - Audience insights
- `GET /{instagram-business-account-id}/media` - Recent posts
- `GET /{media-id}/insights` - Post-level metrics

### Facebook Pages API
**Available Metrics:**
- Page Name & Profile
- Page Followers
- Page Likes
- Post Reach & Engagement
- Audience Demographics
- Top Posts

**API Endpoints:**
- `GET /{page-id}` - Page details
- `GET /{page-id}/insights` - Page insights
- `GET /{page-id}/posts` - Recent posts

### TikTok Creator API
**Available Metrics:**
- Username & Profile
- Follower Count
- Total Likes
- Total Video Views
- Video Count
- Engagement Rate
- Audience Demographics (limited)
- Top Videos

**API Endpoints:**
- `GET /user/info` - User profile
- `GET /video/list` - Video list
- `GET /video/query` - Video details & stats

---

## 3. Account Verification System

### Verification Levels

**Level 1: Email Verified** ✓
- Default for all users
- Email verification required

**Level 2: Profile Completed** ✓✓
- Profile photo uploaded
- Bio/description filled
- Primary platform selected

**Level 3: Social Connected** ✓✓✓
- At least 1 social account connected
- Minimum follower threshold met (e.g., 1,000 followers)
- Account ownership verified

**Level 4: Fully Verified** ✓✓✓✓
- Multiple platforms connected
- Consistent profile across platforms
- Manual review completed (for high-tier influencers)

### Verification Badge Display
```
┌────────────────────────────┐
│  @influencer_name          │
│  ✓✓✓ Verified Influencer   │
│  📸 Instagram: 50K         │
│  📘 Facebook: 25K          │
│  🎵 TikTok: 100K           │
└────────────────────────────┘
```

---

## 4. Database Schema

### New Tables

#### `social_accounts`
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL, -- 'INSTAGRAM', 'FACEBOOK', 'TIKTOK'
  platform_user_id VARCHAR(255) NOT NULL,
  platform_username VARCHAR(255),
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  verification_level VARCHAR(20), -- 'BASIC', 'VERIFIED', 'FEATURED'
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, platform_user_id)
);
```

#### `social_metrics`
```sql
CREATE TABLE social_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2), -- percentage (e.g., 3.45)
  avg_likes INTEGER DEFAULT 0,
  avg_comments INTEGER DEFAULT 0,
  avg_views INTEGER DEFAULT 0,
  audience_demographics JSONB, -- age, gender, location data
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `social_audience_insights`
```sql
CREATE TABLE social_audience_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  insight_type VARCHAR(50), -- 'AGE', 'GENDER', 'LOCATION', 'INTERESTS'
  insight_data JSONB, -- { "18-24": 35, "25-34": 45, ... }
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Technical Implementation

### Backend Architecture

#### New Modules
```
packages/backend/src/modules/
├── social-integrations/
│   ├── social-integrations.module.ts
│   ├── social-integrations.controller.ts
│   ├── social-integrations.service.ts
│   ├── entities/
│   │   ├── social-account.entity.ts
│   │   ├── social-metrics.entity.ts
│   │   └── social-audience-insights.entity.ts
│   ├── dto/
│   │   ├── connect-account.dto.ts
│   │   └── sync-metrics.dto.ts
│   ├── strategies/
│   │   ├── instagram.strategy.ts
│   │   ├── facebook.strategy.ts
│   │   └── tiktok.strategy.ts
│   └── guards/
│       └── social-verified.guard.ts
```

#### API Endpoints
```typescript
// Connect social accounts
POST   /api/v1/social/connect/instagram
POST   /api/v1/social/connect/facebook
POST   /api/v1/social/connect/tiktok

// OAuth callbacks
GET    /api/v1/social/callback/instagram
GET    /api/v1/social/callback/facebook
GET    /api/v1/social/callback/tiktok

// Manage connections
GET    /api/v1/social/accounts
DELETE /api/v1/social/accounts/:id
POST   /api/v1/social/accounts/:id/refresh
POST   /api/v1/social/accounts/:id/sync

// Metrics
GET    /api/v1/social/accounts/:id/metrics
GET    /api/v1/social/accounts/:id/insights

// Verification
POST   /api/v1/social/accounts/:id/verify
```

### Environment Variables Needed
```env
# Instagram
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/v1/social/callback/instagram

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/v1/social/callback/facebook

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/v1/social/callback/tiktok

# Encryption
SOCIAL_TOKEN_ENCRYPTION_KEY=your_32_byte_key
```

---

## 6. Frontend Components

### New Pages & Components

#### `/influencer/settings/social-accounts`
- Connected Accounts List
- Connect New Account Buttons
- Account Metrics Overview
- Sync Status & Last Updated

#### Components
```typescript
// packages/web/components/social/
├── ConnectAccountButton.tsx
├── SocialAccountCard.tsx
├── SocialMetricsDisplay.tsx
├── AudienceInsightsChart.tsx
├── VerificationBadge.tsx
└── SyncStatusIndicator.tsx
```

#### Profile Display Enhancement
```typescript
// Show verification badge & metrics on profile
<InfluencerProfile>
  <VerificationBadge level={influencer.verification_level} />
  <SocialMetrics accounts={influencer.social_accounts} />
  <AudienceInsights insights={aggregatedInsights} />
</InfluencerProfile>
```

---

## 7. OAuth Flow Implementation

### Instagram OAuth Example
```typescript
// 1. Generate authorization URL
const authUrl = `https://api.instagram.com/oauth/authorize
  ?client_id=${INSTAGRAM_APP_ID}
  &redirect_uri=${INSTAGRAM_REDIRECT_URI}
  &scope=user_profile,user_media,instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish
  &response_type=code`;

// 2. User authorizes → redirect to callback

// 3. Exchange code for access token
const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
  client_id: INSTAGRAM_APP_ID,
  client_secret: INSTAGRAM_APP_SECRET,
  grant_type: 'authorization_code',
  redirect_uri: INSTAGRAM_REDIRECT_URI,
  code: authCode,
});

// 4. Exchange short-lived token for long-lived token
const longLivedToken = await axios.get(
  `https://graph.instagram.com/access_token
   ?grant_type=ig_exchange_token
   &client_secret=${INSTAGRAM_APP_SECRET}
   &access_token=${shortLivedToken}`
);

// 5. Store encrypted token in database
await socialAccountsRepository.save({
  influencer_id: userId,
  platform: 'INSTAGRAM',
  platform_user_id: userProfile.id,
  platform_username: userProfile.username,
  access_token: encrypt(longLivedToken),
  token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
});
```

---

## 8. Data Sync Strategy

### Sync Frequency
- **Real-time**: On-demand sync when user clicks "Refresh"
- **Scheduled**: Daily cron job at 2 AM UTC for all connected accounts
- **Event-based**: After connecting new account
- **Manual**: Brands can request fresh data before campaign invitation

### Sync Implementation
```typescript
@Cron('0 2 * * *') // Daily at 2 AM UTC
async syncAllAccounts() {
  const accounts = await this.socialAccountsRepository.find({
    where: { is_verified: true },
  });

  for (const account of accounts) {
    try {
      await this.syncAccountMetrics(account.id);
    } catch (error) {
      // Log error, mark account for review if token expired
      if (error.code === 'TOKEN_EXPIRED') {
        await this.markAccountForReauth(account.id);
      }
    }
  }
}

async syncAccountMetrics(accountId: string) {
  const account = await this.findAccount(accountId);
  const strategy = this.getStrategy(account.platform);

  // Fetch latest metrics
  const metrics = await strategy.fetchMetrics(account.access_token);
  const insights = await strategy.fetchInsights(account.access_token);

  // Save to database
  await this.socialMetricsRepository.save({
    social_account_id: accountId,
    ...metrics,
    audience_demographics: insights,
    synced_at: new Date(),
  });

  // Update last_synced_at
  await this.socialAccountsRepository.update(accountId, {
    last_synced_at: new Date(),
  });
}
```

---

## 9. Security Considerations

### Token Encryption
- Use AES-256-GCM encryption for storing access tokens
- Store encryption key in environment variables (not in code)
- Rotate encryption keys periodically

### Token Refresh
- Implement automatic token refresh before expiration
- Handle token expiration gracefully
- Notify user if re-authentication required

### Rate Limiting
- Respect platform API rate limits
- Implement exponential backoff for failed requests
- Cache frequently accessed data

### Permissions & Scopes
- Request minimal required permissions
- Clearly explain what data will be accessed
- Allow users to revoke access anytime

---

## 10. Brand-Facing Features

### Enhanced Influencer Discovery
Brands can filter influencers by:
- Verified accounts only
- Minimum follower count per platform
- Engagement rate thresholds
- Audience demographics match
- Platform preference (Instagram-focused, TikTok-focused, etc.)

### Influencer Profile Display
```typescript
<InfluencerCard>
  <VerificationBadges />
  <SocialStats>
    Instagram: 50K followers • 3.2% engagement
    TikTok: 100K followers • 5.8% engagement
  </SocialStats>
  <AudienceMatch>
    ✓ 75% match with your target audience
    ✓ US-based followers: 60%
    ✓ Age 25-34: 45%
  </AudienceMatch>
</InfluencerCard>
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema & migrations
- [ ] Social accounts entity & repository
- [ ] Basic CRUD endpoints
- [ ] Frontend: Settings page skeleton

### Phase 2: Instagram Integration (Week 3-4)
- [ ] Instagram OAuth flow
- [ ] Fetch & store basic profile data
- [ ] Fetch & store follower metrics
- [ ] Display metrics on influencer profile
- [ ] Daily sync cron job

### Phase 3: Facebook Integration (Week 5)
- [ ] Facebook OAuth flow
- [ ] Fetch & store page data
- [ ] Aggregate metrics across platforms

### Phase 4: TikTok Integration (Week 6)
- [ ] TikTok OAuth flow
- [ ] Fetch & store creator data
- [ ] Multi-platform metrics dashboard

### Phase 5: Verification System (Week 7)
- [ ] Verification levels logic
- [ ] Verification badges UI
- [ ] Brand filters for verified influencers
- [ ] Automated verification checks

### Phase 6: Audience Insights (Week 8)
- [ ] Fetch audience demographics
- [ ] Store insights data
- [ ] Charts & visualizations
- [ ] Audience matching algorithm for brands

### Phase 7: Polish & Testing (Week 9-10)
- [ ] Error handling improvements
- [ ] Token refresh automation
- [ ] Rate limiting implementation
- [ ] E2E testing
- [ ] Security audit
- [ ] Documentation

---

## 12. Third-Party API Documentation

### Required Reading
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [TikTok for Developers](https://developers.tiktok.com/)

### App Registration Required
1. **Meta for Developers**
   - Create app at https://developers.facebook.com
   - Add Instagram Graph API product
   - Submit for App Review for advanced permissions
   - Business verification required for production

2. **TikTok for Developers**
   - Register at https://developers.tiktok.com
   - Create app
   - Apply for Login Kit and Data Portability API access
   - Review process can take 1-2 weeks

---

## 13. Metrics & Success Criteria

### Key Performance Indicators
- **Adoption Rate**: % of influencers with ≥1 connected account
- **Verification Rate**: % of influencers achieving Level 3+ verification
- **Sync Success Rate**: % of successful daily syncs
- **Data Freshness**: Average time since last sync
- **Brand Usage**: % of brands filtering by verified influencers

### Success Targets (6 months post-launch)
- 70%+ influencers connect at least one account
- 50%+ achieve verified status
- 95%+ sync success rate
- 80%+ of brands use verification filters

---

## 14. Risks & Mitigations

### Risk 1: API Changes
**Risk**: Platforms change API without notice
**Mitigation**:
- Subscribe to developer newsletters
- Implement versioned API clients
- Monitor error rates closely
- Have fallback to manual input

### Risk 2: Token Expiration
**Risk**: Tokens expire, breaking sync
**Mitigation**:
- Automated token refresh
- Email notifications before expiration
- Clear re-authorization flow

### Risk 3: Rate Limits
**Risk**: Hit API rate limits during growth
**Mitigation**:
- Implement caching
- Stagger sync times
- Upgrade to business API tiers

### Risk 4: Privacy Concerns
**Risk**: Users worried about data access
**Mitigation**:
- Transparent privacy policy
- Clear permission explanations
- Easy disconnect option
- Minimal data retention

---

## 15. Future Enhancements

### Advanced Features (Post-MVP)
- **Content Performance**: Track individual posts/videos
- **Hashtag Analysis**: Most effective hashtags
- **Posting Patterns**: Optimal posting times
- **Competitor Insights**: Compare with similar influencers
- **Growth Tracking**: Historical follower growth charts
- **Fake Follower Detection**: Analyze follower quality
- **Brand Mentions**: Track brand collaborations
- **Story Analytics**: Instagram/Facebook stories metrics

### Additional Platforms
- YouTube
- Twitter/X
- LinkedIn
- Pinterest
- Snapchat

---

## 16. Estimated Effort

### Development Time
- Backend Development: 6 weeks
- Frontend Development: 4 weeks
- Testing & QA: 2 weeks
- **Total: 12 weeks** (with 1 full-time developer)

### Resources Required
- 1 Full-stack Developer
- 1 QA Engineer (part-time)
- Access to Meta & TikTok developer platforms
- Business verification for production APIs

---

## Conclusion

This social media integration feature will:
✅ Increase platform credibility through verified accounts
✅ Provide brands with better influencer discovery
✅ Automate manual data entry for influencers
✅ Enable data-driven campaign decisions
✅ Differentiate the platform from competitors

**Recommended Start Date**: Immediately after messaging system is stable
**Priority**: HIGH - Critical for influencer platform success
