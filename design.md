# WedMangal Mobile App - Design Document

## Overview

WedMangal is a celebration booking platform that connects customers with wedding service providers (photographers, caterers, makeup artists, venues, DJs, etc.). The mobile app provides a seamless experience for users to discover, compare, and book services for their celebrations.

## Design Principles

- **Mobile-First**: Optimized for portrait orientation (9:16) and one-handed usage
- **Apple HIG Compliance**: Follows iOS Human Interface Guidelines for native feel
- **Fast & Responsive**: Smooth animations and instant feedback
- **Accessible**: Clear typography, sufficient contrast, and intuitive navigation
- **Consistent**: Unified design language across all screens

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Warm Gold | #D4A574 | Buttons, highlights, accents |
| Secondary | Deep Maroon | #8B3A3A | Headers, important text |
| Background | Off-White | #F8F6F1 | Main background |
| Text Primary | Dark Brown | #2C2C2C | Body text |
| Text Secondary | Medium Gray | #7A7A7A | Secondary text |
| Success | Emerald Green | #27AE60 | Confirmations, success states |
| Error | Coral Red | #E74C3C | Errors, warnings |
| Border | Light Gray | #E8E8E8 | Dividers, borders |

## Screen List

### 1. **Authentication Screens**

#### 1.1 Splash Screen
- **Purpose**: Initial app launch, branding display
- **Content**: WedMangal logo, app name, loading animation
- **Duration**: 2-3 seconds before auto-redirect to Home or Login
- **Actions**: None (automatic transition)

#### 1.2 Login Screen
- **Purpose**: User authentication
- **Content**:
  - Email/phone input field
  - Password input field
  - "Remember Me" checkbox
  - "Forgot Password?" link
  - Login button
  - Social login buttons (Google, Facebook, Apple)
  - Sign up link
- **Actions**: 
  - Email/password login
  - Social authentication
  - Navigate to sign up
  - Password recovery

#### 1.3 Sign Up Screen
- **Purpose**: New user registration
- **Content**:
  - Full name input
  - Email input
  - Phone number input
  - Password input
  - Confirm password input
  - Role selection (Customer / Service Provider)
  - Terms & Conditions checkbox
  - Sign up button
- **Actions**:
  - Create account
  - Social sign up
  - Navigate to login

#### 1.4 Role Selection Screen (for Service Providers)
- **Purpose**: Determine user type after signup
- **Content**:
  - Two cards: "I'm Looking to Book" vs "I'm a Service Provider"
  - Description for each role
  - Selection buttons
- **Actions**: Navigate to appropriate onboarding

### 2. **Home Screen (Tab 1)**

#### 2.1 Home Feed
- **Purpose**: Main discovery and quick access
- **Content**:
  - Search bar (sticky at top)
  - "Wedding Date" quick selector
  - Featured/promoted services carousel
  - Category grid (Photographers, Caterers, Makeup, Venues, DJ, Mehandi, etc.)
  - "Recently Viewed" section
  - "Trending This Week" section
  - "Special Offers" banner
- **Actions**:
  - Search by keyword
  - Select wedding date
  - Browse categories
  - View service details
  - Add to wishlist

### 3. **Search & Browse Screen (Tab 2)**

#### 3.1 Search Results Screen
- **Purpose**: Display filtered services
- **Content**:
  - Search query display
  - Active filters badge
  - Filter button (opens filter sheet)
  - Service cards in list view:
    - Service image
    - Business name
    - Category badge
    - Rating & review count
    - Price range
    - Distance/location
    - Wishlist button
  - Sorting options (Relevance, Rating, Price Low-High, Price High-Low)
- **Actions**:
  - Apply/remove filters (category, price, rating, location, availability)
  - Change sort order
  - View service details
  - Add/remove from wishlist
  - Infinite scroll pagination

#### 3.2 Filter Sheet (Bottom Sheet)
- **Purpose**: Refine search results
- **Content**:
  - Category filter (multi-select)
  - Price range slider
  - Rating filter (stars)
  - Location/distance filter
  - Availability filter (date range)
  - "Apply Filters" button
  - "Clear All" button
- **Actions**: Apply or clear filters

### 4. **Service Details Screen**

#### 4.1 Vendor Profile & Service Details
- **Purpose**: Comprehensive service information
- **Content**:
  - Service image carousel (swipe to view)
  - Business name & category
  - Rating & review count
  - Price range
  - Location & distance
  - "About" section (description)
  - Service offerings (list of services/packages)
  - Gallery (service images)
  - Availability calendar (click to see available dates/times)
  - Contact information (phone, email, social links)
  - Reviews section (expandable)
  - "Book Now" button (sticky at bottom)
  - Share button
  - Wishlist button
- **Actions**:
  - View image gallery
  - Check availability
  - Read full reviews
  - Contact vendor (call, email, WhatsApp)
  - Add to wishlist
  - Navigate to booking flow

### 5. **Booking Flow Screens**

#### 5.1 Select Service Screen
- **Purpose**: Choose specific service/package
- **Content**:
  - List of available services/packages
  - Each package shows:
    - Package name
    - Description
    - Price
    - Included items
    - Duration
    - Select button
- **Actions**: Select a package, proceed to date/time selection

#### 5.2 Select Date & Time Screen
- **Purpose**: Choose booking date and time
- **Content**:
  - Calendar widget (show available dates)
  - Selected date display
  - Time slot selector (show available times)
  - Special requests text area
  - "Continue" button
- **Actions**: Select date, select time, add notes, proceed to checkout

#### 5.3 Booking Summary Screen
- **Purpose**: Review booking details before payment
- **Content**:
  - Service details summary
  - Selected date & time
  - Price breakdown
    - Service price
    - Taxes
    - Total
  - Vendor contact info
  - Special requests
  - "Confirm & Pay" button
  - "Edit Details" button
- **Actions**: Confirm booking, edit details, proceed to payment

#### 5.4 Payment Screen
- **Purpose**: Process payment
- **Content**:
  - Payment method selector (Card, UPI, Wallet, etc.)
  - Amount display
  - Payment button
  - Security badge
- **Actions**: Select payment method, process payment

#### 5.5 Booking Confirmation Screen
- **Purpose**: Confirm successful booking
- **Content**:
  - Checkmark icon
  - "Booking Confirmed!" message
  - Booking reference number
  - Booking details summary
  - Vendor contact info
  - "View Booking" button
  - "Back to Home" button
- **Actions**: View booking details, return to home

### 6. **Wishlist Screen (Tab 3)**

#### 6.1 Wishlist
- **Purpose**: View saved services
- **Content**:
  - Empty state (if no items)
  - List of wishlist items:
    - Service image
    - Business name
    - Category
    - Rating
    - Price
    - Remove button
  - "Continue Shopping" button (if empty)
- **Actions**:
  - View service details
  - Remove from wishlist
  - Add to cart / Book now

### 7. **My Bookings Screen (Tab 4)**

#### 7.1 Bookings List
- **Purpose**: View all user bookings
- **Content**:
  - Tabs: Upcoming, Completed, Cancelled
  - Booking cards showing:
    - Service image
    - Business name
    - Booking date & time
    - Status badge
    - Price
    - Action buttons (View, Cancel, Review)
  - Empty state for each tab
- **Actions**:
  - View booking details
  - Cancel booking
  - Leave review
  - Contact vendor

#### 7.2 Booking Details Screen
- **Purpose**: View full booking information
- **Content**:
  - Booking status timeline
  - Service details
  - Booking date & time
  - Vendor information & contact
  - Price breakdown
  - Special requests
  - Action buttons (Cancel, Contact, Review)
- **Actions**:
  - Cancel booking
  - Contact vendor
  - Leave review
  - Download invoice

### 8. **Profile Screen (Tab 5)**

#### 8.1 User Profile
- **Purpose**: User account management
- **Content**:
  - User avatar
  - User name & email
  - Phone number
  - Wedding date (if set)
  - Menu items:
    - Edit Profile
    - My Bookings
    - Wishlist
    - Saved Addresses
    - Payment Methods
    - Notifications Settings
    - Help & Support
    - Terms & Conditions
    - Privacy Policy
    - About App
    - Logout
- **Actions**:
  - Edit profile information
  - Manage addresses
  - Manage payment methods
  - Adjust notification preferences
  - Access help
  - Logout

#### 8.2 Edit Profile Screen
- **Purpose**: Update user information
- **Content**:
  - Avatar upload
  - Full name input
  - Email input
  - Phone number input
  - Wedding date picker
  - Save button
- **Actions**: Update profile, save changes

### 9. **Additional Screens**

#### 9.1 Reviews Screen
- **Purpose**: View and write reviews
- **Content**:
  - Review form (rating, text, images)
  - Existing reviews list
  - Filter/sort options
- **Actions**: Submit review, view reviews

#### 9.2 Help & Support Screen
- **Purpose**: Customer support
- **Content**:
  - FAQ section
  - Contact form
  - Chat support (if available)
- **Actions**: Browse FAQ, submit support ticket, start chat

## Key User Flows

### Flow 1: Browse & Book a Service
1. User opens app → Home screen
2. User searches or browses by category → Search Results
3. User taps service card → Service Details
4. User taps "Book Now" → Select Service
5. User selects date & time → Select Date & Time
6. User reviews booking → Booking Summary
7. User pays → Payment Screen
8. Booking confirmed → Booking Confirmation

### Flow 2: User Authentication
1. User opens app → Splash Screen
2. If not logged in → Login Screen
3. User enters credentials or uses social login
4. If new user → Sign Up Screen → Role Selection
5. User completes profile → Home Screen

### Flow 3: Manage Bookings
1. User taps "My Bookings" tab → Bookings List
2. User taps booking card → Booking Details
3. User can cancel, contact vendor, or leave review

## Technical Specifications

### Technology Stack
- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query (React Query)
- **API Communication**: TRPC + Axios
- **Authentication**: JWT tokens from Django backend
- **Navigation**: Expo Router (file-based routing)

### API Integration
- **Base URL**: `https://wedmangal.com/api/` (or your backend URL)
- **Authentication**: Bearer token in Authorization header
- **Key Endpoints**:
  - `POST /auth/login` - User login
  - `POST /auth/register` - User registration
  - `GET /products/` - List services
  - `GET /products/{id}/` - Service details
  - `POST /orders/` - Create booking
  - `GET /orders/` - List user bookings
  - `POST /reviews/` - Submit review

### Performance Targets
- Initial app load: < 3 seconds
- Screen transition: < 300ms
- API response: < 2 seconds
- Image loading: Progressive with placeholder

## Accessibility Considerations
- Minimum font size: 14pt for body text
- Color contrast ratio: WCAG AA (4.5:1 for text)
- Touch targets: Minimum 44x44pt
- Screen reader support enabled
- Semantic HTML/React Native components

## Future Enhancements
- Push notifications for booking updates
- In-app chat with vendors
- Video consultations
- Augmented Reality preview (for venues, decorations)
- Loyalty/rewards program
- Referral system
- Advanced budget planning tools
