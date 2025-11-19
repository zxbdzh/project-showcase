import { ref, computed, readonly } from 'vue'
import { supabase, type Profile, type ProfileInsert } from '@/utils/supabase'

// 用户状态
const user = ref<any>(null)
const profile = ref<Profile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 计算属性
const isAuthenticated = computed(() => !!user.value)
const isAdmin = computed(() => profile.value?.status === 'active')
const userInitials = computed(() => {
  if (!profile.value?.full_name) return 'U'
  return profile.value.full_name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  user.value = session?.user ?? null

  if (session?.user) {
    fetchProfile(session.user.id)
  } else {
    profile.value = null
  }
})

// 获取用户档案
const fetchProfile = async (userId: string) => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      // 如果档案不存在，创建一个
      if (fetchError.code === 'PGRST116') {
        await createProfile(userId)
      } else {
        throw fetchError
      }
    } else {
      profile.value = data
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取用户档案失败'
    console.error('Fetch profile error:', err)
  } finally {
    loading.value = false
  }
}

// 创建用户档案
const createProfile = async (userId: string) => {
  try {
    const profileData: ProfileInsert = {
      id: userId,
      full_name: user.value?.user_metadata?.full_name || '',
      username: user.value?.user_metadata?.username || '',
      bio: '',
      status: 'active',
    }

    const { data, error: createError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (createError) throw createError
    profile.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '创建用户档案失败'
    console.error('Create profile error:', err)
  }
}

// 注册
const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  try {
    loading.value = true
    error.value = null

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (signUpError) throw signUpError

    return { success: true, data }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '注册失败'
    error.value = errorMessage
    console.error('Sign up error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 登录
const signIn = async (email: string, password: string) => {
  try {
    loading.value = true
    error.value = null

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError

    return { success: true, data }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '登录失败'
    error.value = errorMessage
    console.error('Sign in error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 登出
const signOut = async () => {
  try {
    loading.value = true
    error.value = null

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) throw signOutError

    user.value = null
    profile.value = null
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '登出失败'
    error.value = errorMessage
    console.error('Sign out error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 重置密码
const resetPassword = async (email: string) => {
  try {
    loading.value = true
    error.value = null

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

    if (resetError) throw resetError

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '重置密码失败'
    error.value = errorMessage
    console.error('Reset password error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 更新用户档案
const updateProfile = async (updates: Partial<Profile>) => {
  if (!profile.value) return { success: false, error: '用户未登录' }

  try {
    loading.value = true
    error.value = null

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.value.id)
      .select()
      .single()

    if (updateError) throw updateError

    profile.value = { ...profile.value, ...data }
    return { success: true, data }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '更新档案失败'
    error.value = errorMessage
    console.error('Update profile error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 更新密码
const updatePassword = async (newPassword: string) => {
  try {
    loading.value = true
    error.value = null

    // 更新密码 - 使用Supabase内置的updateUser方法
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) throw updateError

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '更新密码失败'
    error.value = errorMessage
    console.error('Update password error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 删除账户
const deleteAccount = async () => {
  if (!user.value) return { success: false, error: '用户未登录' }

  try {
    loading.value = true
    error.value = null

    // 先删除用户档案
    if (profile.value) {
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.value.id)

      if (deleteProfileError) throw deleteProfileError
    }

    // 删除用户认证记录
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.value.id)

    if (deleteUserError) throw deleteUserError

    user.value = null
    profile.value = null
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '删除账户失败'
    error.value = errorMessage
    console.error('Delete account error:', err)
    return { success: false, error: errorMessage }
  } finally {
    loading.value = false
  }
}

// 清除错误
const clearError = () => {
  error.value = null
}

export const useAuth = () => {
  return {
    // 状态
    user: readonly(user),
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),

    // 计算属性
    isAuthenticated,
    isAdmin,
    userInitials,

    // 方法
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    deleteAccount,
    clearError,
    fetchProfile,
  }
}
