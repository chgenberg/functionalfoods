# Svea Checkout Integration Guide

## Environment Variables

Set these in Railway or your `.env.production`:

```env
# Svea Configuration
SVEA_MERCHANT_ID=your_merchant_id_here
SVEA_SECRET_WORD=your_secret_word_here
SVEA_TEST_MODE=false  # Set to 'true' for test environment
```

### Getting Your Credentials

1. Log in to Svea Payment Admin: https://paymentadmin.svea.com
2. Navigate to **Integration > API Keys**
3. Copy your **Merchant ID** and **Secret Word**
4. Paste them into Railway as `SVEA_MERCHANT_ID` and `SVEA_SECRET_WORD`

## Registered Domains

**Important:** You must register your callback domains with Svea support:

- Production: `functionalfoods.se`
- Production: `www.functionalfoods.se`
- Test (if applicable): Your test domain

Contact: support@svea.com

## API Endpoints

### Checkout Creation
- **Endpoint:** `POST /api/checkout/svea-v2`
- **Request:**
```json
{
  "items": [
    {
      "id": "functional-basics",
      "name": "Functional Basics",
      "price": 499,
      "quantity": 1,
      "type": "course"
    }
  ],
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "couponCode": "OPTIONAL"
}
```

### Verify Configuration
- **Endpoint:** `GET /api/debug/svea-config`
- **Response:** Shows if Svea is properly configured

## Test Cards (Svea Test Environment)

When `SVEA_TEST_MODE=true`, use these test cards:

| Result   | Card Type   | Card Number         | CVV  | Expiry Date |
|----------|-------------|---------------------|------|-------------|
| Approved | Visa        | 4916-4232-3977-8102 | Any  | Any future  |
| Approved | Mastercard  | 5392-1273-3201-0533 | Any  | Any future  |

## Webhook Configuration

Svea will POST to: `https://functionalfoods.se/api/webhooks/svea-v2`

Webhook headers include:
- `x-svea-signature`: SHA512 validation

Response should be `{ received: true }` with HTTP 200.

## Article Numbers

Mapped to Svea's system:

| Course                | Article Number |
|-----------------------|-----------------|
| Functional Basics     | 21122           |
| Functional Flow       | 21127           |
| Functional Energy     | 21128           |
| Hormonell Balans      | (Not set yet)   |

## Pricing

All prices are in **öre** (minor units):
- 1 kr = 100 öre
- 499 kr = 49900 öre
- Conversion: `priceInOre = priceInKronor * 100`

## VAT

Courses are configured with 25% VAT (2500 basis points in Svea API).

## Troubleshooting

### 401 Unauthorized
- Check `SVEA_MERCHANT_ID` and `SVEA_SECRET_WORD` are set correctly
- Verify timestamp format (should be `YYYY-MM-DD HH:mm`)
- Ensure domain is registered with Svea

### 400 Bad Request
- Check all required fields in request
- Verify prices are in öre (100x normal price)
- Ensure items have valid `articleNumber`

### Webhook Not Received
- Check that `pushUri` is registered with Svea
- Verify domain is publicly accessible
- Check firewall isn't blocking incoming webhooks
- Enable webhook validation: Set `SVEA_WEBHOOK_VALIDATION=true`

## Testing Flow

1. Check configuration: `curl https://functionalfoods.se/api/debug/svea-config`
2. Create test order:
```bash
curl -X POST https://functionalfoods.se/api/checkout/svea-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "functional-basics", "name": "Functional Basics", "price": 499, "quantity": 1, "type": "course"}],
    "customer": {"email": "test@example.com", "name": "Test User"}
  }'
```
3. Complete payment with test card
4. Verify webhook received in logs

## Useful Links

- [Svea Checkout Docs](https://docs.payments.svea.com/docs/getting-started/authentication)
- [Test Data](https://docs.payments.svea.com/docs/getting-started/testdata)
- [Go Live Checklist](https://docs.payments.svea.com/docs/getting-started/golive)
- [Order Management API](https://docs.payments.svea.com/docs/checkout/get-a-order)
