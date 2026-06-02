# WedMangal Mobile App - Backend Integration Guide

## API Configuration

Your mobile app is now configured to connect to your Django backend at `https://wedmangal.com/api`.

### Current Configuration

**Base URL:** `https://wedmangal.com/api`

The API client automatically includes JWT authentication tokens in all requests.

## API Endpoints Required

Your Django backend should have the following REST API endpoints:

### 1. Products/Services

```
GET /api/products/                    # List all products with pagination
GET /api/products/?search=query       # Search products
GET /api/products/?category=value     # Filter by category
GET /api/products/{id}/               # Get product details
```

**Expected Response Format:**
```json
{
  "count": 100,
  "next": "https://wedmangal.com/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "_id": "product_id",
      "name": "Photographer Service",
      "image": "https://...",
      "category": "photographer",
      "min_price": 5000,
      "max_price": 15000,
      "rating": 4.5,
      "numReviews": 12
    }
  ]
}
```

### 2. Orders/Bookings

```
GET /api/orders/                      # Get user's bookings
GET /api/orders/{id}/                 # Get booking details
POST /api/orders/                     # Create new booking
POST /api/orders/{id}/cancel/         # Cancel booking
```

**Create Order Payload:**
```json
{
  "product_id": "product_id",
  "booking_date": "2026-06-15",
  "booking_time": "10:00",
  "special_requests": "Optional notes",
  "total_amount": 10000
}
```

**Expected Response:**
```json
{
  "_id": "order_id",
  "product_name": "Photographer Service",
  "booking_date": "2026-06-15",
  "booking_time": "10:00",
  "status": "pending",
  "total_amount": 10000
}
```

### 3. Reviews

```
GET /api/products/{id}/reviews/       # Get product reviews
POST /api/products/{id}/reviews/      # Submit review
```

**Create Review Payload:**
```json
{
  "rating": 5,
  "comment": "Excellent service!"
}
```

### 4. User Profile

```
GET /api/users/profile/               # Get user profile
PATCH /api/users/profile/             # Update user profile
```

**Expected Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "phone": "+91 98765 43210"
}
```

### 5. Wishlist

```
GET /api/users/wishlist/              # Get wishlist items
POST /api/users/wishlist/             # Add to wishlist
DELETE /api/users/wishlist/{id}/      # Remove from wishlist
```

**Add to Wishlist Payload:**
```json
{
  "product_id": "product_id"
}
```

## Authentication

The mobile app uses JWT token-based authentication. 

### Login/Signup Endpoints (Not yet implemented in app)

You may need to add these endpoints to your backend:

```
POST /api/auth/login/                 # Login user
POST /api/auth/signup/                # Register new user
POST /api/auth/refresh/               # Refresh JWT token
```

**Login Payload:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "access": "jwt_token_here",
  "refresh": "refresh_token_here",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

## CORS Configuration

Make sure your Django backend has CORS enabled for your mobile app domain:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://wedmangal.com",
    "http://localhost:3000",  # For development
]
```

## Testing the Integration

1. **Check Console Logs** - Open the app's console and look for API call logs:
   - ✅ Successful calls: `✅ Products fetched:`
   - ❌ Failed calls: `❌ Failed to fetch products:`

2. **Test Each Endpoint** - Navigate through the app:
   - Home Screen → Should load featured products
   - Search Tab → Should search and filter products
   - Bookings Tab → Should load user's bookings
   - Profile Tab → Should load user profile
   - Wishlist Tab → Should load saved items

3. **Monitor Network** - Use browser DevTools to check:
   - Request URL: Should be `https://wedmangal.com/api/...`
   - Status Code: Should be 200 for success, 401 for auth errors
   - Response Body: Should match expected format

## Troubleshooting

### 401 Unauthorized
- **Cause:** JWT token is missing or expired
- **Solution:** Implement login/signup endpoints and ensure token is stored correctly

### 404 Not Found
- **Cause:** Endpoint doesn't exist on backend
- **Solution:** Verify endpoint paths match the expected format

### 403 Forbidden
- **Cause:** User doesn't have permission to access resource
- **Solution:** Check permission settings in Django

### CORS Error
- **Cause:** Backend doesn't allow requests from app origin
- **Solution:** Add CORS headers to Django settings

### 500 Server Error
- **Cause:** Backend error
- **Solution:** Check Django server logs for details

## Next Steps

1. Verify all endpoints are implemented in your Django backend
2. Test each endpoint using Postman or curl
3. Run the mobile app and check console logs for API calls
4. Fix any endpoint mismatches or missing fields
5. Once all endpoints work, the app is ready for testing with real data

## API Client Methods

The app uses these methods to call your backend:

```typescript
// Products
apiClient.getProducts(params)
apiClient.getProductById(id)
apiClient.searchProducts(query, params)

// Orders
apiClient.getOrders()
apiClient.getOrderById(id)
apiClient.createOrder(data)
apiClient.cancelOrder(id)

// Reviews
apiClient.getReviews(productId)
apiClient.createReview(productId, data)

// User Profile
apiClient.getUserProfile()
apiClient.updateUserProfile(data)

// Wishlist
apiClient.getWishlist()
apiClient.addToWishlist(productId)
apiClient.removeFromWishlist(productId)
```

All methods include automatic error logging to help with debugging.
