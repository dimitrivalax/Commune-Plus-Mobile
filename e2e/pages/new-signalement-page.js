import { expect } from '@playwright/test'

export class NewSignalementPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.pageTitle = page.locator('ion-title', {
      hasText: 'Nouveau signalement'
    })
    this.descriptionLabel = page.getByText('Description du signalement')
    this.submitButton = page.getByRole('button', {
      name: 'Envoyer le signalement'
    })
  }

  async goto() {
    await this.page.goto('/signalement/new')
    await expect(this.page).toHaveURL(/\/signalement\/new$/)
  }

  async expectBaseUiVisible() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.descriptionLabel).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectSubmitDisabledWithoutRequiredData() {
    await expect(this.submitButton).toBeDisabled()
  }

  async submit() {
    await this.submitButton.click()
  }

  async expectSuccessAndRedirect() {
    await expect(
      this.page.getByText('Signalement envoyé avec succès')
    ).toBeVisible()
    await expect(this.page).toHaveURL(/\/tabs\/signalements$/)
  }
}
