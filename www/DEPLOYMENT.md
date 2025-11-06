# Deployment Guide

This guide will help you deploy Subconverter-RS to Netlify with authentication enabled.

## Table of Contents

- [Quick Deploy to Netlify](#quick-deploy-to-netlify)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Authentication System](#authentication-system)
- [Troubleshooting](#troubleshooting)

## Quick Deploy to Netlify

### One-Click Deployment

1. Click the "Deploy to Netlify" button in the repository README
2. Authorize Netlify to access your GitHub account
3. Choose a repository name
4. Configure environment variables (see below)
5. Click "Deploy site"

### Manual Deployment

1. Fork or clone this repository
2. Sign in to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git provider and select the repository
5. Configure build settings:
   - **Base directory**: `www`
   - **Build command**: `pnpm install --production=false && pnpm build`
   - **Publish directory**: `www/.next`
6. Add environment variables (see below)
7. Click "Deploy site"

## Environment Variables Configuration

Configure these environment variables in your Netlify dashboard under:
**Site settings → Environment variables**

### Authentication Variables

#### AUTH_ENABLE
- **Required**: Yes
- **Values**: `true` or `false`
- **Description**: Enable or disable the authentication system
- **Default**: `false` (authentication disabled)
- **Example**: `true`

#### AUTH_USERNAME
- **Required**: Yes (if `AUTH_ENABLE=true`)
- **Description**: Username for login
- **Example**: `admin`
- **Security**: Use a unique username, not easily guessable

#### AUTH_PASSWORD
- **Required**: Yes (if `AUTH_ENABLE=true`)
- **Description**: Password for login
- **Example**: `MySecurePassword123!`
- **Security**: Use a strong password with:
  - At least 12 characters
  - Mix of uppercase and lowercase letters
  - Numbers and special characters
  - Not used elsewhere

#### PROTECTED_PATHS (Optional)
- **Required**: No
- **Description**: Additional paths that require authentication
- **Format**: Comma-separated list of paths
- **Default**: `/links,/settings,/admin,/config`
- **Example**: `/custom-admin,/private,/internal`

### Storage Variables (Optional)

#### For Vercel KV Storage
If you're using Vercel KV for short URL storage:

- `KV_REST_API_URL`: Your Vercel KV REST API URL
- `KV_REST_API_TOKEN`: Your Vercel KV REST API token
- `KV_REST_API_READ_ONLY_TOKEN`: Your Vercel KV read-only token

#### For Netlify Blobs Storage
Netlify Blobs are automatically configured when deployed to Netlify. No manual configuration needed.

## Authentication System

### How It Works

1. **Initialization First**: When users first visit the site, they are redirected to `/startup` for initialization
2. **Authentication Second**: After initialization, protected routes require login
3. **Protected Routes**: By default, these routes require authentication:
   - `/links` - Subscription link management
   - `/settings` - Server configuration
   - `/admin` - Admin panel
   - `/config` - Configuration management
4. **Public Routes**: These routes are always accessible:
   - `/` - Home page
   - `/startup` - Initialization page
   - `/api/sub` - Subscription conversion API
   - `/s/*` - Short link access
   - `/login` - Login page

### Access Flow

```
User Visit → Initialization Check → Already Initialized? 
                                    ↓
                                   Yes → Authentication Check → Protected Route?
                                                                 ↓
                                                                Yes → Logged In?
                                                                      ↓
                                                                     Yes → Access Granted
                                                                      ↓
                                                                     No → Redirect to Login
```

### Enabling Authentication

1. Go to Netlify dashboard → Your site → Site settings → Environment variables
2. Add the following variables:
   ```
   AUTH_ENABLE=true
   AUTH_USERNAME=your_username
   AUTH_PASSWORD=your_secure_password
   ```
3. Trigger a new deployment (or wait for automatic rebuild)
4. Access protected routes - you'll be redirected to login

### Disabling Authentication

1. Set `AUTH_ENABLE=false` in environment variables
2. Trigger a new deployment
3. All routes become publicly accessible

### Security Considerations

- **HTTPS**: Always use HTTPS (Netlify provides this automatically)
- **Strong Passwords**: Use complex passwords for `AUTH_PASSWORD`
- **Environment Variables**: Never commit credentials to Git
- **Token Expiry**: Authentication tokens expire after 24 hours
- **Cookie Security**: Auth cookies are httpOnly and secure in production

## Troubleshooting

### Issue: Can't Login / Invalid Credentials

**Solutions:**
1. Verify `AUTH_ENABLE=true` in environment variables
2. Check `AUTH_USERNAME` and `AUTH_PASSWORD` are set correctly
3. Ensure there are no extra spaces in environment variable values
4. Trigger a new deployment after changing environment variables
5. Clear browser cookies and try again

### Issue: Redirected to Login Repeatedly

**Solutions:**
1. Clear browser cookies
2. Check browser console for errors
3. Verify middleware is working: check Netlify function logs
4. Ensure `AUTH_ENABLE=true` is set correctly

### Issue: Public Routes Require Login

**Solutions:**
1. Check if paths are in the "always allowed" list in `middleware.ts`
2. Verify subscription API paths (`/api/sub`) are accessible
3. Check Netlify function logs for middleware errors

### Issue: Short Links Not Working

**Solutions:**
1. Verify storage is configured (Netlify Blobs or Vercel KV)
2. Check `/s/*` is in the allowed paths list
3. Test with Netlify function logs

### Issue: Initialization Loop

**Solutions:**
1. Clear browser localStorage
2. Check `/startup` is in the allowed paths list
3. Verify `/api/init` is accessible without authentication
4. Clear all site data and try again

### Checking Logs

To view logs in Netlify:
1. Go to your site in Netlify dashboard
2. Click "Functions" in the top menu
3. Select a function to view its logs
4. Check for errors or authentication issues

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/lonelam/subconverter-rs/issues)
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Browser console errors
   - Netlify function logs (if applicable)

## Best Practices

### Security

- Use unique, strong passwords
- Rotate credentials regularly
- Don't share credentials
- Monitor access logs
- Use `PROTECTED_PATHS` to protect custom routes

### Performance

- Enable caching in settings page
- Use short URLs for frequently accessed conversions
- Monitor Netlify bandwidth usage

### Maintenance

- Keep environment variables documented
- Test authentication after deployments
- Review protected paths periodically
- Update dependencies regularly

## Additional Resources

- [Netlify Environment Variables Documentation](https://docs.netlify.com/environment-variables/overview/)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Subconverter-RS Repository](https://github.com/lonelam/subconverter-rs)

