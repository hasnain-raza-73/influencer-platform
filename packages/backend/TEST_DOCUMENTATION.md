# Influencer Platform - Test Documentation

## Overview
This document describes the comprehensive test suite for the Influencer Platform backend API. The tests cover all major modules and ensure proper functionality, authentication, and authorization.

## Test Structure

### E2E (End-to-End) Tests
Location: `test/app.e2e-spec.ts`

The E2E tests simulate real user interactions with the API, testing the entire request-response cycle including:
- Authentication
- Authorization
- Database operations
- API responses

## Test Coverage

### 1. Health Check Tests
- **Purpose**: Verify the application is running and responding
- **Endpoints Tested**:
  - `GET /v1/health`
- **Validations**:
  - Returns 200 status code
  - Returns `{status: 'ok'}` response

### 2. Authentication & User Management Tests
- **Purpose**: Test user registration, login, and profile management
- **Endpoints Tested**:
  - `POST /v1/auth/register` - Register new users (Brand & Influencer)
  - `POST /v1/auth/login` - Login with credentials
  - `GET /v1/auth/me` - Get current user profile
- **Test Scenarios**:
  - Register a brand user
  - Register an influencer user
  - Login with valid credentials
  - Get authenticated user profile
- **Validations**:
  - JWT tokens are generated and returned
  - User profiles are created correctly
  - Brand and influencer IDs are assigned

### 3. Products Module Tests
- **Purpose**: Test product CRUD operations
- **Endpoints Tested**:
  - `POST /v1/products` - Create product (Brand only)
  - `GET /v1/products` - List all products
  - `GET /v1/products/:id` - Get single product
  - `PUT /v1/products/:id` - Update product (Brand only)
- **Test Scenarios**:
  - Create a product as brand
  - List all products (public)
  - Get specific product details
  - Update product information
- **Validations**:
  - Only brands can create/update products
  - Products are created with correct attributes
  - Price updates work correctly

### 4. Campaigns Module Tests
- **Purpose**: Test campaign lifecycle management
- **Endpoints Tested**:
  - `POST /v1/campaigns` - Create campaign (Brand)
  - `GET /v1/campaigns` - List brand campaigns
  - `POST /v1/campaigns/:id/activate` - Activate campaign
  - `GET /v1/campaigns/active` - Browse active campaigns (Influencer)
  - `GET /v1/campaigns/:id/statistics` - Get campaign stats
- **Test Scenarios**:
  - Create a marketing campaign
  - Activate the campaign
  - View active campaigns as influencer
  - Get campaign statistics
- **Validations**:
  - Campaign status transitions work correctly
  - Only brands can create campaigns
  - Influencers can browse active campaigns
  - Statistics are calculated properly

### 5. Tracking Module Tests
- **Purpose**: Test tracking link creation and management
- **Endpoints Tested**:
  - `POST /v1/tracking/links` - Create tracking link (Influencer)
  - `GET /v1/tracking/links` - List influencer's links
  - `GET /v1/tracking/links/:id` - Get single link details
- **Test Scenarios**:
  - Create tracking link for product + campaign
  - List all tracking links
  - Get tracking link details
- **Validations**:
  - Only influencers can create tracking links
  - Tracking codes are generated uniquely
  - Links are associated with correct product/campaign

### 6. Analytics Module Tests
- **Purpose**: Test analytics and dashboard endpoints
- **Endpoints Tested**:
  - `GET /v1/analytics/influencer/dashboard` - Influencer dashboard
  - `GET /v1/analytics/influencer/earnings` - Earnings summary
  - `GET /v1/analytics/brand/dashboard` - Brand dashboard
  - `GET /v1/analytics/brand/roi` - Brand ROI metrics
- **Test Scenarios**:
  - Get influencer performance metrics
  - View earnings breakdown
  - Get brand campaign performance
  - Calculate ROI
- **Validations**:
  - Correct metrics are returned (clicks, conversions, revenue)
  - Commission calculations are accurate
  - ROI calculations are correct

### 7. Payouts Module Tests
- **Purpose**: Test payout request and management
- **Endpoints Tested**:
  - `GET /v1/payouts/available-balance` - Check withdrawable balance
  - `GET /v1/payouts/my-stats` - Payout statistics
  - `GET /v1/payouts/my-payouts` - List payout history
- **Test Scenarios**:
  - Check available balance
  - View payout statistics
  - List payout history
- **Validations**:
  - Available balance is calculated correctly
  - Statistics include all payout statuses
  - Only influencer's own payouts are visible

### 8. Authorization Tests
- **Purpose**: Verify role-based access control
- **Test Scenarios**:
  - Access denied without authentication token
  - Influencer cannot create products (Brand-only)
  - Brand cannot create tracking links (Influencer-only)
- **Validations**:
  - 401 Unauthorized for missing tokens
  - 403 Forbidden for wrong roles
  - Proper role enforcement

## Running the Tests

### Prerequisites
```bash
# Ensure PostgreSQL is running
# Update .env.test with test database credentials
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run With Coverage
```bash
npm run test:cov
```

### Run in Watch Mode
```bash
npm run test:watch
```

## Test Data
The tests use dynamically generated test data to avoid conflicts:
- Timestamps are appended to emails
- Unique tracking codes are generated
- Test entities are created in a specific order to maintain relationships

## Test Flow
1. **Setup**: Application bootstraps with test database
2. **Authentication**: Create test users (brand + influencer)
3. **Product Management**: Create test products
4. **Campaign Management**: Create and activate campaigns
5. **Tracking**: Create tracking links
6. **Analytics**: Verify metrics calculation
7. **Payouts**: Test balance and payout flows
8. **Authorization**: Verify access controls
9. **Cleanup**: Application closes, test data can be cleared

## Expected Results
All tests should pass with:
- ✅ Health check responds correctly
- ✅ Authentication works for both roles
- ✅ CRUD operations work for all modules
- ✅ Role-based access control is enforced
- ✅ Analytics calculations are accurate
- ✅ Proper HTTP status codes returned

## Test Maintenance
- Update tests when API endpoints change
- Add new test cases for new features
- Keep test data realistic but minimal
- Ensure tests are independent and can run in any order
- Clean up test data after runs (optional)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure test database exists

### Port Conflicts
- Make sure port 3000 is available
- Or configure different port in test setup

### Authentication Failures
- Verify JWT_SECRET is set in environment
- Check token expiration settings

## Future Enhancements
- [ ] Add performance benchmarking tests
- [ ] Add load testing
- [ ] Add mutation testing
- [ ] Add integration tests with external services (Shopify, payment processors)
- [ ] Add contract testing for API consumers
- [ ] Add visual regression tests for any HTML responses

## Test Metrics
- **Total Test Suites**: 1 E2E suite covering 8 modules
- **Total Test Cases**: 30+ individual test cases
- **Code Coverage Target**: >80% for services and controllers
- **Average Test Runtime**: ~10-15 seconds

## CI/CD Integration
These tests are designed to run in CI/CD pipelines:
```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Contact
For questions about the test suite, please refer to the main project documentation or contact the development team.
