-- 为social_links表添加name字段
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';

-- 更新现有数据，从URL提取名称
UPDATE social_links 
SET name = CASE 
    WHEN url LIKE '%github%' THEN 'GitHub'
    WHEN url LIKE '%linkedin%' THEN 'LinkedIn'
    WHEN url LIKE '%twitter%' THEN 'Twitter'
    WHEN url LIKE '%facebook%' THEN 'Facebook'
    WHEN url LIKE '%instagram%' THEN 'Instagram'
    WHEN url LIKE '%youtube%' THEN 'YouTube'
    WHEN url LIKE '%weibo%' THEN '微博'
    WHEN url LIKE '%zhihu%' THEN '知乎'
    ELSE 'Website'
END
WHERE name = '' OR name IS NULL;

-- 为name字段添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_social_links_name ON social_links(name);
