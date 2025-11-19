-- 检查数据库表结构
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('projects', 'categories', 'tags', 'skills', 'social_links', 'system_settings', 'profiles')
ORDER BY table_name, ordinal_position;

-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
