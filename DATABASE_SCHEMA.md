# Database Schema

## Overview
PostgreSQL database with TypeORM for migrations and entity management.

## Entity Relationship Diagram

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  users  │───┬───│ brands  │───────│products │
└─────────┘   │   └─────────┘       └─────────┘
              │                           │
              │   ┌─────────────┐         │
              └───│ influencers │         │
                  └─────────────┘         │
                        │                 │
                        │                 │
                  ┌─────▼─────────────────▼───┐
                  │    tracking_links         │
                  └─────┬─────────────────────┘
                        │
                  ┌─────┴─────┬────────────┐
                  │           │            │
            ┌─────▼───┐ ┌─────▼──────┐ ┌──▼─────────┐
            │ clicks  │ │conversions │ │partnerships│
            └─────────┘ └────────────┘ └────────────┘
```

## Tables

### users
Core authentication and user data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('BRAND', 'INFLUENCER')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
  email_verified BOOLEAN DEFAULT FALSE,
  oauth_provider VARCHAR(50),  -- 'google', 'apple', null
  oauth_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

**TypeORM Entity:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'BRAND' | 'INFLUENCER';

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true })
  oauth_provider?: string;

  @Column({ nullable: true })
  oauth_id?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Brand, brand => brand.user)
  brand?: Brand;

  @OneToOne(() => Influencer, influencer => influencer.user)
  influencer?: Influencer;
}
```

### brands
Brand-specific profile and settings.

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  logo_url VARCHAR(500),
  description TEXT,
  default_commission_rate DECIMAL(5,4) DEFAULT 0.1000,  -- 10%
  api_key VARCHAR(64) UNIQUE NOT NULL,  -- For webhooks
  pixel_id VARCHAR(32) UNIQUE NOT NULL,
  integration_type VARCHAR(20) DEFAULT 'PIXEL' CHECK (integration_type IN ('PIXEL', 'WEBHOOK', 'API')),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_brands_api_key ON brands(api_key);
```

**TypeORM Entity:**
```typescript
@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.1 })
  default_commission_rate: number;

  @Column({ unique: true })
  api_key: string;

  @Column({ unique: true })
  pixel_id: string;

  @Column({ default: 'PIXEL' })
  integration_type: 'PIXEL' | 'WEBHOOK' | 'API';

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.brand)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Product, product => product.brand)
  products: Product[];
}
```

### influencers
Influencer profile and statistics.

```sql
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  social_instagram VARCHAR(255),
  social_tiktok VARCHAR(255),
  social_youtube VARCHAR(255),
  social_twitter VARCHAR(255),
  follower_count INTEGER DEFAULT 0,
  niche VARCHAR(100)[],  -- Array of niches
  rating DECIMAL(3,2) DEFAULT 0.00,  -- 0.00 to 5.00
  total_sales DECIMAL(12,2) DEFAULT 0.00,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_influencers_user_id ON influencers(user_id);
CREATE INDEX idx_influencers_niche ON influencers USING GIN(niche);
CREATE INDEX idx_influencers_rating ON influencers(rating DESC);
```

**TypeORM Entity:**
```typescript
@Entity('influencers')
export class Influencer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  display_name: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  social_instagram?: string;

  @Column({ nullable: true })
  social_tiktok?: string;

  @Column({ nullable: true })
  social_youtube?: string;

  @Column({ nullable: true })
  social_twitter?: string;

  @Column({ default: 0 })
  follower_count: number;

  @Column({ type: 'varchar', array: true, default: '{}' })
  niche: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_earnings: number;

  @Column({ default: 0 })
  total_clicks: number;

  @Column({ default: 0 })
  total_conversions: number;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.influencer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => TrackingLink, link => link.influencer)
  tracking_links: TrackingLink[];
}
```

### products
Products created by brands.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  commission_rate DECIMAL(5,4),  -- Overrides brand default if set
  product_url VARCHAR(500) NOT NULL,  -- Link to product on brand's site
  sku VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
```

**TypeORM Entity:**
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  commission_rate?: number;

  @Column()
  product_url: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Brand, brand => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => TrackingLink, link => link.product)
  tracking_links: TrackingLink[];
}
```

### tracking_links
Unique tracking links for influencer-product combinations.

```sql
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unique_code VARCHAR(32) UNIQUE NOT NULL,  -- abc123def456
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0.00,
  last_clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(influencer_id, product_id)  -- One link per influencer-product
);

CREATE INDEX idx_tracking_links_code ON tracking_links(unique_code);
CREATE INDEX idx_tracking_links_influencer ON tracking_links(influencer_id);
CREATE INDEX idx_tracking_links_product ON tracking_links(product_id);
```

**TypeORM Entity:**
```typescript
@Entity('tracking_links')
@Unique(['influencer_id', 'product_id'])
export class TrackingLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  influencer_id: string;

  @Column()
  product_id: string;

  @Column({ unique: true })
  unique_code: string;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_sales: number;

  @Column({ nullable: true })
  last_clicked_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Influencer, influencer => influencer.tracking_links)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Product, product => product.tracking_links)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Click, click => click.tracking_link)
  clicks_history: Click[];

  @OneToMany(() => Conversion, conversion => conversion.tracking_link)
  conversions_history: Conversion[];
}
```

### clicks
Individual click events (for detailed analytics).

```sql
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),  -- IPv6 compatible
  user_agent TEXT,
  referrer VARCHAR(500),
  country VARCHAR(2),  -- ISO country code
  device_type VARCHAR(20),  -- 'mobile', 'tablet', 'desktop'
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clicks_tracking_link ON clicks(tracking_link_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_ip ON clicks(ip_address, clicked_at);  -- For fraud detection
```

**TypeORM Entity:**
```typescript
@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_link_id: string;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  device_type?: string;

  @CreateDateColumn()
  clicked_at: Date;

  @ManyToOne(() => TrackingLink, link => link.clicks_history)
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;
}
```

### conversions
Successful conversions (purchases).

```sql
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id VARCHAR(255) NOT NULL,  -- Brand's order ID
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
  fraud_score INTEGER DEFAULT 0,  -- 0-100, higher = more suspicious
  fraud_notes TEXT,
  clicked_at TIMESTAMP NOT NULL,  -- When they clicked the link
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, order_id)  -- Prevent duplicate orders
);

CREATE INDEX idx_conversions_tracking_link ON conversions(tracking_link_id);
CREATE INDEX idx_conversions_influencer ON conversions(influencer_id, converted_at);
CREATE INDEX idx_conversions_brand ON conversions(brand_id, converted_at);
CREATE INDEX idx_conversions_order_id ON conversions(brand_id, order_id);
CREATE INDEX idx_conversions_status ON conversions(status);
```

**TypeORM Entity:**
```typescript
@Entity('conversions')
@Unique(['brand_id', 'order_id'])
export class Conversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_link_id: string;

  @Column()
  influencer_id: string;

  @Column()
  brand_id: string;

  @Column()
  product_id: string;

  @Column()
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  commission_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission_amount: number;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

  @Column({ default: 0 })
  fraud_score: number;

  @Column({ type: 'text', nullable: true })
  fraud_notes?: string;

  @Column()
  clicked_at: Date;

  @CreateDateColumn()
  converted_at: Date;

  @Column({ nullable: true })
  approved_at?: Date;

  @Column({ nullable: true })
  paid_at?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TrackingLink, link => link.conversions_history)
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

### partnerships
Direct partnerships between brands and influencers.

```sql
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,  -- Optional: specific product
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'PAUSED', 'ENDED', 'REJECTED')),
  commission_rate DECIMAL(5,4),  -- Optional: overrides all other rates
  terms TEXT,
  initiated_by VARCHAR(20) CHECK (initiated_by IN ('BRAND', 'INFLUENCER')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partnerships_brand ON partnerships(brand_id);
CREATE INDEX idx_partnerships_influencer ON partnerships(influencer_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
```

**TypeORM Entity:**
```typescript
@Entity('partnerships')
export class Partnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand_id: string;

  @Column()
  influencer_id: string;

  @Column({ nullable: true })
  product_id?: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'REJECTED';

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  commission_rate?: number;

  @Column({ type: 'text', nullable: true })
  terms?: string;

  @Column()
  initiated_by: 'BRAND' | 'INFLUENCER';

  @Column({ nullable: true })
  started_at?: Date;

  @Column({ nullable: true })
  ended_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
```

### analytics_cache
Pre-aggregated analytics for fast dashboard queries.

```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,  -- 'influencer', 'brand', 'product'
  entity_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL,  -- 'sales', 'clicks', 'earnings', etc.
  metric_value DECIMAL(12,2),
  period VARCHAR(20) NOT NULL,  -- 'day', 'week', 'month', 'year'
  period_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, metric_type, period, period_date)
);

CREATE INDEX idx_analytics_entity ON analytics_cache(entity_type, entity_id);
CREATE INDEX idx_analytics_period ON analytics_cache(period_date, period);
```

**TypeORM Entity:**
```typescript
@Entity('analytics_cache')
@Unique(['entity_type', 'entity_id', 'metric_type', 'period', 'period_date'])
export class AnalyticsCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entity_type: 'influencer' | 'brand' | 'product';

  @Column()
  entity_id: string;

  @Column()
  metric_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  metric_value: number;

  @Column()
  period: 'day' | 'week' | 'month' | 'year';

  @Column({ type: 'date' })
  period_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### notifications
Push notifications and email logs.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- 'NEW_SALE', 'PARTNERSHIP_REQUEST', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,  -- Additional data
  read BOOLEAN DEFAULT FALSE,
  sent_push BOOLEAN DEFAULT FALSE,
  sent_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
```

## Migrations

### Initial Migration
```typescript
// 001_initial_schema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (...)
    `);
    
    // Create brands table
    await queryRunner.query(`
      CREATE TABLE brands (...)
    `);
    
    // ... etc
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS analytics_cache CASCADE`);
    // ... etc
  }
}
```

### Running Migrations
```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

## Seed Data

### Development Seeds
```typescript
// seeds/dev.seed.ts
import { DataSource } from 'typeorm';

export async function seedDevelopment(dataSource: DataSource) {
  // Create test users
  const brandUser = await dataSource.getRepository(User).save({
    email: 'brand@test.com',
    password_hash: await hashPassword('password123'),
    role: 'BRAND',
    email_verified: true,
  });

  const influencerUser = await dataSource.getRepository(User).save({
    email: 'influencer@test.com',
    password_hash: await hashPassword('password123'),
    role: 'INFLUENCER',
    email_verified: true,
  });

  // Create brand profile
  const brand = await dataSource.getRepository(Brand).save({
    user_id: brandUser.id,
    company_name: 'Test Brand',
    website: 'https://testbrand.com',
    api_key: generateApiKey(),
    pixel_id: generatePixelId(),
  });

  // Create influencer profile
  const influencer = await dataSource.getRepository(Influencer).save({
    user_id: influencerUser.id,
    display_name: 'Test Influencer',
    follower_count: 10000,
    niche: ['fashion', 'lifestyle'],
  });

  // Create products
  const product = await dataSource.getRepository(Product).save({
    brand_id: brand.id,
    name: 'Test Product',
    price: 99.99,
    product_url: 'https://testbrand.com/product',
    status: 'ACTIVE',
  });

  console.log('Development data seeded successfully');
}
```

## Database Backup & Restore

### Backup
```bash
pg_dump -h localhost -U postgres -d influencer_platform > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d influencer_platform < backup.sql
```

## Performance Optimization

### Query Optimization Tips
1. Always use indexes for WHERE, JOIN, ORDER BY columns
2. Avoid SELECT * - specify columns
3. Use pagination (LIMIT/OFFSET)
4. Use appropriate data types
5. Analyze slow queries with EXPLAIN

### Regular Maintenance
```sql
-- Analyze tables for query planner
ANALYZE users;
ANALYZE conversions;

-- Vacuum to reclaim space
VACUUM ANALYZE;

-- Reindex if needed
REINDEX TABLE tracking_links;
```
