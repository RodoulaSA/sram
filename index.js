const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

async function ensureChromium() {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download("1181205");
  return revisionInfo.executablePath;
}

app.get("/", async (req, res) => {
  const question = req.query.q;
  if (!question) {
    return res.status(400).send("Λείπει η παράμετρος q.");
  }

  try {
    const executablePath = await ensureChromium();
    const browser = await puppeteer.launch({
      executablePath,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    const searchUrl = "https://www.perplexity.ai/search?q=" + encodeURIComponent(question);
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    await page.waitForSelector("main");

    const answer = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? main.innerText.slice(0, 1000) : "Δεν βρέθηκε απάντηση.";
    });

    await browser.close();
    res.send(answer);
  } catch (err) {
    console.error("Σφάλμα:", err);
    res.status(500).send("Σφάλμα κατά την ανάκτηση της απάντησης.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
