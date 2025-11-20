// 导入各风格的 Free 图标包
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

// 图标信息接口
export interface FontAwesomeIcon {
  name: string
  styles: string[]
  label?: string
}

// 获取所有图标名称
function getIconNames(iconSet: any): string[] {
  return Object.keys(iconSet).filter((key) => key !== 'prefix' && key !== 'default')
}

// 合并所有 Free 图标（去重，按名称分组）
export function getAllFreeIcons(): FontAwesomeIcon[] {
  const solidNames = getIconNames(fas)
  const regularNames = getIconNames(far)
  const brandNames = getIconNames(fab)

  // 合并所有图标名称
  const allNames = [...new Set([...solidNames, ...regularNames, ...brandNames])]

  const iconMap = new Map<string, FontAwesomeIcon>()

  allNames.forEach((name) => {
    const styles: string[] = []
    if (solidNames.includes(name)) styles.push('fas')
    if (regularNames.includes(name)) styles.push('far')
    if (brandNames.includes(name)) styles.push('fab')

    iconMap.set(name, {
      name,
      styles,
      label: name, // 可以在这里添加中文映射
    })
  })

  return Array.from(iconMap.values())
}

// 按风格分类图标
export function getIconsByStyle() {
  const allIcons = getAllFreeIcons()

  return {
    solid: allIcons.filter((icon) => icon.styles.includes('fas')),
    regular: allIcons.filter((icon) => icon.styles.includes('far')),
    brands: allIcons.filter((icon) => icon.styles.includes('fab')),
  }
}

// 获取图标的完整路径
export function getIconPath(iconName: string, preferredStyle?: string): string {
  const allIcons = getAllFreeIcons()
  const icon = allIcons.find((icon) => icon.name === iconName)

  if (!icon) {
    // 如果找不到图标，返回默认的solid图标
    return `fa-solid fa-${iconName}`
  }

  // 优先使用指定风格，否则按优先级选择
  let selectedStyle = preferredStyle

  if (!selectedStyle || !icon.styles.includes(selectedStyle)) {
    // 风格优先级：solid > regular > brands
    if (icon.styles.includes('fas')) {
      selectedStyle = 'fas'
    } else if (icon.styles.includes('far')) {
      selectedStyle = 'far'
    } else if (icon.styles.includes('fab')) {
      selectedStyle = 'fab'
    } else {
      selectedStyle = 'fas' // 默认
    }
  }

  return `${selectedStyle} fa-${iconName}`
}

// 搜索图标
export function searchIcons(query: string): FontAwesomeIcon[] {
  const allIcons = getAllFreeIcons()
  const lowerQuery = query.toLowerCase()

  return allIcons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      (icon.label && icon.label.toLowerCase().includes(lowerQuery)),
  )
}

// 按分类获取图标（基于常用分类）
export function getIconsByCategory() {
  const allIcons = getAllFreeIcons()

  // 常用分类关键词
  const categories = {
    interface: [
      'user',
      'people',
      'person',
      'login',
      'logout',
      'home',
      'house',
      'building',
      'cog',
      'gear',
      'setting',
      'menu',
      'nav',
      'arrow',
      'chevron',
      'caret',
      'angle',
    ],
    arrow: [
      'arrow',
      'chevron',
      'caret',
      'angle',
      'left',
      'right',
      'up',
      'down',
      'direction',
      'point',
      'back',
      'forward',
    ],
    media: [
      'play',
      'pause',
      'stop',
      'video',
      'camera',
      'image',
      'photo',
      'music',
      'audio',
      'sound',
      'volume',
      'film',
      'movie',
      'tv',
      'screen',
      'display',
    ],
    file: [
      'file',
      'folder',
      'document',
      'archive',
      'zip',
      'download',
      'upload',
      'save',
      'copy',
      'paste',
      'cut',
      'edit',
      'delete',
      'trash',
      'pdf',
      'word',
      'excel',
      'powerpoint',
    ],
    brand: [
      'facebook',
      'twitter',
      'google',
      'apple',
      'microsoft',
      'github',
      'linkedin',
      'instagram',
      'youtube',
      'chrome',
      'firefox',
      'safari',
      'vue',
      'react',
      'angular',
      'node',
      'npm',
      'docker',
      'linux',
      'windows',
      'android',
    ],
  }

  const result: Record<string, string[]> = {}

  Object.entries(categories).forEach(([category, keywords]) => {
    result[category] = allIcons
      .filter((icon) =>
        keywords.some(
          (keyword) =>
            icon.name.toLowerCase().includes(keyword) ||
            (icon.label && icon.label.toLowerCase().includes(keyword)),
        ),
      )
      .map((icon) => icon.name)
  })

  return result
}

// 检查图标是否存在
export function iconExists(iconName: string): boolean {
  const allIcons = getAllFreeIcons()
  return allIcons.some((icon) => icon.name === iconName)
}

// 获取图标的所有可用风格
export function getIconStyles(iconName: string): string[] {
  const allIcons = getAllFreeIcons()
  const icon = allIcons.find((icon) => icon.name === iconName)
  return icon ? icon.styles : []
}
