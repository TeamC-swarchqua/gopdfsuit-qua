/** Navigate to a protected tool route (AuthGuard redirects to login if unauthenticated). */
export async function gotoProtectedTool(page, tool) {
  const target = tool ? `/gopdfsuit/#/${tool}` : '/gopdfsuit/#/'
  await page.goto(target)
  await page.waitForURL(tool ? `**/#/${tool}` : '**/#/**')
}

/** Navigate to login page directly. */
export async function gotoLogin(page) {
  await page.goto('/gopdfsuit/#/login')
  await page.waitForURL('**/#/login')
}
