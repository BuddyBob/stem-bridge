# Production Deployment Guide

## Pre-deployment Checklist

### 1. Database Setup (Supabase)
Run this SQL in your Supabase SQL Editor:

```sql
-- Create site_content table for editable content
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can read site content" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify site content" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE site_content;
```

### 2. Environment Variables
Set these in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_INVITE_CODE=your_secure_admin_invite_code
```

### 3. Supabase Configuration
In your Supabase dashboard:

- **Authentication > URL Configuration**: Add your production domain
- **API > API Settings**: Enable "Enable CORS"
- **Database > Replication**: Enable real-time for `site_content` table

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Custom Domain**
   - Add domain in Vercel dashboard
   - Update DNS records as instructed

### Option 2: Other Platforms

- **Netlify**: Similar to Vercel, connect GitHub repo
- **Railway**: Docker-based deployment
- **DigitalOcean App Platform**: Container deployment

## Post-deployment

1. **Test Admin Features**
   - Go to `/admin/login`
   - Sign up with admin invite code
   - Test content editing functionality

2. **Seed Events**
   - Visit `/api/seed-events` (POST request)
   - Or manually create events through admin interface

3. **Performance Testing**
   - Test page load speeds
   - Verify real-time sync between admin users
   - Check mobile responsiveness

## Security Considerations

- ✅ Row Level Security enabled on all tables
- ✅ Admin-only content editing
- ✅ Secure environment variables
- ✅ CORS properly configured
- ✅ Input validation on all forms

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Uptime monitoring
- Performance monitoring

## Backup Strategy

- Supabase provides automatic backups
- Consider exporting critical data regularly
- Test backup restoration process
