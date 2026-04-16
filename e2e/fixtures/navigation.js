import { expect } from '@playwright/test'

/**
 * @param {import('@playwright/test').Page} page
 */
export async function dismissOnboardingIfPresent(page) {
  const skipButton = page.getByRole('button', { name: 'Plus tard' })
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click()
    await expect(skipButton).toBeHidden()
  }
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function openTabsHome(page) {
  await page.goto('/tabs/home')
  await expect(page).toHaveURL(/\/tabs\/home$/)
  await dismissOnboardingIfPresent(page)
}
