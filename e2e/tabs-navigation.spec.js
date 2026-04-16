import { expect, test } from './fixtures/test-fixtures'

test.describe('Tabs navigation smoke', () => {
  test.beforeEach(async ({ tabsPage }) => {
    await tabsPage.gotoHome()
  })

  test('navigates between main tabs', async ({ page, tabsPage }) => {
    await tabsPage.goToSignalementsWithTab()
    await tabsPage.goToHomeRoute()
    await expect(page).toHaveURL(/\/tabs\/home$/)
  })
})
