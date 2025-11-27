-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type character varying NOT NULL,
  entity_type character varying NOT NULL,
  entity_id uuid,
  description text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying,
  role character varying DEFAULT 'admin'::character varying,
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  cache_value jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cache_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  data_type text NOT NULL UNIQUE,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cache_versions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  icon character varying,
  color character varying DEFAULT '#3b82f6'::character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.custom_icons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['svg'::character varying, 'fa'::character varying]::text[])),
  url text,
  icon_name text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT custom_icons_pkey PRIMARY KEY (id),
  CONSTRAINT custom_icons_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  bio text,
  avatar_url text,
  location text,
  website text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.project_tags (
  project_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT project_tags_pkey PRIMARY KEY (project_id, tag_id),
  CONSTRAINT project_tags_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  content text,
  cover_image character varying,
  demo_url character varying,
  github_url character varying,
  tech_stack ARRAY,
  category_id uuid,
  featured boolean DEFAULT false,
  status character varying DEFAULT 'draft'::character varying,
  sort_order integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  level character varying DEFAULT 'intermediate'::character varying,
  category character varying,
  icon_url character varying,
  proficiency integer CHECK (proficiency >= 1 AND proficiency <= 100),
  years_experience numeric,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT skills_pkey PRIMARY KEY (id),
  CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.social_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  platform character varying NOT NULL,
  url character varying NOT NULL,
  icon character varying,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  icon_url text,
  CONSTRAINT social_links_pkey PRIMARY KEY (id),
  CONSTRAINT social_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  description text,
  type text DEFAULT 'string'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  color character varying DEFAULT '#6b7280'::character varying,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ip_address inet,
  user_agent text,
  visit_date timestamp with time zone DEFAULT now(),
  page_url character varying,
  referrer character varying,
  session_id character varying,
  CONSTRAINT visitors_pkey PRIMARY KEY (id)
);