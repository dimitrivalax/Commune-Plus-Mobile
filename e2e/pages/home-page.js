import { expect } from '@playwright/test'

export class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.emptyTitle = page.getByRole('heading', { name: 'Aucune information communale' })
    this.errorTitle = page.getByRole('heading', {
      name: 'Impossible de charger les informations'
    })
    this.cards = page.locator('.info-card')
  }

  async goto() {
    await this.page.goto('/tabs/home')
    await expect(this.page).toHaveURL(/\/tabs\/home$/)
  }

  async expectCardsOrStateMessage() {
    await expect
      .poll(async () => {
        if ((await this.cards.count()) > 0) return 'cards'
        if (await this.emptyTitle.isVisible().catch(() => false)) return 'empty'
        if (await this.errorTitle.isVisible().catch(() => false)) return 'error'
        return 'loading'
      })
      .toMatch(/^(cards|empty|error)$/)
  }
}
