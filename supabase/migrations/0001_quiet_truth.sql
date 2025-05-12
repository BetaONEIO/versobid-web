\n\n-- Create profiles table\nCREATE TABLE IF NOT EXISTS profiles (\n  id UUID PRIMARY KEY REFERENCES auth.users(id),\n  created_at TIMESTAMPTZ DEFAULT now(),\n  username TEXT UNIQUE NOT NULL,\n  full_name TEXT NOT NULL,\n  avatar_url TEXT,\n  email TEXT UNIQUE NOT NULL,\n  CONSTRAINT username_length CHECK (char_length(username) >= 3)\n);
\n\n-- Enable RLS\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
\n\n-- Create policies\nCREATE POLICY "Users can view their own profile"\n  ON profiles\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid() = id);
\n\nCREATE POLICY "Users can update their own profile"\n  ON profiles\n  FOR UPDATE\n  TO authenticated\n  USING (auth.uid() = id);
\n\n-- Create public profiles view for limited public access\nCREATE VIEW public_profiles AS\n  SELECT id, username, avatar_url\n  FROM profiles;
\n\n-- Grant access to public profiles view\nGRANT SELECT ON public_profiles TO anon, authenticated;
;
