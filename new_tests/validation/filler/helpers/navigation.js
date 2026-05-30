/** Navigate to a tool page via hash router and wait for the route to apply. */
export async function gotoTool(page, tool) {
  const target = tool ? `/gopdfsuit/#/${tool}` : '/gopdfsuit/#/'
  await page.goto(target)
  await page.waitForURL(tool ? `**/#/${tool}` : '**/#/')
}

/** Click a navbar link by visible label (desktop or mobile menu). */
export async function clickNavLink(page, label) {
  const link = page.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })
  await link.first().click()
}
