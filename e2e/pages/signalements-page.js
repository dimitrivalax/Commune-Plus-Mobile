import { expect } from '@playwright/test'

export class SignalementsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.filterLabel = page.getByText('Filtrer par statut')
    this.emptyTitle = page.getByRole('heading', { name: 'Aucun signalement' })
    this.listItems = page.locator('.signalement-item')
  }

  async goto() {
    await this.page.goto('/tabs/signalements')
    await expect(this.page).toHaveURL(/\/tabs\/signalements$/)
  }

  async expectBaseUiVisible() {
    await expect(this.filterLabel).toBeVisible()
  }

  async expectListOrEmptyState() {
    await expect
      .poll(async () => {
        const count = await this.listItems.count()
        if (count > 0) return 'list'
        const hasEmptyTitle = await this.emptyTitle
          .isVisible()
          .catch(() => false)
        return hasEmptyTitle ? 'empty' : 'loading'
      })
      .toMatch(/^(list|empty)$/)
  }
}
