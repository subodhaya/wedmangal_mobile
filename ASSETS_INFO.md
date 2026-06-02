# WedMangal App Assets

## App Logo & Icons

The following assets have been generated and are stored on CDN:

### WedMangal Logo (Custom Generated)

- **Original (Full Resolution):** https://d2xsxph8kpxj0f.cloudfront.net/310519663630522431/K8E2LqDPbqozgPixuTD5Dc/wedmangal-icon-Vbct7f45iFES73uALFcx5D.png
- **Compressed (WebP):** https://d2xsxph8kpxj0f.cloudfront.net/310519663630522431/K8E2LqDPbqozgPixuTD5Dc/wedmangal-icon-9mQcfSZCSQdXZspTLLcctd.webp

### Usage

The app.config.ts is configured to use the CDN URLs for:
- App icon (icon.png)
- Splash screen icon (splash-icon.png)
- Favicon
- Android adaptive icon foreground

### Local Fallback

If you need to use local assets during development:
1. Download the logo from the CDN URLs above
2. Save to `assets/images/` directory
3. The app will automatically use local assets if CDN is unavailable

### Branding Details

- **App Name:** WedMangal
- **App Slug:** wedmangal
- **Primary Color:** #D4A574 (Gold)
- **Secondary Color:** #8B3A3A (Maroon)
- **Background:** #F8F6F1 (Off-white)
- **Logo Style:** Elegant mandap with intertwined rings and celebration elements

### App Configuration

See `app.config.ts` for complete branding configuration including:
- Bundle ID
- App version
- Permissions
- Splash screen settings
- Android/iOS specific configurations
