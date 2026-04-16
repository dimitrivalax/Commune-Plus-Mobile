import { expect } from '@playwright/test'

export class SettingsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.pageTitle = page.locator('ion-title', { hasText: 'Paramètres' })
    this.userSection = page.getByRole('heading', { name: 'Mes coordonnées' })
    this.citySection = page.getByRole('heading', { name: 'Informations de la commune' })
  }

  async goto() {
    await this.page.goto('/settings')
    await expect(this.page).toHaveURL(/\/settings$/)
  }

  async expectBaseUiVisible() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.userSection).toBeVisible()
    await expect(this.citySection).toBeVisible()
  }
}
