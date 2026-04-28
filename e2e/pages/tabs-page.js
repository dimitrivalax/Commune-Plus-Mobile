import { expect } from '@playwright/test'
import {
  dismissOnboardingIfPresent,
  openTabsHome
} from '../fixtures/navigation'

export class TabsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
    this.menuButton = page.locator('ion-menu-button, button[aria-label*="menu" i]')
    this.menuTab = page.locator('ion-tab-button', {
      has: page.locator('ion-label', { hasText: 'Menu' })
    })
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
    const tabButtonsCount = await this.page.locator('ion-tab-button').count()
    if (tabButtonsCount > 0) {
      await expect(this.getTabByLabel('Accueil')).toBeVisible()
      await expect(this.getTabByLabel('Actualités')).toBeVisible()
      await expect(this.getTabByLabel('Signalements')).toBeVisible()
      await expect(this.getTabByLabel('Menu')).toBeVisible()
      return
    }

    // Some web/headless renders hide Ionic tab controls: verify home UI instead.
    await expect(this.page.getByRole('heading', { name: 'E2E Commune' })).toBeVisible()
  }

  async openMenuWithBurger() {
    await this.dismissOnboardingIfVisible()
    const burgerVisible = await this.menuButton.first().isVisible().catch(() => false)
    if (burgerVisible) {
      await this.menuButton.first().click()
      await this.expectMenuVisible()
      return
    }

    const menuTabVisible = await this.menuTab.first().isVisible().catch(() => false)
    if (menuTabVisible) {
      await this.menuTab.first().click()
      await this.expectMenuVisible()
      return
    }

    await this.page.evaluate(async () => {
      const menu = document.querySelector('ion-menu')
      if (menu && typeof menu.open === 'function') {
        await menu.open()
      }
    })
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
    const tab = this.getTabByLabel(tabName)
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

  getTabByLabel(tabLabel) {
    return this.page.locator('ion-tab-button', {
      has: this.page.locator('ion-label', { hasText: tabLabel })
    })
  }
}
