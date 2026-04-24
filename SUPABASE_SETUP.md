# Supabase Setup Guide for Gems Lab System

To fully activate the Gems Lab System, follow these steps in your Supabase Dashboard:

## 1. Database Schema

Run the following SQL in the **SQL Editor**:

```sql
-- Create Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Gem Reports Table
CREATE TABLE gem_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  gem_type TEXT NOT NULL,
  shape TEXT NOT NULL,
  cut TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  dimension TEXT NOT NULL,
  color TEXT NOT NULL,
  clarity TEXT NOT NULL,
  transparency TEXT NOT NULL,
  magnification TEXT NOT NULL,
  refractive_index TEXT NOT NULL,
  origin TEXT NOT NULL,
  treatment TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  data_hash TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_reports ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for Gem Reports
CREATE POLICY "Users can view own reports" ON gem_reports
  FOR SELECT USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can insert own reports" ON gem_reports
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users cannot update reports" ON gem_reports
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 2. Storage Setup

1. Go to **Storage** in Supabase.
2. Create a new bucket named `gem-images`.
3. Set the bucket to **Public** (so reports can be verified by the public URL).
4. Add a policy for `Authenticated` users to `INSERT` and `SELECT` objects.

## 3. Environment Variables

Add your Supabase URL and Anon Key to your environment variables (or the Secrets panel in AI Studio):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
