# CalcHub - Setup Instructions

## Database Migration Required

The authentication and user management system has been set up, but requires a database migration to be applied manually.

### Migration File

The migration file has been created at:
```
supabase/migrations/20251007000000_create_user_management_system.sql
```

### How to Apply the Migration

You need to run the SQL commands in the migration file against your Supabase database. You can do this in two ways:

#### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at: https://supabase.com/dashboard
2. Navigate to the "SQL Editor" section
3. Open the migration file (`supabase/migrations/20251007000000_create_user_management_system.sql`)
4. Copy all the SQL content
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

#### Option 2: Using Supabase CLI (If installed locally)

```bash
supabase db push
```

### What the Migration Creates

The migration sets up:

1. **user_profiles table** - Extends Supabase auth with:
   - User roles (admin/normal user)
   - Admin panel access control
   - Profile information

2. **user_calculator_access table** - Manages:
   - User-specific calculator visibility
   - Per-user calculator permissions

3. **Row Level Security (RLS) policies** - Ensures:
   - Users can only see their own data
   - Admins can manage all users
   - Proper access control

4. **Automatic triggers** - Handles:
   - Auto-creation of user profiles on signup
   - First user becomes admin automatically
   - Timestamp updates

### First User Setup

**IMPORTANT**: The first user to sign up will automatically become an admin with full access to the admin panel. After that, you can manage user roles from the admin panel.

## Testing the Setup

1. Start the dev server (if not already running)
2. Click "Sign Up" in the header
3. Create your admin account (first user)
4. After signing in, you'll see "Admin Panel" option in your user menu
5. Access the admin panel to manage:
   - Calculator visibility and order
   - User roles and permissions
   - User-specific calculator access

## Features Overview

### Authentication System
- Email/password authentication via Supabase Auth
- Login and Signup modals
- User profile management
- Session handling

### Role-Based Access Control
- Admin users: Full access to admin panel
- Normal users: Standard calculator access
- Admin panel access: Separate permission flag
- Per-user calculator visibility control

### Admin Panel
- **Calculator Management**: Control which calculators are visible, reorder them
- **User Access Management**:
  - Grant/revoke admin roles
  - Grant/revoke admin panel access
  - Control calculator access per user
  - Default: All users have access to all calculators

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data (except admins)
- Admins have full control over user management
- Secure authentication with Supabase Auth

## Environment Variables

Your `.env` file should already contain:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No additional environment variables are needed.

## Accessing Admin Panel

1. Sign in as an admin user
2. Click on your user profile in the header
3. Select "Admin Panel" from the dropdown
4. Or navigate directly to `/admin` URL

## Troubleshooting

### Can't access admin panel?
- Make sure the migration has been applied
- Ensure you're logged in
- Check that your user has `has_admin_panel_access` set to `true` in the database

### Users table not found?
- The migration needs to be applied
- Follow the "How to Apply the Migration" steps above

### Authentication not working?
- Check that Supabase Auth is enabled in your project dashboard
- Verify environment variables in `.env` file
- Ensure email confirmations are disabled (or configured) in Supabase Auth settings

## Default Permissions

- **First user**: Becomes admin automatically
- **New users**: Normal users with access to all calculators
- **Calculator visibility**: Controlled globally in Calculator Management
- **User-specific access**: Can be customized per user in User Access Management
