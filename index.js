const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const place = req.query.q;

  if (!place) {
    return res.status(400).json({ error: "Χρειάζεται παράμετρο q (π.χ. /?q=Θεσσαλονίκη)" });
  }

  const question = `Απάντα μου με έναν αριθμό. Πόσο είναι το συνολικό κόστος των διοδίων από Αθήνα σε ${place} Με ΙΧ`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const url = "https://www.perplexity.ai/search?q=" + encodeURIComponent(question);

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForTimeout(4000);

    const answer = await page.evaluate(() => {
      const el = document.querySelector("main") || document.body;
      return el?.innerText || "Δεν βρέθηκε απάντηση.";
    });

    await browser.close();
    res.json({ answer });
  } catch (error) {
    console.error("Σφάλμα:", error.message);
    res.status(500).json({ error: "Αποτυχία ανάκτησης απάντησης από Perplexity." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});
