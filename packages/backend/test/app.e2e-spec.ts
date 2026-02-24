import * as dotenv from 'dotenv';
// Load test environment variables first
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Influencer Platform E2E Tests', () => {
  let app: INestApplication;
  let authTokenBrand: string;
  let authTokenInfluencer: string;
  let brandId: string;
  let influencerId: string;
  let productId: string;
  let trackingLinkId: string;
  let campaignId: string;
  let conversionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/v1/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('Authentication & User Management', () => {
    const brandUser = {
      email: `brand-${Date.now()}@test.com`,
      password: 'Test123!@#',
      role: 'BRAND',
      name: 'Test Brand',
    };

    const influencerUser = {
      email: `influencer-${Date.now()}@test.com`,
      password: 'Test123!@#',
      role: 'INFLUENCER',
      name: 'Test Influencer',
    };

    it('should register a brand user', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(brandUser)
        .expect(201);

      console.log('[TEST] Brand registration response:', JSON.stringify(res.body, null, 2));
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      authTokenBrand = res.body.data.access_token;

      // Get brand ID from profile endpoint since it's not in registration response
      if (res.body.data.user && res.body.data.user.brand) {
        brandId = res.body.data.user.brand.id;
      } else {
        // Fetch profile to get brand ID
        const profileRes = await request(app.getHttpServer())
          .get('/v1/auth/me')
          .set('Authorization', `Bearer ${authTokenBrand}`)
          .expect(200);
        brandId = profileRes.body.data.user.brand.id;
      }
      console.log('[TEST] Brand ID:', brandId);
    });

    it('should register an influencer user', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(influencerUser)
        .expect(201);

      console.log('[TEST] Influencer registration response:', JSON.stringify(res.body, null, 2));
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      authTokenInfluencer = res.body.data.access_token;

      // Get influencer ID from profile endpoint since it's not in registration response
      if (res.body.data.user && res.body.data.user.influencer) {
        influencerId = res.body.data.user.influencer.id;
      } else {
        // Fetch profile to get influencer ID
        const profileRes = await request(app.getHttpServer())
          .get('/v1/auth/me')
          .set('Authorization', `Bearer ${authTokenInfluencer}`)
          .expect(200);
        influencerId = profileRes.body.data.user.influencer.id;
      }
      console.log('[TEST] Influencer ID:', influencerId);
    });

    it('should login with brand credentials', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: brandUser.email,
          password: brandUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('access_token');
        });
    });

    it('should get current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(brandUser.email);
    });
  });

  describe('Products Module', () => {
    const newProduct = {
      name: 'Test Product',
      description: 'A test product for e2e testing',
      price: 99.99,
      category: 'Electronics',
      product_url: 'https://example.com/products/test-product',
      image_url: 'https://example.com/product.jpg',
      status: 'ACTIVE',
    };

    it('should create a product (Brand)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .send(newProduct);

      console.log('[TEST] Product creation response:', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(newProduct.name);
      productId = res.body.data.id;
      console.log('[TEST] Product created with ID:', productId);
    });

    it('should get all products', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should get a single product', () => {
      console.log('[TEST] Getting product with ID:', productId);
      return request(app.getHttpServer())
        .get(`/v1/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(productId);
        });
    });

    it('should update a product (Brand)', () => {
      return request(app.getHttpServer())
        .put(`/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .send({ price: 89.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(parseFloat(res.body.data.price)).toBe(89.99);
        });
    });
  });

  describe('Campaigns Module', () => {
    const newCampaign = {
      name: 'Summer Sale Campaign',
      description: 'Test campaign for summer products',
      commission_rate: 15.0,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 5000,
    };

    it('should create a campaign (Brand)', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/campaigns')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .send(newCampaign)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(newCampaign.name);
      campaignId = res.body.data.id;
    });

    it('should get brand campaigns', () => {
      return request(app.getHttpServer())
        .get('/v1/campaigns')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should activate a campaign', () => {
      return request(app.getHttpServer())
        .post(`/v1/campaigns/${campaignId}/activate`)
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('active');
        });
    });

    it('should get active campaigns (Influencer)', () => {
      return request(app.getHttpServer())
        .get('/v1/campaigns/active')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should get campaign statistics', () => {
      return request(app.getHttpServer())
        .get(`/v1/campaigns/${campaignId}/statistics`)
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('campaign_id');
        });
    });
  });

  describe('Tracking Module', () => {
    const newTrackingLink: any = {
      product_id: null, // Will be set in the test
      campaign_id: null,
      custom_code: `TEST-${Date.now()}`,
    };

    it('should create a tracking link (Influencer)', async () => {
      newTrackingLink.product_id = productId;
      newTrackingLink.campaign_id = campaignId;

      const res = await request(app.getHttpServer())
        .post('/v1/tracking/links')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .send(newTrackingLink)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('unique_code');
      expect(res.body.data).toHaveProperty('tracking_url');
      trackingLinkId = res.body.data.id;
      console.log('[TEST] Tracking link created with ID:', trackingLinkId);
    });

    it('should get influencer tracking links', () => {
      return request(app.getHttpServer())
        .get('/v1/tracking/links')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should get a single tracking link', () => {
      return request(app.getHttpServer())
        .get(`/v1/tracking/links/${trackingLinkId}`)
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(trackingLinkId);
        });
    });
  });

  describe('Analytics Module', () => {
    it('should get influencer dashboard', () => {
      return request(app.getHttpServer())
        .get('/v1/analytics/influencer/dashboard')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('total_clicks');
          expect(res.body.data).toHaveProperty('total_conversions');
          expect(res.body.data).toHaveProperty('total_commission');
        });
    });

    it('should get influencer earnings', () => {
      return request(app.getHttpServer())
        .get('/v1/analytics/influencer/earnings')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('total_commission');
        });
    });

    it('should get brand dashboard', () => {
      return request(app.getHttpServer())
        .get('/v1/analytics/brand/dashboard')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('total_clicks');
          expect(res.body.data).toHaveProperty('total_revenue');
        });
    });

    it('should get brand ROI', () => {
      return request(app.getHttpServer())
        .get('/v1/analytics/brand/roi')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('roi');
          expect(res.body.data).toHaveProperty('total_revenue');
        });
    });
  });

  describe('Payouts Module', () => {
    it('should get available balance (Influencer)', () => {
      return request(app.getHttpServer())
        .get('/v1/payouts/available-balance')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('available_balance');
        });
    });

    it('should get influencer payout statistics', () => {
      return request(app.getHttpServer())
        .get('/v1/payouts/my-stats')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('total_payouts');
          expect(res.body.data).toHaveProperty('available_balance');
        });
    });

    it('should get influencer payouts', () => {
      return request(app.getHttpServer())
        .get('/v1/payouts/my-payouts')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Authorization Tests', () => {
    it('should deny access without token', () => {
      return request(app.getHttpServer())
        .get('/v1/analytics/influencer/dashboard')
        .expect(401);
    });

    it('should deny access with invalid role (Influencer trying to create product)', () => {
      return request(app.getHttpServer())
        .post('/v1/products')
        .set('Authorization', `Bearer ${authTokenInfluencer}`)
        .send({
          name: 'Test',
          price: 10,
        })
        .expect(403);
    });

    it('should deny access with invalid role (Brand trying to create tracking link)', () => {
      return request(app.getHttpServer())
        .post('/v1/tracking/links')
        .set('Authorization', `Bearer ${authTokenBrand}`)
        .send({
          product_id: productId,
        })
        .expect(403);
    });
  });
});
