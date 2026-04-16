import { expect } from '@playwright/test'

export class ReservationsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.emptyTitle = page.getByRole('heading', { name: 'Aucune réservation' })
    this.listItems = page.locator('.reservation-item')
  }

  async goto() {
    await this.page.goto('/tabs/reservations')
    await expect(this.page).toHaveURL(/\/tabs\/reservations$/)
  }

  async expectListOrEmptyState() {
    await expect
      .poll(async () => {
        const count = await this.listItems.count()
        if (count > 0) return 'list'
        const hasEmpty = await this.emptyTitle.isVisible().catch(() => false)
        return hasEmpty ? 'empty' : 'loading'
      })
      .toMatch(/^(list|empty)$/)
  }

  async openFirstItemIfAny() {
    const count = await this.listItems.count()
    if (count === 0) return false
    await this.listItems.first().click()
    await expect(this.page).toHaveURL(/\/reservation\/.+$/)
    return true
  }
}
