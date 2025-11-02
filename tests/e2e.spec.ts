import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

async function flow(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Søk' }).click()
  await page.getByPlaceholder('Søk i Matvaretabellen').fill('melk')
  await page.waitForTimeout(1000)
  const firstAdd = page.getByRole('button', { name: 'Legg til' }).first()
  await firstAdd.click()
  await page.getByRole('button', { name: 'Handleliste' }).click()
  await expect(page.getByText(/Melk/i)).toBeVisible()
  await page.getByRole('button', { name: 'Markér som kjøpt' }).first().click()
  await page.getByRole('button', { name: 'Matlager' }).click()
  await expect(page.getByText(/Melk/i)).toBeVisible()
}

test('flow desktop 1280x800', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await flow(page)
})

test('flow iPhone 13', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await flow(page)
})
