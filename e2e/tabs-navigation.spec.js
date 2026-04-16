import { expect, test } from './fixtures/test-fixtures'

test.describe('Tabs navigation smoke', () => {
  test.beforeEach(async ({ tabsPage }) => {
    await tabsPage.gotoHome()
  })

  test('shows all main tabs', async ({ tabsPage }) => {
    await tabsPage.expectMainTabsVisible()
  })

  test('navigates to actualites from the tab bar', async ({ page, tabsPage }) => {
    await tabsPage.goToActualitesWithTab()
    await expect(page).toHaveURL(/\/tabs\/actualite$/)
  })

  test('navigates between main tabs', async ({ page, tabsPage }) => {
    await tabsPage.expectMainTabsVisible()
    await tabsPage.goToSignalementsWithTab()
    await tabsPage.goToHomeWithTab()
    await expect(page).toHaveURL(/\/tabs\/home$/)
  })
})
