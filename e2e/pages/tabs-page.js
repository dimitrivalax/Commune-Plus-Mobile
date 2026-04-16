import { expect } from '@playwright/test'
import { dismissOnboardingIfPresent, openTabsHome } from '../fixtures/navigation'

export class TabsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  async gotoHome() {
    await openTabsHome(this.page)
  }

  async dismissOnboardingIfVisible() {
    await dismissOnboardingIfPresent(this.page)
  }

  async goToSignalementsWithTab() {
    await this.dismissOnboardingIfVisible()
    const signalementsTab = this.page.locator('#tab-button-signalements')
    const tabVisible = await signalementsTab.isVisible().catch(() => false)
    if (tabVisible) {
      await signalementsTab.click()
    } else {
      // Some Ionic renders do not expose the tab bar in headless mode.
      await this.page.goto('/tabs/signalements')
    }
    await expect(this.page).toHaveURL(/\/tabs\/signalements$/)
  }

  async goToHomeRoute() {
    await openTabsHome(this.page)
  }
}
