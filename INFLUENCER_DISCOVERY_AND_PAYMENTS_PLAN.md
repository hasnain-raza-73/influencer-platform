# Influencer Discovery & Payment System Enhancement Plan

**Date**: March 4, 2026
**Status**: 📋 Planning Phase
**Priority**: High - Critical for platform growth and user satisfaction

---

## 📊 Current State Analysis

### Influencer Discovery (Current)
✅ Basic search by name/bio
✅ Filter by single niche
✅ Filter by minimum followers
✅ Filter by social platform and social followers
✅ Filter by verified accounts only
✅ Ordered by total_sales
✅ Social accounts integration with metrics

### Payment System (Current)
✅ Multiple payout methods (PayPal, Stripe, Bank Transfer, Wise)
✅ Status workflow (Pending → Processing → Completed/Failed)
✅ Payment details storage (JSONB)
✅ Conversion tracking in payouts
✅ Available balance calculation
✅ Multi-currency support
✅ Cancel pending payouts

---

## 🎯 Feature 1: Advanced Influencer Discovery System

### Phase 1A: Enhanced Search & Filters (Priority: High)

#### 1.1 Multi-Criteria Advanced Search
**Backend Changes:**

**File**: `packages/backend/src/modules/influencers/dto/influencer-search.dto.ts` (NEW)
```typescript
export class InfluencerSearchDto {
  // Text search
  search?: string;

  // Demographics
  niches?: string[]; // Multiple niches (OR logic)
  location?: string;
  country?: string;
  city?: string;
  language?: string[];

  // Audience size
  min_followers?: number;
  max_followers?: number;

  // Performance metrics
  min_engagement_rate?: number; // Percentage
  max_engagement_rate?: number;
  min_rating?: number; // 0-5 stars
  min_total_sales?: number;
  min_conversions?: number;

  // Social platforms
  platforms?: string[]; // ['instagram', 'tiktok', 'youtube']
  min_social_followers?: number;
  verified_only?: boolean;

  // Availability & status
  available_for_campaigns?: boolean; // Not in active campaigns
  campaign_type?: string; // 'AFFILIATE', 'SPONSORED', etc.

  // Sorting
  sort_by?: 'rating' | 'followers' | 'engagement' | 'total_sales' | 'recent';
  sort_order?: 'ASC' | 'DESC';

  // Pagination
  page?: number;
  limit?: number;
}
```

**File**: `packages/backend/src/modules/influencers/influencer.entity.ts` (UPDATE)
```typescript
// Add new fields to Influencer entity:
@Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
engagement_rate: number; // Average engagement rate across platforms

@Column({ type: 'varchar', length: 100, nullable: true })
country?: string;

@Column({ type: 'varchar', length: 100, nullable: true })
city?: string;

@Column({ type: 'varchar', array: true, default: '{}' })
languages: string[]; // ['English', 'Spanish']

@Column({ default: true })
available_for_campaigns: boolean;

@Column({ type: 'varchar', array: true, default: '{}' })
campaign_types_interested: string[]; // ['AFFILIATE', 'SPONSORED']

@Column({ default: false })
is_featured: boolean; // Featured influencers

@Column({ type: 'jsonb', nullable: true })
portfolio_urls?: {
  instagram_posts?: string[];
  tiktok_videos?: string[];
  youtube_videos?: string[];
};

@Column({ type: 'text', nullable: true })
media_kit_url?: string; // URL to uploaded media kit PDF
```

**File**: `packages/backend/src/modules/influencers/influencers.service.ts` (ENHANCE)
```typescript
async advancedSearch(searchDto: InfluencerSearchDto) {
  const qb = this.influencerRepository
    .createQueryBuilder('influencer')
    .leftJoinAndSelect('influencer.social_accounts', 'social_accounts')
    .leftJoinAndSelect('social_accounts.metrics', 'metrics')
    .leftJoinAndSelect('influencer.user', 'user')
    .where('influencer.status = :status', { status: 'ACTIVE' });

  // Text search
  if (searchDto.search) {
    qb.andWhere(
      '(influencer.display_name ILIKE :search OR influencer.bio ILIKE :search)',
      { search: `%${searchDto.search}%` }
    );
  }

  // Multiple niches (OR logic)
  if (searchDto.niches && searchDto.niches.length > 0) {
    qb.andWhere('influencer.niche && :niches', { niches: searchDto.niches });
  }

  // Location filters
  if (searchDto.country) {
    qb.andWhere('influencer.country = :country', { country: searchDto.country });
  }
  if (searchDto.city) {
    qb.andWhere('influencer.city = :city', { city: searchDto.city });
  }

  // Language filters
  if (searchDto.language && searchDto.language.length > 0) {
    qb.andWhere('influencer.languages && :languages', { languages: searchDto.language });
  }

  // Follower range
  if (searchDto.min_followers) {
    qb.andWhere('influencer.follower_count >= :min', { min: searchDto.min_followers });
  }
  if (searchDto.max_followers) {
    qb.andWhere('influencer.follower_count <= :max', { max: searchDto.max_followers });
  }

  // Engagement rate
  if (searchDto.min_engagement_rate) {
    qb.andWhere('influencer.engagement_rate >= :minEng', { minEng: searchDto.min_engagement_rate });
  }
  if (searchDto.max_engagement_rate) {
    qb.andWhere('influencer.engagement_rate <= :maxEng', { maxEng: searchDto.max_engagement_rate });
  }

  // Rating
  if (searchDto.min_rating) {
    qb.andWhere('influencer.rating >= :rating', { rating: searchDto.min_rating });
  }

  // Performance metrics
  if (searchDto.min_total_sales) {
    qb.andWhere('influencer.total_sales >= :sales', { sales: searchDto.min_total_sales });
  }
  if (searchDto.min_conversions) {
    qb.andWhere('influencer.total_conversions >= :conv', { conv: searchDto.min_conversions });
  }

  // Platform filters
  if (searchDto.platforms && searchDto.platforms.length > 0) {
    qb.andWhere('social_accounts.platform IN (:...platforms)', { platforms: searchDto.platforms });
  }

  // Verified only
  if (searchDto.verified_only) {
    qb.andWhere('social_accounts.is_verified = true');
  }

  // Availability
  if (searchDto.available_for_campaigns !== undefined) {
    qb.andWhere('influencer.available_for_campaigns = :available', {
      available: searchDto.available_for_campaigns
    });
  }

  // Campaign type interest
  if (searchDto.campaign_type) {
    qb.andWhere(':campaign_type = ANY(influencer.campaign_types_interested)', {
      campaign_type: searchDto.campaign_type
    });
  }

  // Sorting
  const sortBy = searchDto.sort_by || 'rating';
  const sortOrder = searchDto.sort_order || 'DESC';

  const sortFields = {
    rating: 'influencer.rating',
    followers: 'influencer.follower_count',
    engagement: 'influencer.engagement_rate',
    total_sales: 'influencer.total_sales',
    recent: 'influencer.created_at',
  };

  qb.orderBy(sortFields[sortBy], sortOrder);

  // Pagination
  const page = searchDto.page || 1;
  const limit = searchDto.limit || 20;
  qb.skip((page - 1) * limit).take(limit);

  const [influencers, total] = await qb.getManyAndCount();

  return {
    data: influencers,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
}
```

#### 1.2 Influencer Profiles & Portfolios
**Backend Changes:**

**File**: `packages/backend/src/modules/influencers/dto/update-influencer-profile.dto.ts` (NEW)
```typescript
export class UpdateInfluencerProfileDto {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  niches?: string[];
  country?: string;
  city?: string;
  languages?: string[];
  portfolio_urls?: {
    instagram_posts?: string[];
    tiktok_videos?: string[];
    youtube_videos?: string[];
  };
  media_kit_url?: string;
  available_for_campaigns?: boolean;
  campaign_types_interested?: string[];
}
```

**File**: `packages/backend/src/modules/influencers/influencers.controller.ts` (ADD)
```typescript
@Get('public/:id') // Public profile view
@HttpCode(HttpStatus.OK)
async getPublicProfile(@Param('id') id: string) {
  const profile = await this.influencersService.getPublicProfile(id);
  return { success: true, data: profile };
}

@Put('profile') // Influencer updates own profile
@Roles(UserRole.INFLUENCER)
@HttpCode(HttpStatus.OK)
async updateProfile(
  @CurrentUser() user: User,
  @Body() updateDto: UpdateInfluencerProfileDto
) {
  const updated = await this.influencersService.updateProfile(user.influencer.id, updateDto);
  return { success: true, data: updated };
}
```

**File**: `packages/backend/src/modules/influencers/influencers.service.ts` (ADD)
```typescript
async getPublicProfile(id: string) {
  const influencer = await this.influencerRepository.findOne({
    where: { id, status: InfluencerStatus.ACTIVE },
    relations: ['social_accounts', 'social_accounts.metrics'],
  });

  if (!influencer) {
    throw new NotFoundException('Influencer not found');
  }

  // Get recent campaigns (without sensitive data)
  const recentCampaigns = await this.getCampaignHistory(id);

  // Calculate performance metrics
  const performanceMetrics = {
    total_campaigns: recentCampaigns.length,
    average_conversion_rate: this.calculateAverageConversionRate(id),
    total_sales: influencer.total_sales,
    total_conversions: influencer.total_conversions,
    engagement_rate: influencer.engagement_rate,
    rating: influencer.rating,
  };

  return {
    ...influencer,
    user: undefined, // Don't expose user data
    performance_metrics: performanceMetrics,
    recent_campaigns: recentCampaigns,
  };
}
```

#### 1.3 AI-Powered Recommendations
**Backend Changes:**

**File**: `packages/backend/src/modules/influencers/influencers.service.ts` (ADD)
```typescript
async getRecommendedInfluencers(campaignId: string, limit: number = 10) {
  // Get campaign details
  const campaign = await this.campaignRepository.findOne({
    where: { id: campaignId },
    relations: ['brand'],
  });

  if (!campaign) {
    throw new NotFoundException('Campaign not found');
  }

  // Build recommendation query based on campaign criteria
  const qb = this.influencerRepository
    .createQueryBuilder('influencer')
    .leftJoinAndSelect('influencer.social_accounts', 'social_accounts')
    .where('influencer.status = :status', { status: 'ACTIVE' })
    .andWhere('influencer.available_for_campaigns = true');

  // Match niches
  if (campaign.target_niches && campaign.target_niches.length > 0) {
    qb.andWhere('influencer.niche && :niches', { niches: campaign.target_niches });
  }

  // Match follower range
  if (campaign.min_followers) {
    qb.andWhere('influencer.follower_count >= :min', { min: campaign.min_followers });
  }
  if (campaign.max_followers) {
    qb.andWhere('influencer.follower_count <= :max', { max: campaign.max_followers });
  }

  // Match location
  if (campaign.target_countries && campaign.target_countries.length > 0) {
    qb.andWhere('influencer.country IN (:...countries)', { countries: campaign.target_countries });
  }

  // Prioritize high performers
  qb.andWhere('influencer.rating >= 3.5')
    .andWhere('influencer.engagement_rate >= 2.0')
    .orderBy('influencer.rating', 'DESC')
    .addOrderBy('influencer.total_sales', 'DESC')
    .take(limit);

  const recommendations = await qb.getMany();

  return {
    campaign: { id: campaign.id, name: campaign.name },
    recommendations: recommendations.map(inf => ({
      ...inf,
      match_score: this.calculateMatchScore(inf, campaign),
    })),
  };
}

private calculateMatchScore(influencer: Influencer, campaign: Campaign): number {
  let score = 0;

  // Niche match (40 points)
  const nicheOverlap = influencer.niche.filter(n =>
    campaign.target_niches?.includes(n)
  ).length;
  score += (nicheOverlap / (campaign.target_niches?.length || 1)) * 40;

  // Performance (30 points)
  score += (Number(influencer.rating) / 5) * 30;

  // Engagement (20 points)
  const engagementScore = Math.min(Number(influencer.engagement_rate) / 10, 1);
  score += engagementScore * 20;

  // Sales history (10 points)
  const salesScore = Math.min(Number(influencer.total_sales) / 10000, 1);
  score += salesScore * 10;

  return Math.round(score);
}
```

---

### Phase 1B: Frontend Enhancements

#### 1.4 Advanced Search UI
**Frontend Changes:**

**File**: `packages/web/app/brand/influencers/page.tsx` (MAJOR UPDATE)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, SlidersHorizontal, Star, Users, TrendingUp,
  MapPin, Globe, Filter, X
} from 'lucide-react'
import { influencersService } from '@/services/influencers-service'

export default function BrandInfluencersPage() {
  const [influencers, setInfluencers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Search state
  const [search, setSearch] = useState('')
  const [niches, setNiches] = useState<string[]>([])
  const [minFollowers, setMinFollowers] = useState('')
  const [maxFollowers, setMaxFollowers] = useState('')
  const [minEngagement, setMinEngagement] = useState('')
  const [minRating, setMinRating] = useState('')
  const [country, setCountry] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'followers' | 'engagement'>('rating')

  // Available filter options
  const nicheOptions = [
    'Fashion', 'Beauty', 'Fitness', 'Gaming', 'Tech',
    'Food', 'Travel', 'Lifestyle', 'Business', 'Health'
  ]
  const platformOptions = ['instagram', 'tiktok', 'youtube', 'twitter']
  const followerRanges = [
    { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
    { label: 'Micro (10K-100K)', min: 10000, max: 100000 },
    { label: 'Mid (100K-500K)', min: 100000, max: 500000 },
    { label: 'Macro (500K-1M)', min: 500000, max: 1000000 },
    { label: 'Mega (1M+)', min: 1000000, max: null },
  ]

  const loadInfluencers = async () => {
    setIsLoading(true)
    try {
      const filters = {
        search: search || undefined,
        niches: niches.length > 0 ? niches : undefined,
        min_followers: minFollowers || undefined,
        max_followers: maxFollowers || undefined,
        min_engagement_rate: minEngagement || undefined,
        min_rating: minRating || undefined,
        country: country || undefined,
        platforms: platforms.length > 0 ? platforms : undefined,
        verified_only: verifiedOnly,
        sort_by: sortBy,
        sort_order: 'DESC',
      }
      const res = await influencersService.advancedSearch(filters)
      setInfluencers(res.data || [])
    } catch (err) {
      console.error('Failed to load influencers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInfluencers()
  }, [search, niches, minFollowers, maxFollowers, minEngagement, minRating, country, platforms, verifiedOnly, sortBy])

  const clearFilters = () => {
    setSearch('')
    setNiches([])
    setMinFollowers('')
    setMaxFollowers('')
    setMinEngagement('')
    setMinRating('')
    setCountry('')
    setPlatforms([])
    setVerifiedOnly(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Discover Influencers
        </h1>
        <p className="text-gray-600 mt-2">
          Find the perfect creators for your campaigns
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, bio, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(niches.length > 0 || platforms.length > 0 || minFollowers) && (
                <span className="ml-1 bg-primary-600 text-white rounded-full px-2 py-0.5 text-xs">
                  {[niches.length > 0, platforms.length > 0, minFollowers].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              {/* Niches */}
              <div>
                <label className="block text-sm font-medium mb-2">Niches</label>
                <div className="flex flex-wrap gap-2">
                  {nicheOptions.map(niche => (
                    <button
                      key={niche}
                      onClick={() => {
                        if (niches.includes(niche)) {
                          setNiches(niches.filter(n => n !== niche))
                        } else {
                          setNiches([...niches, niche])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        niches.includes(niche)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium mb-2">Social Platforms</label>
                <div className="flex gap-2">
                  {platformOptions.map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        if (platforms.includes(platform)) {
                          setPlatforms(platforms.filter(p => p !== platform))
                        } else {
                          setPlatforms([...platforms, platform])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        platforms.includes(platform)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follower Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Follower Range</label>
                <div className="flex flex-wrap gap-2">
                  {followerRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setMinFollowers(String(range.min))
                        setMaxFollowers(range.max ? String(range.max) : '')
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input
                    type="number"
                    placeholder="Min followers"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max followers"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(e.target.value)}
                  />
                </div>
              </div>

              {/* Performance Filters */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Engagement %</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 3.5"
                    value={minEngagement}
                    onChange={(e) => setMinEngagement(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Rating</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="5"
                    placeholder="e.g. 4.0"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input
                    placeholder="e.g. United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* Verified Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="verified" className="text-sm font-medium">
                  Show verified accounts only
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
                <Button onClick={loadInfluencers}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium">Sort by:</span>
            {[
              { value: 'rating', label: 'Rating', icon: Star },
              { value: 'followers', label: 'Followers', icon: Users },
              { value: 'engagement', label: 'Engagement', icon: TrendingUp },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : influencers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <p className="text-gray-500">No influencers found matching your criteria</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((inf: any) => (
            <InfluencerCard key={inf.id} influencer={inf} />
          ))}
        </div>
      )}
    </div>
  )
}

function InfluencerCard({ influencer }: { influencer: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-5">
        {/* Profile Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={influencer.avatar_url || '/default-avatar.png'}
            alt={influencer.display_name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {influencer.display_name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span>{influencer.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {influencer.bio || 'No bio available'}
        </p>

        {/* Niches */}
        <div className="flex flex-wrap gap-1 mb-3">
          {influencer.niche?.slice(0, 3).map((n: string) => (
            <span
              key={n}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {n}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-gray-500">Followers</span>
            <p className="font-semibold">{influencer.follower_count.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Engagement</span>
            <p className="font-semibold">{influencer.engagement_rate}%</p>
          </div>
          <div>
            <span className="text-gray-500">Total Sales</span>
            <p className="font-semibold">${influencer.total_sales.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Conversions</span>
            <p className="font-semibold">{influencer.total_conversions}</p>
          </div>
        </div>

        {/* Location */}
        {influencer.country && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{influencer.city ? `${influencer.city}, ` : ''}{influencer.country}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" size="sm">
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎯 Feature 2: Payment System Enhancements

### Phase 2A: Multiple Payment Methods Integration

#### 2.1 Stripe Connect Integration
**Backend Changes:**

**File**: `packages/backend/package.json` (ADD)
```json
{
  "dependencies": {
    "stripe": "^14.0.0"
  }
}
```

**File**: `packages/backend/src/modules/payouts/stripe.service.ts` (NEW)
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripePayoutService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    });
  }

  // Create connected account for influencer
  async createConnectedAccount(email: string, country: string = 'US') {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });
    return account;
  }

  // Generate onboarding link
  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink.url;
  }

  // Create payout transfer
  async createTransfer(
    connectedAccountId: string,
    amount: number,
    currency: string = 'usd',
    description?: string,
  ) {
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: connectedAccountId,
      description,
    });
    return transfer;
  }

  // Check account status
  async getAccountStatus(accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    };
  }

  // Retrieve transfer details
  async getTransfer(transferId: string) {
    return await this.stripe.transfers.retrieve(transferId);
  }
}
```

#### 2.2 PayPal Integration
**File**: `packages/backend/src/modules/payouts/paypal.service.ts` (NEW)
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalPayoutService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor(private configService: ConfigService) {
    const isProduction = configService.get('NODE_ENV') === 'production';
    this.baseUrl = isProduction
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
    this.clientId = configService.get('PAYPAL_CLIENT_ID');
    this.clientSecret = configService.get('PAYPAL_CLIENT_SECRET');
  }

  // Get OAuth token
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  }

  // Create batch payout
  async createPayout(
    recipientEmail: string,
    amount: number,
    currency: string = 'USD',
    note?: string,
  ) {
    const accessToken = await this.getAccessToken();

    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: `payout_${Date.now()}`,
        email_subject: 'You have received a payout!',
        email_message: note || 'You have received a payout from our platform.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency,
          },
          receiver: recipientEmail,
          note: note || 'Influencer payout',
        },
      ],
    };

    const response = await axios.post(
      `${this.baseUrl}/v1/payments/payouts`,
      payoutBatch,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      batch_id: response.data.batch_header.payout_batch_id,
      batch_status: response.data.batch_header.batch_status,
    };
  }

  // Get payout status
  async getPayoutStatus(payoutBatchId: string) {
    const accessToken = await this.getAccessToken();

    const response = await axios.get(
      `${this.baseUrl}/v1/payments/payouts/${payoutBatchId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }
}
```

#### 2.3 Enhanced Payout Service
**File**: `packages/backend/src/modules/influencers/influencer.entity.ts` (ADD)
```typescript
// Add payment settings to Influencer entity
@Column({ type: 'jsonb', nullable: true })
payment_settings?: {
  stripe_account_id?: string;
  stripe_onboarding_completed?: boolean;
  paypal_email?: string;
  bank_details?: {
    account_holder: string;
    account_number: string;
    bank_name: string;
    routing_number: string;
    swift_code?: string;
    iban?: string;
  };
  preferred_method?: 'stripe' | 'paypal' | 'bank_transfer';
  minimum_payout_amount?: number; // Minimum amount for auto-payouts
};

@Column({ default: false })
auto_payout_enabled: boolean;

@Column({ type: 'varchar', length: 20, default: 'monthly' })
payout_frequency: string; // 'weekly', 'bi-weekly', 'monthly'
```

**File**: `packages/backend/src/modules/payouts/payouts.service.ts` (ENHANCE)
```typescript
async processStripePayouts() {
  // Get all pending payouts with Stripe method
  const pendingPayouts = await this.payoutRepository.find({
    where: {
      status: PayoutStatus.PENDING,
      payout_method: PayoutMethod.STRIPE,
    },
    relations: ['influencer'],
  });

  for (const payout of pendingPayouts) {
    try {
      const stripeAccountId = payout.influencer.payment_settings?.stripe_account_id;

      if (!stripeAccountId) {
        await this.fail(payout.id, 'No Stripe account connected');
        continue;
      }

      // Mark as processing
      await this.process(payout.id);

      // Create transfer
      const transfer = await this.stripeService.createTransfer(
        stripeAccountId,
        Number(payout.amount),
        payout.currency,
        `Payout for ${payout.conversion_ids?.length || 0} conversions`,
      );

      // Mark as completed
      await this.complete(payout.id, transfer.id);
    } catch (error) {
      await this.fail(payout.id, error.message);
    }
  }
}

async processPayPalPayouts() {
  const pendingPayouts = await this.payoutRepository.find({
    where: {
      status: PayoutStatus.PENDING,
      payout_method: PayoutMethod.PAYPAL,
    },
    relations: ['influencer'],
  });

  for (const payout of pendingPayouts) {
    try {
      const paypalEmail = payout.influencer.payment_settings?.paypal_email;

      if (!paypalEmail) {
        await this.fail(payout.id, 'No PayPal email configured');
        continue;
      }

      await this.process(payout.id);

      const result = await this.paypalService.createPayout(
        paypalEmail,
        Number(payout.amount),
        payout.currency,
        payout.notes,
      );

      await this.complete(payout.id, result.batch_id);
    } catch (error) {
      await this.fail(payout.id, error.message);
    }
  }
}

// Scheduled auto-payouts
async processScheduledPayouts() {
  const influencers = await this.influencerRepository.find({
    where: { auto_payout_enabled: true },
  });

  for (const influencer of influencers) {
    const availableBalance = await this.getAvailableBalance(influencer.id);
    const minAmount = influencer.payment_settings?.minimum_payout_amount || 50;

    if (availableBalance >= minAmount) {
      // Create automatic payout
      await this.create(influencer.id, {
        amount: availableBalance,
        payout_method: influencer.payment_settings?.preferred_method || PayoutMethod.STRIPE,
        currency: 'USD',
        notes: 'Automatic scheduled payout',
      });
    }
  }
}
```

#### 2.4 Frontend Payment Settings
**File**: `packages/web/app/influencer/settings/payment/page.tsx` (NEW)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, DollarSign, Building, CheckCircle } from 'lucide-react'
import { influencersService } from '@/services/influencers-service'

export default function PaymentSettingsPage() {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'bank'>('stripe')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [stripeConnected, setStripeConnected] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
  })
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false)
  const [minPayoutAmount, setMinPayoutAmount] = useState('50')
  const [payoutFrequency, setPayoutFrequency] = useState('monthly')

  const handleStripeConnect = async () => {
    // Redirect to Stripe Connect onboarding
    const link = await influencersService.getStripeOnboardingLink()
    window.location.href = link
  }

  const handleSaveSettings = async () => {
    await influencersService.updatePaymentSettings({
      preferred_method: paymentMethod,
      paypal_email: paypalEmail,
      bank_details: bankDetails,
      auto_payout_enabled: autoPayoutEnabled,
      minimum_payout_amount: parseFloat(minPayoutAmount),
      payout_frequency: payoutFrequency,
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>

      {/* Payment Method Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payout Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Stripe */}
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'stripe'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mb-2 text-primary-600" />
              <h3 className="font-semibold mb-1">Stripe</h3>
              <p className="text-sm text-gray-600">Fast & secure</p>
            </button>

            {/* PayPal */}
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'paypal'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-8 h-8 mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">PayPal</h3>
              <p className="text-sm text-gray-600">Instant transfers</p>
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'bank'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-8 h-8 mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Bank Transfer</h3>
              <p className="text-sm text-gray-600">Direct to bank</p>
            </button>
          </div>

          {/* Method-specific forms */}
          {paymentMethod === 'stripe' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {stripeConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Stripe account connected</span>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect your Stripe account to receive instant payouts
                  </p>
                  <Button onClick={handleStripeConnect}>
                    Connect Stripe Account
                  </Button>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">PayPal Email</label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
              />
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                <Input
                  value={bankDetails.account_holder}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Number</label>
                  <Input
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Routing Number</label>
                  <Input
                    value={bankDetails.routing_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, routing_number: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <Input
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Payout Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Automatic Payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto-payout"
              checked={autoPayoutEnabled}
              onChange={(e) => setAutoPayoutEnabled(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <label htmlFor="auto-payout" className="font-medium">
              Enable automatic payouts
            </label>
          </div>

          {autoPayoutEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Payout Amount (USD)
                </label>
                <Input
                  type="number"
                  value={minPayoutAmount}
                  onChange={(e) => setMinPayoutAmount(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Payouts will only be processed when your balance reaches this amount
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payout Frequency</label>
                <select
                  value={payoutFrequency}
                  onChange={(e) => setPayoutFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} className="w-full">
        Save Payment Settings
      </Button>
    </div>
  )
}
```

---

## 🗓️ Implementation Timeline

### Week 1: Influencer Discovery Foundation
- [ ] Day 1-2: Database migrations for new influencer fields
- [ ] Day 3-4: Backend advanced search implementation
- [ ] Day 5: Frontend advanced filters UI

### Week 2: Influencer Profiles & AI Recommendations
- [ ] Day 1-2: Public profile endpoint and UI
- [ ] Day 3-4: AI recommendation algorithm
- [ ] Day 5: Testing and refinements

### Week 3: Payment Infrastructure
- [ ] Day 1-2: Stripe Connect integration
- [ ] Day 3-4: PayPal integration
- [ ] Day 5: Payment settings database changes

### Week 4: Payment UI & Automation
- [ ] Day 1-2: Frontend payment settings page
- [ ] Day 3-4: Auto-payout scheduling system
- [ ] Day 5: End-to-end testing

---

## 📊 Success Metrics

### Influencer Discovery
- **Search Performance**: < 500ms average response time
- **Match Accuracy**: > 80% relevant results
- **User Engagement**: > 50% of brands use advanced filters
- **Conversion**: > 30% of searches result in campaign invitations

### Payment System
- **Processing Time**: < 24 hours for Stripe/PayPal, < 3 days for bank
- **Success Rate**: > 95% successful payouts
- **User Satisfaction**: > 90% positive feedback on payment experience
- **Automation**: > 60% of influencers enable auto-payouts

---

## 🔒 Security Considerations

### Payment Security
- ✅ Never store raw bank account numbers in plain text
- ✅ Use Stripe/PayPal's tokenization for sensitive data
- ✅ Implement encryption at rest for payment_details JSONB
- ✅ Audit logging for all payout transactions
- ✅ Two-factor authentication for payment method changes
- ✅ Webhook verification for payment status updates

### Data Privacy
- ✅ GDPR compliance for payment data retention
- ✅ PCI DSS compliance for card data (via Stripe)
- ✅ Separate database encryption keys per environment
- ✅ Regular security audits

---

## 💰 Cost Estimates

### Payment Processing Fees
- **Stripe**: 2.9% + $0.30 per transaction
- **PayPal**: 2.9% + $0.30 per transaction (USA)
- **Bank Transfer**: ~$25-30 per transfer (manual)
- **Recommended**: Stripe for < $5,000, bank for > $5,000

### Infrastructure
- **Additional Database Storage**: ~10GB for payment data
- **API Costs**: Stripe/PayPal API calls (included in fees)
- **Background Jobs**: Need task queue (Bull/Redis)

---

## 🚀 Next Steps

1. **Review this plan** - Confirm scope and priorities
2. **Set environment variables** - STRIPE_SECRET_KEY, PAYPAL credentials
3. **Database migrations** - Create migration files
4. **Start implementation** - Begin with Phase 1A

**Ready to proceed?** Let me know which phase you'd like to start with!
