-- 创建项目分类关联表
CREATE TABLE IF NOT EXISTS project_categories (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- 创建项目标签关联表
CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- 为关联表创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_project_categories_project_id ON project_categories(project_id);
CREATE INDEX IF NOT EXISTS idx_project_categories_category_id ON project_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags(tag_id);

-- 启用RLS (Row Level Security)
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能操作自己项目的关联
CREATE POLICY "Users can manage their own project categories" ON project_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_categories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own project tags" ON project_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- 插入一些示例数据
INSERT INTO categories (id, name, description, color, icon, sort_order, user_id) VALUES
  ('cat-1', 'Web开发', 'Web应用开发相关项目', '#3B82F6', '🌐', 1, 'demo-user'),
  ('cat-2', '移动开发', '移动应用开发项目', '#10B981', '📱', 2, 'demo-user'),
  ('cat-3', '数据分析', '数据分析和可视化项目', '#F59E0B', '📊', 3, 'demo-user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tags (id, name, color, user_id) VALUES
  ('tag-1', 'Vue.js', '#42D392', 'demo-user'),
  ('tag-2', 'React', '#61DAFB', 'demo-user'),
  ('tag-3', 'TypeScript', '#3178C6', 'demo-user'),
  ('tag-4', 'Node.js', '#339933', 'demo-user'),
  ('tag-5', 'Python', '#3776AB', 'demo-user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (id, name, category, level, years_experience, projects_count, icon, color, user_id) VALUES
  ('skill-1', 'Vue.js', 'Frontend', 90, 3, 5, '🌿', '#42D392', 'demo-user'),
  ('skill-2', 'React', 'Frontend', 85, 2, 3, '⚛️', '#61DAFB', 'demo-user'),
  ('skill-3', 'TypeScript', 'Language', 80, 3, 8, '📘', '#3178C6', 'demo-user'),
  ('skill-4', 'Node.js', 'Backend', 75, 3, 6, '🟢', '#339933', 'demo-user'),
  ('skill-5', 'Python', 'Language', 70, 2, 4, '🐍', '#3776AB', 'demo-user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO social_links (id, name, url, icon, sort_order, user_id) VALUES
  ('link-1', 'GitHub', 'https://github.com', '🐙', 1, 'demo-user'),
  ('link-2', 'LinkedIn', 'https://linkedin.com', '💼', 2, 'demo-user'),
  ('link-3', 'Twitter', 'https://twitter.com', '🐦', 3, 'demo-user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_settings (key, value, description, type, user_id) VALUES
  ('site_title', 'Project Showcase', '网站标题', 'string', 'demo-user'),
  ('site_description', '展示我的项目作品集', '网站描述', 'string', 'demo-user'),
  ('theme_color', '#3B82F6', '主题颜色', 'string', 'demo-user'),
  ('contact_email', 'demo@example.com', '联系邮箱', 'string', 'demo-user')
ON CONFLICT (key) DO NOTHING;
