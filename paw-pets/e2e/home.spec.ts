import { test, expect } from '@playwright/test'

const homeURL = 'http://localhost:3000/'

test.describe("Home game area tests", () => {
   test('find the advisor and click on him and find the textbox', async ({ page }) => {
      await page.goto(homeURL)
      await page.waitForTimeout(5000);
      const advisor = page.locator('#advisor')
      await advisor.click()
      const advisor_text = page.locator('#advisor_text');
      const computedStyles = await advisor_text.evaluate((element) => {
         const styles = window.getComputedStyle(element);
         return {
            background: styles.backgroundColor,
            border: styles.border,
            borderRadius: styles.borderRadius
         };
      });
      expect(computedStyles.background).toEqual('rgba(254, 249, 237, 0.8)');
      expect(computedStyles.border).toEqual('3px solid rgb(77, 70, 153)');
   });

   test('open the catdex and find the asian cat and click it', async ({ page }) => {
      await page.goto(homeURL)
      await page.waitForTimeout(5000);
      const catdex = page.locator('#catdex');
      await catdex.click();
      await page.getByAltText("Go forward").click();
      const asian = await page.locator('div').filter({ hasText: 'Asian' }).first();
      await asian.click()
   });

   test('open the weather popup and change location to vancouver', async ({ page }) => {
      await page.goto(homeURL)
      await page.waitForTimeout(5000);
      const weather = page.locator('#weather');
      await weather.click();
      await page.waitForTimeout(1000);
      const input = await page.locator('input').type('vancouver', { delay: 50 });
      await page.click('text=GO!')
      await page.waitForTimeout(5000);
      const meowing = page.locator('#meowing')
      expect(meowing).toContainText("meowing @ vancouver")
   });

   test('open the settings popup and test logout button', async ({ page }) => {
      await page.goto(homeURL)
      await page.waitForTimeout(5000);
      const logout = page.locator('#logout');
      await logout.click();
      await page.waitForTimeout(1000);
      await page.click('#logoutbtn')
      // Should show demo message instead of redirecting
      await page.waitForTimeout(2000);
   });

   test('find the h2 of meowing @ __place', async ({ page }) => {
      await page.goto(homeURL)
      const meowing = page.locator('h2')
      expect(meowing).toContainText("meowing @")
      const computedStyles = await meowing.evaluate((element) => {
         const styles = window.getComputedStyle(element);
         return {
            fontWeight: styles.fontWeight,
         };
      });
      expect(computedStyles.fontWeight).toEqual('600');
   })

   test('should load the demo page without login', async ({ page }) => {
      await page.goto(homeURL)
      await page.waitForTimeout(5000);
      await expect(page).toHaveURL(homeURL)
   })
})