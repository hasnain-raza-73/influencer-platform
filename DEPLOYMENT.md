# Deployment Guide

> ⚠️ **OUTDATED**: This file contains AWS-specific deployment instructions.
>
> **For simpler, recommended production setup, see**: [`PRODUCTION.md`](./PRODUCTION.md)
>
> The recommended stack is:
> - **Database**: Supabase (managed PostgreSQL)
> - **Images**: Cloudinary (already set up)
> - **Backend**: Railway or Render
> - **Frontend**: Vercel
>
> This AWS guide is kept for reference but is not recommended for this project.

---

## Prerequisites (AWS Setup - Advanced)

- AWS Account with CLI configured
- Docker installed
- Node.js 18+ installed
- PostgreSQL client tools
- Domain name configured

## Environment Setup

### 1. AWS Resources

#### RDS PostgreSQL
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier influencer-platform-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name my-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --publicly-accessible false

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier influencer-platform-db \
  --query 'DBInstances[0].Endpoint.Address'
```

#### ElastiCache Redis
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id influencer-platform-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxx
```

#### S3 Buckets
```bash
# Create buckets
aws s3 mb s3://influencer-platform-products
aws s3 mb s3://influencer-platform-brands
aws s3 mb s3://influencer-platform-influencers

# Configure CORS
aws s3api put-bucket-cors \
  --bucket influencer-platform-products \
  --cors-configuration file://s3-cors.json

# s3-cors.json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

#### CloudFront CDN
```bash
# Create distribution for each S3 bucket
aws cloudfront create-distribution \
  --origin-domain-name influencer-platform-products.s3.amazonaws.com \
  --default-root-object index.html
```

### 2. Environment Variables

Create `.env.production`:
```bash
# App
NODE_ENV=production
PORT=3000
APP_URL=https://api.yourapp.com
FRONTEND_URL=https://yourapp.com

# Database
DATABASE_HOST=influencer-platform-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=admin
DATABASE_PASSWORD=<STRONG_PASSWORD>
DATABASE_SSL=true

# Redis
REDIS_HOST=influencer-platform-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379

# JWT
JWT_SECRET=<RANDOM_256_BIT_STRING>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<RANDOM_256_BIT_STRING>
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<SECRET_KEY>
S3_BUCKET_PRODUCTS=influencer-platform-products
S3_BUCKET_BRANDS=influencer-platform-brands
S3_BUCKET_INFLUENCERS=influencer-platform-influencers
CLOUDFRONT_URL=https://d1234567890.cloudfront.net

# OAuth
GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>
APPLE_CLIENT_ID=<APPLE_CLIENT_ID>
APPLE_TEAM_ID=<APPLE_TEAM_ID>
APPLE_KEY_ID=<APPLE_KEY_ID>
APPLE_PRIVATE_KEY=<APPLE_PRIVATE_KEY>

# FCM
FCM_SERVER_KEY=<FCM_SERVER_KEY>

# Email
SENDGRID_API_KEY=<SENDGRID_API_KEY>
FROM_EMAIL=noreply@yourapp.com

# Tracking
TRACKING_DOMAIN=track.yourapp.com
ATTRIBUTION_WINDOW_DAYS=30
```

## Docker Deployment

### 1. Build Images

```bash
# Build backend
cd packages/backend
docker build -t influencer-platform-backend:latest .

# Tag for ECR
docker tag influencer-platform-backend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/influencer-platform-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/influencer-platform-backend:latest
```

### 2. ECS Task Definition

```json
{
  "family": "influencer-platform-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/influencer-platform-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/influencer-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

### 3. ECS Service

```bash
# Create service
aws ecs create-service \
  --cluster influencer-platform-cluster \
  --service-name backend \
  --task-definition influencer-platform-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000"
```

## Database Migrations

### Production Migration

```bash
# Connect to production DB via bastion host
ssh -L 5432:influencer-platform-db.xxxxx.rds.amazonaws.com:5432 ec2-user@bastion-host

# Run migrations
npm run typeorm migration:run

# Or using Docker
docker run --rm \
  -e DATABASE_HOST=... \
  -e DATABASE_PASSWORD=... \
  influencer-platform-backend:latest \
  npm run typeorm migration:run
```

## Mobile App Deployment

### iOS (App Store)

```bash
cd packages/mobile

# 1. Update version in app.json
# 2. Build archive
npx react-native run-ios --configuration Release

# 3. Upload to App Store Connect via Xcode
# 4. Submit for review
```

### Android (Google Play)

```bash
cd packages/mobile/android

# 1. Generate release keystore (first time only)
keytool -genkey -v -keystore release.keystore \
  -alias release -keyalg RSA -keysize 2048 -validity 10000

# 2. Build release APK
./gradlew assembleRelease

# 3. Build App Bundle (recommended)
./gradlew bundleRelease

# 4. Upload to Google Play Console
# File: android/app/build/outputs/bundle/release/app-release.aab
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: influencer-platform-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd packages/backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster influencer-platform-cluster \
            --service backend \
            --force-new-deployment
```

## Monitoring & Logging

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/influencer-platform --follow

# Create metric filter for errors
aws logs put-metric-filter \
  --log-group-name /ecs/influencer-platform \
  --filter-name ErrorCount \
  --filter-pattern "[ERROR]" \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=InfluencerPlatform,metricValue=1
```

### CloudWatch Alarms

```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --alarm-description "Alert when error rate is high" \
  --metric-name ErrorCount \
  --namespace InfluencerPlatform \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:alerts
```

### Application Performance Monitoring

Install Sentry:

```bash
npm install --save @sentry/node @sentry/react-native
```

Configure in backend:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## SSL/TLS Certificates

### Using AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name api.yourapp.com \
  --subject-alternative-names track.yourapp.com \
  --validation-method DNS

# Attach to Load Balancer
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

## Backup Strategy

### Database Backups

```bash
# RDS automated backups (already configured)
# Retention: 7 days

# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier influencer-platform-db \
  --db-snapshot-identifier pre-deployment-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier influencer-platform-db-restored \
  --db-snapshot-identifier pre-deployment-20240209
```

### S3 Versioning

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket influencer-platform-products \
  --versioning-configuration Status=Enabled
```

## Scaling

### Auto Scaling

```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/influencer-platform-cluster/backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/influencer-platform-cluster/backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    '{"TargetValue":70.0,"PredefinedMetricSpecification":{"PredefinedMetricType":"ECSServiceAverageCPUUtilization"}}'
```

## Rollback Procedure

```bash
# 1. Identify last known good task definition
aws ecs list-task-definitions --family-prefix influencer-platform-backend

# 2. Update service to use previous version
aws ecs update-service \
  --cluster influencer-platform-cluster \
  --service backend \
  --task-definition influencer-platform-backend:PREVIOUS_VERSION

# 3. If database migration issue, rollback migration
npm run typeorm migration:revert
```

## Security Checklist

- [ ] All secrets in AWS Secrets Manager
- [ ] Database not publicly accessible
- [ ] Security groups properly configured
- [ ] SSL/TLS certificates active
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API keys rotated regularly
- [ ] CloudWatch alarms configured
- [ ] Backup strategy verified
- [ ] Logs retention configured
- [ ] IAM roles follow least privilege

## Post-Deployment Verification

```bash
# 1. Health check
curl https://api.yourapp.com/health

# 2. Test authentication
curl -X POST https://api.yourapp.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 3. Test tracking endpoint
curl https://track.yourapp.com/c/test123/prod456

# 4. Monitor logs for errors
aws logs tail /ecs/influencer-platform --follow

# 5. Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=backend \
  --start-time 2024-02-09T00:00:00Z \
  --end-time 2024-02-09T23:59:59Z \
  --period 3600 \
  --statistics Average
```
