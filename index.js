const express = require("express");
const puppeteer = require("puppeteer-core");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const question = req.query.q;
  if (!question) {
    return res.status(400).send("Λείπει η παράμετρος q.");
  }

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new"
    });

    const page = await browser.newPage();
    const searchUrl = "https://www.perplexity.ai/search?q=" + encodeURIComponent(question);
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    // Περιμένει να φορτωθεί το βασικό περιεχόμενο
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
