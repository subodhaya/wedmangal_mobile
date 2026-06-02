# WedMangal Mobile App - Google Play Store Submission Guide

This guide provides step-by-step instructions for building, signing, and submitting your WedMangal mobile app to the Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building the APK](#building-the-apk)
3. [Signing the APK](#signing-the-apk)
4. [Creating a Google Play Console Account](#creating-a-google-play-console-account)
5. [App Store Listing Setup](#app-store-listing-setup)
6. [Uploading to Play Store](#uploading-to-play-store)
7. [Post-Launch Checklist](#post-launch-checklist)

---

## Prerequisites

Before you begin, ensure you have:

- **Android SDK Tools** installed on your machine
- **Java Development Kit (JDK)** version 11 or higher
- **Node.js** and **npm** installed
- **Expo CLI** installed globally (`npm install -g expo-cli`)
- A **Google Play Developer account** ($25 one-time registration fee)
- A **Google Play Console** account

### Install Required Tools

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI for building
npm install -g eas-cli

# Verify installations
expo --version
eas --version
```

---

## Building the APK

### Step 1: Configure EAS Build

First, initialize EAS in your project:

```bash
cd /home/ubuntu/wedmangal_mobile
eas build:configure
```

This will create an `eas.json` file in your project root.

### Step 2: Build for Android

Use EAS to build your APK:

```bash
eas build --platform android --type apk
```

This command will:
- Build your app in the cloud
- Generate a signed APK
- Provide you with a download link

**Note:** The first build may take 10-15 minutes. Subsequent builds are faster due to caching.

### Step 3: Download the APK

Once the build completes, you'll receive a download link. Save the APK file to your local machine.

---

## Signing the APK

If you're building locally (not recommended), you'll need to sign the APK manually:

```bash
# Create a keystore (one-time)
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk my-key-alias

# Optimize the APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

**Important:** Keep your keystore file safe. You'll need it for all future app updates.

---

## Creating a Google Play Console Account

### Step 1: Sign Up

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Accept the Developer Agreement and Privacy Policy
4. Pay the $25 registration fee

### Step 2: Create Your Developer Profile

1. Fill in your developer name and contact information
2. Add your developer email
3. Verify your email address

---

## App Store Listing Setup

### Step 1: Create a New App

1. In Google Play Console, click **"Create app"**
2. Enter the app name: **"WedMangal"**
3. Select **"Apps"** as the app type
4. Choose the default language: **"English"**
5. Select content rating: **"Not an app for children"**
6. Accept the declarations and click **"Create app"**

### Step 2: Fill in App Details

#### Store Listing

1. **Title:** WedMangal - Wedding Services Booking
2. **Short Description:** Book photographers, caterers, makeup artists, venues, DJs, and more for your celebration
3. **Full Description:**
   ```
   WedMangal is your one-stop platform for booking professional wedding and celebration services. 
   Whether you're planning a wedding, engagement, anniversary, or any special celebration, 
   find and book the best service providers in your area.
   
   Features:
   - Browse thousands of verified service providers
   - Filter by category, price, and ratings
   - Read genuine customer reviews
   - Book services with flexible dates and times
   - Track your bookings in real-time
   - Secure payment processing
   - 24/7 customer support
   
   Categories:
   - Photographers
   - Caterers
   - Makeup Artists
   - Venues
   - DJs & Entertainment
   - Mehandi Artists
   - And much more!
   ```

4. **Screenshots:** Upload 4-5 screenshots showing key features
   - Home screen with featured services
   - Search and filter interface
   - Service details page
   - Booking confirmation
   - Bookings management

5. **Feature Graphic:** Create a 1024x500px banner showcasing the app

6. **Icon:** Use your app icon (512x512px minimum)

7. **Video Preview:** Optional - create a 15-30 second demo video

#### Content Rating

1. Fill out the content rating questionnaire
2. For WedMangal, most questions will be "No"
3. Submit for rating

#### Pricing & Distribution

1. Select **"Free"** as the pricing model
2. Choose countries where the app is available
3. Select **"Android"** as the platform

#### Privacy Policy

1. Create or upload your privacy policy
2. Include information about:
   - Data collection practices
   - User privacy protection
   - Third-party services (payment, analytics)

---

## Uploading to Play Store

### Step 1: Prepare Your APK

Ensure your APK is:
- Signed with your release keystore
- Optimized and aligned
- Named appropriately (e.g., `wedmangal-release.apk`)

### Step 2: Upload to Google Play Console

1. In Google Play Console, go to **"Release" → "Production"**
2. Click **"Create new release"**
3. Click **"Browse files"** and select your signed APK
4. Review the app details:
   - Version code (auto-incremented)
   - Version name (e.g., "1.0.0")
5. Click **"Review release"**
6. Check for any warnings or errors
7. Click **"Start rollout to Production"**

### Step 3: Submit for Review

1. Go to **"App content" → "Content rating"**
2. Ensure your content rating is complete
3. Go to **"App content" → "Target audience"**
4. Select appropriate audience categories
5. Go to **"Release" → "Production"**
6. Click **"Submit"** to send your app for review

---

## Post-Launch Checklist

After your app is live, follow these steps:

### Week 1

- [ ] Monitor app reviews and ratings
- [ ] Respond to user feedback promptly
- [ ] Check crash reports in Google Play Console
- [ ] Monitor app analytics
- [ ] Test all features on real devices

### Ongoing

- [ ] Regularly update your app with new features
- [ ] Fix bugs reported by users
- [ ] Improve performance based on analytics
- [ ] Keep your privacy policy updated
- [ ] Maintain your app store listing with fresh screenshots
- [ ] Respond to user reviews and ratings

---

## Version Updates

To release a new version:

1. Update the version code in `app.config.ts`:
   ```typescript
   version: "1.0.1", // Increment this
   ```

2. Build a new APK:
   ```bash
   eas build --platform android --type apk
   ```

3. Upload to Google Play Console following the same process

---

## Troubleshooting

### Build Fails

- Check your internet connection
- Ensure all dependencies are installed
- Clear cache: `npm cache clean --force`
- Try again: `eas build --platform android --type apk`

### App Rejected During Review

Common reasons:
- Crashes on startup (test thoroughly)
- Incomplete app store listing
- Privacy policy issues
- Violates Google Play policies
- Requires specific permissions without clear justification

**Solution:** Address the feedback and resubmit

### Low Ratings After Launch

- Respond to negative reviews professionally
- Fix reported bugs quickly
- Improve app performance
- Add requested features
- Encourage satisfied users to leave reviews

---

## Additional Resources

- [Google Play Console Help Center](https://support.google.com/googleplay/android-developer)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Signing Guide](https://developer.android.com/studio/publish/app-signing)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

---

## Support

For technical issues with your WedMangal app:
- Check the project README.md
- Review error logs in Google Play Console
- Contact Expo support for build issues
- Consult Android documentation for platform-specific issues

---

**Last Updated:** May 5, 2026
**App Version:** 1.0.0
**Status:** Ready for Play Store Submission
