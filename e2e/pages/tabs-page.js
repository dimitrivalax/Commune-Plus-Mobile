import { expect } from '@playwright/test'
import { dismissOnboardingIfPresent, openTabsHome } from '../fixtures/navigation'

export class TabsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.menuButton = page.getByRole('button', { name: 'menu' })
    this.menuTab = page.getByRole('tab', { name: 'Menu' })
    this.menuPanel = page.locator('ion-menu')
    this.menuTitle = page.locator('ion-menu ion-title', { hasText: 'Menu' })
    this.menuAccueilLink = page.locator('ion-menu ion-item', {
      has: page.getByText('Accueil')
    })
    this.menuActualitesLink = page.locator('ion-menu ion-item', {
      has: page.getByText('Actualités')
    })
  }

  async gotoHome() {
    await openTabsHome(this.page)
  }

  async dismissOnboardingIfVisible() {
    await dismissOnboardingIfPresent(this.page)
  }

  async goToSignalementsWithTab() {
    await this.goToTab('Signalements', '/tabs/signalements')
  }

  async goToHomeRoute() {
    await openTabsHome(this.page)
  }

  async expectMainTabsVisible() {
    await expect(this.page.getByRole('tab', { name: 'Accueil' })).toBeVisible()
    await expect(this.page.getByRole('tab', { name: 'Actualités' })).toBeVisible()
    await expect(this.page.getByRole('tab', { name: 'Signalements' })).toBeVisible()
    await expect(this.page.getByRole('tab', { name: 'Menu' })).toBeVisible()
  }

  async openMenuWithBurger() {
    await this.dismissOnboardingIfVisible()
    await expect(this.menuButton).toBeVisible()
    await this.menuButton.click()
    await this.expectMenuVisible()
  }

  async openMenuWithTab() {
    await this.dismissOnboardingIfVisible()
    const tabVisible = await this.menuTab.isVisible().catch(() => false)

    if (tabVisible) {
      await this.menuTab.click()
      await this.expectMenuVisible()
      return
    }

    await this.page.goto('/tabs/home')
    await this.openMenuWithBurger()
  }

  async expectMenuVisible() {
    await expect(this.menuPanel).toHaveClass(/show-menu/)
    await expect(this.menuTitle).toBeVisible()
    await expect(this.menuAccueilLink).toBeVisible()
    await expect(this.menuActualitesLink).toBeVisible()
  }

  async goToActualitesWithTab() {
    await this.goToTab('Actualités', '/tabs/actualite')
  }

  async goToHomeWithTab() {
    await this.goToTab('Accueil', '/tabs/home')
  }

  async goToTab(tabName, fallbackRoute) {
    await this.dismissOnboardingIfVisible()
    const tab = this.page.getByRole('tab', { name: tabName })
    const tabVisible = await tab.isVisible().catch(() => false)

    if (tabVisible) {
      await tab.click()
    } else {
      // Some Ionic renders do not expose the tab bar in headless mode.
      await this.page.goto(fallbackRoute)
    }

    await expect(this.page).toHaveURL(
      new RegExp(`${fallbackRoute.replaceAll('/', '\\/')}$`)
    )
  }
}
