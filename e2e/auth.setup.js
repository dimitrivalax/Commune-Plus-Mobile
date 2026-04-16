import { test as setup } from '@playwright/test'

setup('prepare mobile storage state', async ({ page }) => {
  await page.goto('/')

  await page.evaluate(() => {
    localStorage.setItem(
      'commune-plus-user-contact',
      JSON.stringify({
        firstName: 'E2E',
        lastName: 'User',
        email: 'e2e@example.com',
        phone: '',
        address: ''
      })
    )

    localStorage.setItem(
      'commune-plus-city-info',
      JSON.stringify({
        name: 'E2E Commune',
        postalCode: '00000',
        email: 'mairie@example.com',
        logo: null,
        id: 'e2e-commune-id',
        feature_reservations_salles: true,
        feature_propositions: true
      })
    )
  })

  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
