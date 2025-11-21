-- 创建缓存表
CREATE TABLE IF NOT EXISTS cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_value JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建缓存版本表
CREATE TABLE IF NOT EXISTS cache_versions (
  data_type TEXT PRIMARY KEY,
  version TEXT NOT NULL DEFAULT '1.0.0',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为缓存表创建索引
CREATE INDEX IF NOT EXISTS idx_cache_cache_key ON cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

-- 启用RLS (Row Level Security)
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_versions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：允许所有操作（缓存是公共的）
CREATE POLICY "Allow all cache operations" ON cache
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all cache_versions operations" ON cache_versions
  FOR ALL USING (true)
  WITH CHECK (true);

-- 创建清理过期缓存的函数
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < NOW();
END;
$$;

-- 创建触发器自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cache_updated_at
  BEFORE UPDATE ON cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入默认的缓存版本
INSERT INTO cache_versions (data_type, version) VALUES
  ('projects', '1.0.0'),
  ('categories', '1.0.0'),
  ('tags', '1.0.0'),
  ('skills', '1.0.0'),
  ('social_links', '1.0.0'),
  ('profile', '1.0.0'),
  ('system_settings', '1.0.0')
ON CONFLICT (data_type) DO NOTHING;
