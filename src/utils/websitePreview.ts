// 网站预览工具类
export class WebsitePreviewService {
  /**
   * 获取网站预览图片URL
   * @param url 网站URL
   * @returns 预览图片URL
   */
  static async getPreviewImage(url: string): Promise<string> {
    try {
      // 验证URL格式
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format')
      }

      // 由于第三方API不稳定，返回默认占位图
      return this.getDefaultPlaceholder()
    } catch (error) {
      console.error('Failed to generate preview:', error)
      return this.getDefaultPlaceholder()
    }
  }

  /**
   * 验证URL格式
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 格式化URL，确保有协议
   */
  private static formatUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  /**
   * 获取默认占位图片
   */
  private static getDefaultPlaceholder(): string {
    // 使用项目中的默认占位图
    return '/placeholder-project.svg'
  }

  /**
   * 生成网站缩略图URL（使用更简单的服务）
   */
  static getSimpleThumbnail(): string {
    // 直接返回占位图，避免使用不稳定的第三方API
    return '/placeholder-project.svg'
  }

  /**
   * 生成网站二维码预览
   */
  static generateQRCode(url: string): string {
    const formattedUrl = this.formatUrl(url)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formattedUrl)}`
  }

  /**
   * 获取网站图标（更可靠的方式）
   */
  static getWebsiteIcon(url: string): string {
    const formattedUrl = this.formatUrl(url)

    try {
      const domain = new URL(formattedUrl).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return '/placeholder-project.svg'
    }
  }

  /**
   * 获取网站域名
   */
  static getWebsiteDomain(url: string): string {
    try {
      const formattedUrl = this.formatUrl(url)
      return new URL(formattedUrl).hostname
    } catch {
      return url
    }
  }

  /**
   * 获取网站标题（用于显示）
   */
  static getWebsiteTitle(url: string): string {
    try {
      const domain = this.getWebsiteDomain(url)
      return domain.replace('www.', '').charAt(0).toUpperCase() + domain.replace('www.', '').slice(1)
    } catch {
      return 'Website'
    }
  }
}

// 导出便捷函数
export const getWebsitePreview = (url: string) => WebsitePreviewService.getPreviewImage(url)
export const getWebsiteThumbnail = () => WebsitePreviewService.getSimpleThumbnail()
export const generateQRCode = (url: string) => WebsitePreviewService.generateQRCode(url)
export const getWebsiteIcon = (url: string) => WebsitePreviewService.getWebsiteIcon(url)
export const getWebsiteDomain = (url: string) => WebsitePreviewService.getWebsiteDomain(url)
export const getWebsiteTitle = (url: string) => WebsitePreviewService.getWebsiteTitle(url)
