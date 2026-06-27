import puppeteer from "puppeteer";

export async function renderPdf(html: string): Promise<Buffer> {
  // 容器中用系統安裝的 chromium（PUPPETEER_EXECUTABLE_PATH）；
  // 本機未設定時用 puppeteer 內建下載的 chromium。
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
