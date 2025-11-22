import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { supabase } from '@/utils/supabase'

export interface CustomIcon {
  id: string
  name: string
  type: 'svg' | 'fa'
  url?: string
  icon_name?: string
  user_id: string
  created_at: string
  updated_at: string
}

export function useCustomIcons() {
  const { user } = useAuth()

  const customIcons = ref<CustomIcon[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载自定义图标
  const loadCustomIcons = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      // 从数据库获取
      const { data, error } = await supabase
        .from('custom_icons')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      customIcons.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载自定义图标失败'
      console.error('加载自定义图标失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 添加自定义图标
  const addCustomIcon = async (
    icon: Omit<CustomIcon, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ) => {
    if (!user.value) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('custom_icons')
      .insert({
        ...icon,
        user_id: user.value.id,
      })
      .select()
      .single()

    if (error) throw error

    const newIcon = data as CustomIcon
    customIcons.value.unshift(newIcon)

    return newIcon
  }

  // 删除自定义图标
  const removeCustomIcon = async (id: string) => {
    const { error } = await supabase.from('custom_icons').delete().eq('id', id)

    if (error) throw error

    const index = customIcons.value.findIndex((icon) => icon.id === id)
    if (index > -1) {
      customIcons.value.splice(index, 1)
    }
  }

  // 更新自定义图标
  const updateCustomIcon = async (id: string, updates: Partial<CustomIcon>) => {
    const { data, error } = await supabase
      .from('custom_icons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const updatedIcon = data as CustomIcon
    const index = customIcons.value.findIndex((icon) => icon.id === id)
    if (index > -1) {
      customIcons.value[index] = updatedIcon
    }

    return updatedIcon
  }

  return {
    customIcons: computed(() => customIcons.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadCustomIcons,
    addCustomIcon,
    removeCustomIcon,
    updateCustomIcon,
  }
}
