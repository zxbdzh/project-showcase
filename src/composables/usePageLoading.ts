import { computed, reactive } from 'vue'

export interface LoadingTask {
  id: string
  name: string
  progress?: number
  status: 'pending' | 'loading' | 'completed' | 'error'
  priority: number
}

export interface PageLoadingState {
  isLoading: boolean
  progress: number
  currentTask: string | null
  tasks: LoadingTask[]
  startTime: number | null
  message: string
}

class PageLoadingManager {
  private state = reactive<PageLoadingState>({
    isLoading: false,
    progress: 0,
    currentTask: null,
    tasks: [],
    startTime: null,
    message: '系统初始化中...',
  })

  // 获取当前状态
  getState() {
    return this.state
  }

  // 计算整体进度
  private calculateProgress() {
    if (this.state.tasks.length === 0) {
      this.state.progress = 0
      return
    }

    const totalTasks = this.state.tasks.length
    const completedTasks = this.state.tasks.filter((task) => task.status === 'completed').length
    const tasksWithProgress = this.state.tasks.filter((task) => task.progress !== undefined)

    let progressSum = completedTasks * 100

    if (tasksWithProgress.length > 0) {
      const avgProgress =
        tasksWithProgress.reduce((sum, task) => sum + (task.progress || 0), 0) /
        tasksWithProgress.length
      progressSum += (avgProgress * (totalTasks - completedTasks)) / totalTasks
    }

    this.state.progress = Math.round(progressSum / totalTasks)
  }

  // 更新当前任务
  private updateCurrentTask() {
    const activeTasks = this.state.tasks
      .filter((task) => task.status === 'loading')
      .sort((a, b) => b.priority - a.priority)

    this.state.currentTask = activeTasks[0]?.name || null
  }

  // 添加加载任务
  addTask(task: Omit<LoadingTask, 'status'>): void {
    const newTask: LoadingTask = {
      ...task,
      status: 'pending',
    }

    // 检查是否已存在相同任务
    const existingIndex = this.state.tasks.findIndex((t) => t.id === task.id)
    if (existingIndex >= 0) {
      this.state.tasks[existingIndex] = newTask
    } else {
      this.state.tasks.push(newTask)
    }

    // 按优先级排序
    this.state.tasks.sort((a, b) => b.priority - a.priority)

    // 如果是第一个任务，开始加载
    if (this.state.tasks.length === 1 || !this.state.isLoading) {
      this.startLoading()
    }

    this.updateCurrentTask()
    this.calculateProgress()
  }

  // 更新任务状态
  updateTask(id: string, updates: Partial<Pick<LoadingTask, 'status' | 'progress'>>): void {
    const task = this.state.tasks.find((t) => t.id === id)
    if (!task) return

    Object.assign(task, updates)

    this.updateCurrentTask()
    this.calculateProgress()

    // 检查是否所有任务都完成
    const allCompleted = this.state.tasks.every(
      (t) => t.status === 'completed' || t.status === 'error',
    )
    if (allCompleted && this.state.tasks.length > 0) {
      setTimeout(() => {
        this.completeLoading()
      }, 500) // 延迟500ms显示完成状态
    }
  }

  // 更新消息
  updateMessage(message: string): void {
    this.state.message = message
  }

  // 开始加载
  private startLoading(): void {
    this.state.isLoading = true
    this.state.startTime = Date.now()
    this.state.progress = 0
    this.state.currentTask = null
  }

  // 完成加载
  private completeLoading(): void {
    this.state.isLoading = false
    this.state.progress = 100
    this.state.currentTask = null
    this.state.message = '系统就绪'

    // 清理已完成的任务
    setTimeout(() => {
      this.state.tasks = []
      this.state.message = '系统初始化中...'
      this.state.startTime = null
    }, 1000)
  }

  // 强制完成（用于紧急情况）
  forceComplete(): void {
    this.state.tasks.forEach((task) => {
      if (task.status !== 'completed') {
        task.status = 'completed'
        task.progress = 100
      }
    })
    this.completeLoading()
  }

  // 重置状态
  reset(): void {
    this.state.tasks = []
    this.state.isLoading = false
    this.state.progress = 0
    this.state.currentTask = null
    this.state.message = '系统初始化中...'
    this.state.startTime = null
  }

  // 获取加载时间
  getLoadingTime(): number {
    if (!this.state.startTime) return 0
    return Date.now() - this.state.startTime
  }
}

// 创建全局实例
const pageLoadingManager = new PageLoadingManager()

// 导出组合式函数
export function usePageLoading() {
  const state = computed(() => pageLoadingManager.getState())

  return {
    state,
    addTask: pageLoadingManager.addTask.bind(pageLoadingManager),
    updateTask: pageLoadingManager.updateTask.bind(pageLoadingManager),
    updateMessage: pageLoadingManager.updateMessage.bind(pageLoadingManager),
    forceComplete: pageLoadingManager.forceComplete.bind(pageLoadingManager),
    reset: pageLoadingManager.reset.bind(pageLoadingManager),
    getLoadingTime: pageLoadingManager.getLoadingTime.bind(pageLoadingManager),
  }
}

// 导出全局管理器实例（用于直接调用）
export { pageLoadingManager }
