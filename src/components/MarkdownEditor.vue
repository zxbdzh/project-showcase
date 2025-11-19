<template>
  <div class="markdown-editor">
    <div class="markdown-editor__toolbar">
      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="粗体" placement="top">
            <el-button size="small" @click="formatText('bold')">
              <el-icon><Bold /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="斜体" placement="top">
            <el-button size="small" @click="formatText('italic')">
              <el-icon><Italic /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除线" placement="top">
            <el-button size="small" @click="formatText('strike')">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="标题1" placement="top">
            <el-button size="small" @click="insertHeading(1)">H1</el-button>
          </el-tooltip>
          <el-tooltip content="标题2" placement="top">
            <el-button size="small" @click="insertHeading(2)">H2</el-button>
          </el-tooltip>
          <el-tooltip content="标题3" placement="top">
            <el-button size="small" @click="insertHeading(3)">H3</el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="无序列表" placement="top">
            <el-button size="small" @click="insertList('unordered')">
              <el-icon><List /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="有序列表" placement="top">
            <el-button size="small" @click="insertList('ordered')">
              <el-icon><Sort /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="任务列表" placement="top">
            <el-button size="small" @click="insertTaskList">
              <el-icon><Check /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="链接" placement="top">
            <el-button size="small" @click="insertLink">
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="图片" placement="top">
            <el-button size="small" @click="insertImage">
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="代码" placement="top">
            <el-button size="small" @click="insertCode">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="引用" placement="top">
            <el-button size="small" @click="insertQuote">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="分割线" placement="top">
            <el-button size="small" @click="insertHorizontalRule">
              <el-icon><Minus /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="表格" placement="top">
            <el-button size="small" @click="insertTable">
              <el-icon><Grid /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-button-group>
          <el-tooltip content="撤销" placement="top">
            <el-button size="small" @click="undo">
              <el-icon><RefreshLeft /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重做" placement="top">
            <el-button size="small" @click="redo">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="markdown-editor__toolbar-group">
        <el-tooltip content="预览" placement="top">
          <el-button
            size="small"
            :type="showPreview ? 'primary' : 'default'"
            @click="togglePreview"
          >
            <el-icon><View /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <el-button
            size="small"
            :type="isFullscreen ? 'primary' : 'default'"
            @click="toggleFullscreen"
          >
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div
      class="markdown-editor__content"
      :class="{ 'markdown-editor__content--fullscreen': isFullscreen }"
    >
      <div class="markdown-editor__editor">
        <textarea
          ref="editorRef"
          v-model="content"
          :placeholder="placeholder"
          class="markdown-editor__textarea"
          @input="handleInput"
          @keydown="handleKeydown"
          @scroll="syncScroll"
        />
      </div>

      <div v-if="showPreview" class="markdown-editor__preview" @scroll="syncScroll">
        <div class="markdown-editor__preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <div class="markdown-editor__status">
      <span class="markdown-editor__word-count"> {{ wordCount }} 字符 | {{ lineCount }} 行 </span>
      <span class="markdown-editor__mode">
        {{ showPreview ? '预览模式' : '编辑模式' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  Bold,
  Italic,
  Delete,
  List,
  Sort,
  Check,
  Link,
  Picture,
  DocumentCopy,
  ChatDotRound,
  Minus,
  Grid,
  RefreshLeft,
  RefreshRight,
  View,
  FullScreen,
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Props
interface Props {
  modelValue: string
  placeholder?: string
  height?: string
  showPreview?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入Markdown内容...',
  height: '400px',
  showPreview: false,
  theme: 'light',
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const editorRef = ref<HTMLTextAreaElement>()
const content = ref(props.modelValue)
const showPreview = ref(props.showPreview)
const isFullscreen = ref(false)
const history = ref<string[]>([props.modelValue])
const historyIndex = ref(0)

// 计算属性
const wordCount = computed(() => content.value.length)
const lineCount = computed(() => content.value.split('\n').length)

const previewHtml = computed(() => {
  if (!content.value) return ''

  try {
    const html = marked.parse(content.value, {
      breaks: true,
      gfm: true,
    })

    // 使用DOMPurify清理HTML
    return DOMPurify.sanitize(html)
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return '<p>Markdown解析错误</p>'
  }
})

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== content.value) {
      content.value = newValue
      updateHistory()
    }
  },
)

// 监听content变化
watch(content, (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
})

// 方法
function handleInput() {
  updateHistory()
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl/Cmd + B: 粗体
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    formatText('bold')
  }
  // Ctrl/Cmd + I: 斜体
  else if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault()
    formatText('italic')
  }
  // Ctrl/Cmd + Z: 撤销
  else if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  // Ctrl/Cmd + Shift + Z: 重做
  else if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
    event.preventDefault()
    redo()
  }
  // Tab: 缩进
  else if (event.key === 'Tab') {
    event.preventDefault()
    insertTab()
  }
}

function formatText(command: string) {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  let newText = ''

  switch (command) {
    case 'bold':
      newText = `**${selectedText}**`
      break
    case 'italic':
      newText = `*${selectedText}*`
      break
    case 'strike':
      newText = `~~${selectedText}~~`
      break
  }

  replaceText(newText, start, end)
}

function insertHeading(level: number) {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const prefix = '#'.repeat(level) + ' '
  const newText = prefix + selectedText

  replaceText(newText, start, end)
}

function insertList(type: 'ordered' | 'unordered') {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const prefix = type === 'ordered' ? '1. ' : '- '
  const newText = prefix + selectedText

  replaceText(newText, start, end)
}

function insertTaskList() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = '- [ ] ' + selectedText

  replaceText(newText, start, end)
}

function insertLink() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = `[${selectedText}](url)`

  replaceText(newText, start, end)
}

function insertImage() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = `![${selectedText}](image-url)`

  replaceText(newText, start, end)
}

function insertCode() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = `\`${selectedText}\``

  replaceText(newText, start, end)
}

function insertQuote() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = `> ${selectedText}`

  replaceText(newText, start, end)
}

function insertHorizontalRule() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const newText = '\n---\n'

  replaceText(newText, start, start)
}

function insertTable() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const tableText = '\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容1 | 内容2 | 内容3 |\n'

  replaceText(tableText, start, start)
}

function insertTab() {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  replaceText('  ', start, start) // 使用两个空格代替Tab
}

function replaceText(newText: string, start: number, end: number) {
  const textarea = editorRef.value
  if (!textarea) return

  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(end)
  content.value = beforeText + newText + afterText

  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + newText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

function updateHistory() {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(content.value)
  historyIndex.value = history.value.length - 1

  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value = history.value.slice(-50)
    historyIndex.value = history.value.length - 1
  }
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    content.value = history.value[historyIndex.value]
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    content.value = history.value[historyIndex.value]
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function syncScroll(event: Event) {
  if (!showPreview.value) return

  const editor = event.target as HTMLTextAreaElement
  const preview = document.querySelector('.markdown-editor__preview') as HTMLElement

  if (editor && preview) {
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  }
}
</script>

<style scoped>
.markdown-editor {
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  overflow: hidden;
}

.markdown-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.markdown-editor__toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.markdown-editor__content {
  display: flex;
  height: v-bind(height);
  min-height: 300px;
}

.markdown-editor__content--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  height: 100vh;
  background: var(--bg-primary);
}

.markdown-editor__editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-editor__textarea {
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.markdown-editor__preview {
  flex: 1;
  padding: 16px;
  border-left: 1px solid var(--border-primary);
  overflow-y: auto;
  background: var(--bg-secondary);
}

.markdown-editor__preview-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Markdown样式 */
.markdown-editor__preview-content :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-primary);
}

.markdown-editor__preview-content :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-secondary);
}

.markdown-editor__preview-content :deep(h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.83em 0;
}

.markdown-editor__preview-content :deep(p) {
  margin: 1em 0;
}

.markdown-editor__preview-content :deep(ul),
.markdown-editor__preview-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-editor__preview-content :deep(li) {
  margin: 0.5em 0;
}

.markdown-editor__preview-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--primary-color);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.markdown-editor__preview-content :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background: var(--bg-tertiary);
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-editor__preview-content :deep(pre) {
  padding: 1em;
  margin: 1em 0;
  overflow: auto;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-editor__preview-content :deep(pre code) {
  padding: 0;
  background: none;
}

.markdown-editor__preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-editor__preview-content :deep(th),
.markdown-editor__preview-content :deep(td) {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-primary);
}

.markdown-editor__preview-content :deep(th) {
  font-weight: bold;
  background: var(--bg-tertiary);
}

.markdown-editor__preview-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.markdown-editor__preview-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-editor__preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

.markdown-editor__preview-content :deep(hr) {
  border: none;
  height: 1px;
  background: var(--border-primary);
  margin: 2em 0;
}

.markdown-editor__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  font-size: 12px;
  color: var(--text-secondary);
}

.markdown-editor__word-count {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-editor__mode {
  font-weight: 500;
}

/* 深色主题适配 */
:deep(.dark) .markdown-editor {
  border-color: var(--border-secondary);
}

:deep(.dark) .markdown-editor__toolbar {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

:deep(.dark) .markdown-editor__textarea {
  background: var(--bg-primary);
  color: var(--text-primary);
}

:deep(.dark) .markdown-editor__preview {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

:deep(.dark) .markdown-editor__status {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-editor__toolbar {
    padding: 6px 8px;
    gap: 4px;
  }

  .markdown-editor__toolbar-group {
    gap: 2px;
  }

  .markdown-editor__content {
    flex-direction: column;
    height: 500px;
  }

  .markdown-editor__preview {
    border-left: none;
    border-top: 1px solid var(--border-primary);
    max-height: 250px;
  }

  .markdown-editor__textarea,
  .markdown-editor__preview-content {
    padding: 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .markdown-editor__toolbar {
    padding: 4px 6px;
  }

  .markdown-editor__content {
    height: 400px;
  }

  .markdown-editor__textarea,
  .markdown-editor__preview-content {
    padding: 8px;
    font-size: 12px;
  }
}
</style>
