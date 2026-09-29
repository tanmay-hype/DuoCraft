# DuoCraft — Feature Completion Checklist

Legend:
- ✅ Completed
- 🟡 Partially completed / needs hardening
- ⬜ Not completed yet

## 1. Project Foundation

| Feature | Status |
|---|---|
| Next.js frontend | ✅ |
| FastAPI backend | ✅ |
| PostgreSQL database | ✅ |
| Redis infrastructure | ✅ |
| Docker Compose development environment | ✅ |
| Local frontend development outside Docker | ✅ |
| Backend hot reload | ✅ |
| Environment/config management | ✅ |
| Alembic migrations | ✅ |
| Backend linting with Ruff | ✅ |
| Basic health endpoint | ✅ |
| Frontend ↔ backend CORS | ✅ |

## 2. UI / Design System

| Feature | Status |
|---|---|
| DuoCraft branding | ✅ |
| Custom typography | ✅ |
| Warm cream / rose / terracotta visual system | ✅ |
| Global CSS design tokens | ✅ |
| Navbar | ✅ |
| Footer | ✅ |
| Logo component | ✅ |
| Responsive catalog UI | ✅ |
| Responsive homepage | ✅ |
| Reduced-motion support | ✅ |
| Product cards | ✅ |
| Product badges | ✅ |
| Price tags | ✅ |
| Product filtering | ✅ |
| Homepage hero | ✅ |
| Featured gifts section | ✅ |
| How-it-works section | ✅ |
| Why DuoCraft section | ✅ |
| Final CTA | ✅ |

## 3. Gift Catalog

Current catalog:
- Proposal
- Birthday
- Apology
- Anniversary
- Love Letter
- Photo Puzzle
- Scrapbook
- Thank You
- Friendship
- Mother's Day

| Feature | Status |
|---|---|
| Product database model | ✅ |
| Product migrations | ✅ |
| Product seed data | ✅ |
| Product pricing | ✅ |
| Sale pricing | ✅ |
| Product slugs | ✅ |
| Product template keys | ✅ |
| Featured products | ✅ |
| Add-on database model | ✅ |
| Add-on seed data | ✅ |
| GET `/products` | ✅ |
| GET `/products/{slug}` | ✅ |
| GET `/addons` | ✅ |
| Server-side authoritative pricing | ✅ |
| Catalog frontend | ✅ |
| Catalog filtering | ✅ |
| Admin product API | ✅ |
| Admin add-on API | ✅ |
| Admin product editor | ✅ |
| Admin add-on editor | ✅ |
| Human authentication for admin | ⬜ |
| Production-grade admin authorization | ⬜ |

## 4. Draft System

| Feature | Status |
|---|---|
| Draft database model | ✅ |
| Draft UUIDs | ✅ |
| Draft ownership token | ✅ |
| SHA-256 owner-token hashing | ✅ |
| HttpOnly ownership cookie | ✅ |
| Draft creation/retrieval/update | ✅ |
| Draft expiration infrastructure | ✅ |
| Unauthorized draft protection | ✅ |
| Draft persistence | ✅ |
| Draft autosave | ✅ |
| Server-side personalization validation | ✅ |
| Strict Pydantic schemas | ✅ |
| Unknown-field rejection | ✅ |
| Theme validation | ✅ |
| Birthday template | ✅ |
| Thank You template | ✅ |
| Photo Puzzle template | ✅ |
| Anonymous user flow | ✅ |
| User accounts | Not required / intentionally omitted |

## 5. Personalization Builders

### Birthday

| Feature | Status |
|---|---|
| Recipient name | ✅ |
| Sender name | ✅ |
| Headline | ✅ |
| Message | ✅ |
| Theme selection | ✅ |
| Live preview | ✅ |
| Autosave | ✅ |
| Completion validation | ✅ |
| Review page | ✅ |

### Thank You

| Feature | Status |
|---|---|
| Recipient name | ✅ |
| Sender name | ✅ |
| Message | ✅ |
| Theme selection | ✅ |
| Live preview | ✅ |
| Autosave | ✅ |
| Completion validation | ✅ |
| Review page | ✅ |

### Photo Puzzle

| Feature | Status |
|---|---|
| Recipient name | ✅ |
| Sender name | ✅ |
| Message | ✅ |
| Theme selection | ✅ |
| Photo selection | ✅ |
| Live puzzle preview | ✅ |
| 3×3 puzzle board | ✅ |
| Shuffle/solve interaction | ✅ |
| Completion state | ✅ |
| Autosave | ✅ |
| Review page | ✅ |

### Remaining templates

| Gift | Status |
|---|---|
| Proposal | ✅ |
| Apology | ✅ |
| Anniversary | ✅ |
| Love Letter | ✅ |
| Scrapbook | ✅ |
| Friendship | ✅ |
| Mother's Day | ✅ |

## 6. Photo Upload System

| Feature | Status |
|---|---|
| PhotoAsset model/migration | ✅ |
| S3-compatible storage abstraction | ✅ |
| MinIO local development storage | ✅ |
| Presigned upload URLs | ✅ |
| Browser direct upload | ✅ |
| JPEG/PNG/WebP support | ✅ |
| File-size validation | ✅ |
| Randomized storage keys | ✅ |
| Upload confirmation | ✅ |
| Storage metadata verification | ✅ |
| Uploaded/pending status | ✅ |
| Photo listing | ✅ |
| Presigned view URLs | ✅ |
| Private bucket approach | ✅ |
| Multiple photo uploads | ✅ |
| Selected Photo Puzzle image | ✅ |
| Selected-asset validation during draft update | ✅ |
| Cleanup of orphaned photos | ⬜ |
| Photo deletion API | ⬜ |
| Image processing/resizing | ⬜ |
| Production S3 deployment | ⬜ |

## 7. Checkout & Pricing

| Feature | Status |
|---|---|
| Order model/migration | ✅ |
| Pending/payment_pending/paid/failed/cancelled states | ✅ |
| Server-side product pricing | ✅ |
| Server-side add-on pricing | ✅ |
| Pricing snapshot | ✅ |
| Subtotal/add-on/total calculation | ✅ |
| Client price trust avoided | ✅ |
| Customer email | ✅ |
| Checkout UI | ✅ |
| Order summary | ✅ |
| Add-on selection | ✅ |
| Razorpay integration | ✅ |
| Razorpay order creation | ✅ |
| Razorpay payment popup | ✅ |
| Payment signature verification | ✅ |
| Razorpay payment lookup | ✅ |
| Razorpay webhook endpoint | ✅ |
| `payment.captured` handling | ✅ |
| `order.paid` handling | ✅ |
| Webhook signature validation | ✅ |
| Idempotent payment event handling | ✅ |
| Database order marked paid by webhook | ✅ |
| Frontend payment confirmation | ✅ |
| Gift creation after payment | ✅ |
| End-to-end real Razorpay test | ✅ |

## 8. Gift Creation & Public Gift

| Feature | Status |
|---|---|
| Gift database model/migration | ✅ |
| Gift linked to draft/order | ✅ |
| One gift per draft/order | ✅ |
| Cryptographically generated gift token | ✅ |
| SHA-256 token hashing | ✅ |
| Raw token not stored in DB | ✅ |
| Active/disabled/expired statuses | ✅ |
| Gift expiration column | ✅ |
| Gift expiration logic | ✅ |
| 365-day default lifetime | ✅ |
| Expired gift → HTTP 410 | ✅ |
| Public `/g/{token}` endpoint | ✅ |
| Public product information | ✅ |
| Public personalization | ✅ |
| Public theme | ✅ |
| Private gift link | ✅ |
| Birthday gift rendering | ✅ |
| Thank You gift rendering | ✅ |
| Photo Puzzle rendering | ✅ |
| Personalized names/messages | ✅ |
| Photo Puzzle image rendering | ✅ |
| View Your Gift CTA | ✅ |
| Copy private gift link | ✅ |
| Create another gift | ✅ |
| Selected photo only exposed publicly | ✅ |
| Public gift rate limiting | ✅ |
| Public abuse protection | ⬜ |

## 9. Payment Security

| Feature | Status |
|---|---|
| Server-authoritative pricing | ✅ |
| Server-side Razorpay order creation | ✅ |
| Payment signature validation | ✅ |
| Razorpay API verification | ✅ |
| Webhook signature validation | ✅ |
| Webhook-based final payment state | ✅ |
| Payment event persistence | ✅ |
| Duplicate webhook protection | ✅ |
| Provider order/payment IDs stored | ✅ |
| Payment amount/currency validation | ✅ |
| Secrets kept server-side | ✅ |
| Production webhook infrastructure | ⬜ |
| Production secret management/rotation | ⬜ |

## 10. Review & Checkout UX

| Feature | Status |
|---|---|
| Review page | ✅ |
| Personalization summary | ✅ |
| Theme summary | ✅ |
| Photo preview | ✅ |
| Checkout panel | ✅ |
| Add-ons | ✅ |
| Customer email | ✅ |
| Order summary | ✅ |
| Payment CTA | ✅ |
| Loading/error/success states | ✅ |
| Gift-created state | ✅ |
| View Gift / Copy Link | ✅ |
| Checkout positioning/layout refinement | ✅ |

## 11. Notifications

| Feature | Status |
|---|---|
| Notification model/log | ✅ |
| Redis task queue | ✅ |
| Celery worker | ✅ |
| Email provider | ✅ |
| Transactional email | ✅ |
| Gift-created email | ✅ |
| Gift-link email | ✅ |
| Email retries | ✅ |
| Notification idempotency | ✅ |
| WhatsApp integration | 🟡 |
| WhatsApp gift delivery | 🟡 |
| Delivery status tracking | 🟡 |

Phase 6 email delivery is implemented through a durable notification record,
Redis/Celery queue, configurable console or SMTP provider, bounded retries,
and deduplication tied to the created gift. WhatsApp has a provider adapter but
remains partial until checkout captures an opted-in phone number and provider
delivery callbacks are connected.

## 12. Remaining Gift Templates

| Gift | Status |
|---|---|
| Birthday | ✅ |
| Thank You | ✅ |
| Photo Puzzle | ✅ |
| Proposal | ✅ |
| Apology | ✅ |
| Anniversary | ✅ |
| Love Letter | ✅ |
| Scrapbook | ✅ |
| Friendship | ✅ |
| Mother's Day | ✅ |

Phase 7 uses one shared text-gift builder and review surface with template-specific
copy, themes, and public presentation. All seven template keys have strict
server-side personalization and theme validation, autosave, review, checkout,
and public rendering.

## 13. LLM Love Letter Writer

| Feature | Status |
|---|---|
| LLM integration architecture | ✅ |
| Love-letter writer UI | ✅ |
| Prompt construction | ✅ |
| Tone selection | ✅ |
| Context inputs | ✅ |
| Draft generation | ✅ |
| Regeneration | ✅ |
| Editing generated letter | ✅ |
| Token/cost controls | ✅ |
| Abuse/safety controls | ✅ |
| Rate limiting | ✅ |

The LLM is intended to be isolated to the Love Letter writer.
Love Letter generation uses Gemini as the primary provider with Ollama as the
fallback, is disabled by default until credentials are configured, supports
English and Hindi, requests an original old-school romantic literary voice
without reproducing copyrighted novel passages, requires at least 400 words,
limits requests per draft, caps context and output size, rejects minor-related
context, and writes generated content into the existing editable draft fields.

## 14. Analytics

| Feature | Status |
|---|---|
| UTM event model | ⬜ |
| UTM capture | ⬜ |
| Campaign attribution | ⬜ |
| Catalog analytics | ⬜ |
| Product conversion tracking | ⬜ |
| Checkout conversion tracking | ⬜ |
| Payment success analytics | ⬜ |
| Gift-view analytics | ⬜ |
| Admin analytics dashboard | ⬜ |

## 15. Production Hardening

| Feature | Status |
|---|---|
| API rate limiting | ⬜ |
| Public gift rate limiting | ⬜ |
| Checkout rate limiting | ⬜ |
| Draft abuse protection | ⬜ |
| Upload abuse protection | 🟡 |
| Admin authentication | ⬜ |
| Admin authorization hardening | 🟡 |
| Request logging | 🟡 |
| Structured logging | ⬜ |
| Error monitoring | ⬜ |
| Security headers | ⬜ |
| Production CORS configuration | ⬜ |
| Secret management | ⬜ |
| Database backup strategy | ⬜ |
| Redis production configuration | ⬜ |
| S3 production configuration | ⬜ |
| Production domain | ⬜ |
| HTTPS production deployment | ⬜ |
| CDN configuration | ⬜ |
| Production Razorpay webhook | ⬜ |
| Webhook monitoring | ⬜ |
| Health/readiness checks | 🟡 |

## 16. Testing

| Feature | Status |
|---|---|
| Backend pytest setup | ✅ |
| Ruff linting | ✅ |
| Ruff formatting | ✅ |
| Database migration testing | ✅ |
| Catalog testing | 🟡 |
| Draft API testing | 🟡 |
| Photo API testing | 🟡 |
| Checkout testing | 🟡 |
| Payment verification testing | 🟡 |
| Webhook testing | 🟡 |
| Gift endpoint testing | 🟡 |
| Frontend component tests | ⬜ |
| Frontend E2E tests | ⬜ |
| Full purchase-flow automated test | ⬜ |
| Security tests | ⬜ |
| Load testing | ⬜ |

## 17. Deployment

| Feature | Status |
|---|---|
| Local Docker environment | ✅ |
| Local PostgreSQL | ✅ |
| Local Redis | ✅ |
| Local MinIO | ✅ |
| Local Next.js | ✅ |
| Cloudflare Quick Tunnel testing | 🟡 |
| Production backend deployment | ⬜ |
| Production frontend deployment | ⬜ |
| Production PostgreSQL | ⬜ |
| Production Redis | ⬜ |
| Production object storage | ⬜ |
| Production domain | ⬜ |
| Production Razorpay webhook | ⬜ |
| CI/CD | ⬜ |
| Monitoring | ⬜ |
| Backups | ⬜ |

# Current Overall State

## Major Completed Milestone

DuoCraft now has a working end-to-end purchase pipeline:

```text
User
  ↓
Select Gift
  ↓
Create Draft
  ↓
Personalize
  ↓
Autosave
  ↓
Upload Photo (when applicable)
  ↓
Review
  ↓
Server calculates price
  ↓
Create Razorpay Order
  ↓
Razorpay Payment
  ↓
Razorpay Webhook
  ↓
Order → PAID
  ↓
Gift Created
  ↓
Private Gift Token
  ↓
/g/{token}
  ↓
Personalized Gift
```

The real Razorpay → webhook → paid order → gift creation → frontend confirmation flow has been tested successfully.

## Current Priority Order

### Phase 5 — Finish payment/gift hardening
✅ Complete

1. Gift expiry implementation and testing
2. Photo Puzzle selected-photo exposure and validation
3. Review/checkout layout refinement
4. Public gift rate limiting

### Phase 6 — Delivery Infrastructure
🟡 In progress

6. ✅ Celery worker
7. ✅ Redis task queue
8. ✅ Notification model/log
9. ✅ Email provider
10. ✅ Gift delivery email
11. ✅ Notification retries/idempotency
12. 🟡 WhatsApp integration and delivery callbacks

### Phase 7 — Complete Gift Templates
✅ Complete

13. ✅ Proposal
14. ✅ Apology
15. ✅ Anniversary
16. ✅ Love Letter
17. ✅ Scrapbook
18. ✅ Friendship
19. ✅ Mother's Day

### Phase 8 — LLM
✅ Complete

20. ✅ Love Letter writer
21. ✅ Prompt system
22. ✅ Regeneration/editing
23. ✅ Cost/rate controls

### Phase 9 — Production Hardening
⬜ Next

24. Rate limiting
25. Security headers
26. Admin authentication
27. Error monitoring
28. Structured logging
29. Backup/recovery
30. Production S3
31. Production payment webhook

### Phase 10 — Launch Infrastructure
⬜

32. Production deployment
33. Domain
34. CDN
35. CI/CD
36. Monitoring
37. Automated E2E tests
