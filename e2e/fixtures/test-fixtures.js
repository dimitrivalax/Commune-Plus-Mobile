import { test as base, expect } from '@playwright/test'
import { TabsPage } from '../pages/tabs-page'
import { SignalementsPage } from '../pages/signalements-page'
import { NewSignalementPage } from '../pages/new-signalement-page'
import { ActualitePage } from '../pages/actualite-page'
import { ReservationsPage } from '../pages/reservations-page'
import { SettingsPage } from '../pages/settings-page'
import { HomePage } from '../pages/home-page'
import { dismissOnboardingIfPresent, openTabsHome } from './navigation'

export const test = base.extend({
  tabsPage: async ({ page }, use) => {
    await use(new TabsPage(page))
  },
  signalementsPage: async ({ page }, use) => {
    await use(new SignalementsPage(page))
  },
  newSignalementPage: async ({ page }, use) => {
    await use(new NewSignalementPage(page))
  },
  actualitePage: async ({ page }, use) => {
    await use(new ActualitePage(page))
  },
  reservationsPage: async ({ page }, use) => {
    await use(new ReservationsPage(page))
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page))
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  e2eNavigation: async ({ page }, use) => {
    await use({
      dismissOnboardingIfPresent: () => dismissOnboardingIfPresent(page),
      openTabsHome: () => openTabsHome(page)
    })
  }
})

export { expect }
