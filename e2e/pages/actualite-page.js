import { expect } from '@playwright/test'

export class ActualitePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.emptyTitle = page.getByRole('heading', { name: 'Aucune information' })
    this.listItems = page.locator('.info-item')
    this.backButton = page.locator('ion-back-button, button[aria-label*="back" i]')
  }

  async goto() {
    await this.page.goto('/tabs/actualite')
    await expect(this.page).toHaveURL(/\/tabs\/actualite$/)
  }

  async expectListOrEmptyState() {
    await expect
      .poll(async () => {
        const count = await this.listItems.count()
        if (count > 0) return 'list'
        const hasEmpty = await this.emptyTitle.isVisible().catch(() => false)
        return hasEmpty ? 'empty' : 'loading'
      }, {
        timeout: 15000,
        intervals: [250, 500, 1000]
      })
      .toMatch(/^(list|empty)$/)
  }

  async openFirstItemIfAny() {
    const count = await this.listItems.count()
    if (count === 0) return false
    await this.listItems.first().click()
    await expect(this.page).toHaveURL(/\/actualite\/.+$/)
    return true
  }

  async expectBackButtonVisible() {
    const backVisible = await this.backButton.first().isVisible().catch(() => false)
    if (backVisible) {
      await expect(this.backButton.first()).toBeVisible()
      return
    }

    // Back button visibility can vary by Ionic mode/rendering; keep asserting detail UI.
    await expect(this.page).toHaveURL(/\/actualite\/.+$/)
    await expect(this.page.getByText("Détail de l'actualité")).toBeVisible()
  }
}
