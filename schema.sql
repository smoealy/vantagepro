-- Profiles table to store user metadata from Clerk
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(clerk_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'idle', -- 'idle', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Files table to store the multi-file source code
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, path)
);

-- Messages table for swarm history per project
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'Manager', 'Architect', 'Coder', 'Designer', 'User'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified: Users can only see their own data)
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (clerk_id = auth.uid()::text);
CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users can manage their own project files" ON public.files FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can manage their own project messages" ON public.messages FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()::text)
);
