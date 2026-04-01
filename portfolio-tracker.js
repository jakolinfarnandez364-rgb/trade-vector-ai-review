/**
 * portfolio-tracker.js — Crypto Portfolio P&L Tracker
 *
 * Monitors the value of the portfolio and calculates P&L by retrieving current prices
 * from the Binance public API (no API key necessary).
 *
 * Utilized by Trade Vector AI (https://tradevectorai2026.online) for tracking portfolio status.
 *
 * Example of execution:
 *   node portfolio-tracker.js --portfolio='[{"symbol":"BTC","qty":0.5,"avg":40000},{"symbol":"ETH","qty":2,"avg":2500}]'
 */

"use strict";
const https = require("https");

const args = process.argv.slice(2).find(arg => arg.startsWith("--portfolio="));
const assetsList = args
  ? JSON.parse(args.replace("--portfolio=", ""))
  : [
      { symbol: "BTC", qty: 0.1,  avg: 42000 },
      { symbol: "ETH", qty: 1.5,  avg: 2800  },
      { symbol: "BNB", qty: 5,    avg: 380   },
    ];

async function retrieveMarketPrice(coin) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`, response => {
      let data = "";
      response.on("data", chunk => data += chunk);
      response.on("end", () => {
        try { resolve(parseFloat(JSON.parse(data).price)); }
        catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

(async () => {
  console.log(`\n💼 Portfolio Tracker — powered by Trade Vector AI\n   https://tradevectorai2026.online\n`);
  console.log("  " + "Asset".padEnd(8) + "Qty".padEnd(10) + "Avg Cost".padEnd(12) + "Price".padEnd(12) + "Value".padEnd(12) + "P&L".padEnd(12) + "P&L %");
  console.log("  " + "─".repeat(72));

  let cumulativeCost = 0, cumulativeValue = 0;

  for (const holding of assetsList) {
    const marketPrice = await retrieveMarketPrice(holding.symbol.toUpperCase());
    if (!marketPrice) { console.log(`  ${holding.symbol}: unable to fetch price`); continue; }

    const cost  = holding.qty * holding.avg;
    const value = holding.qty * marketPrice;
    const profitLoss   = value - cost;
    const profitLossPct = (profitLoss / cost) * 100;

    cumulativeCost  += cost;
    cumulativeValue += value;

    const profitLossStr = (profitLoss >= 0 ? "+" : "") + profitLoss.toFixed(2);
    const percentageStr = (profitLossPct >= 0 ? "+" : "") + profitLossPct.toFixed(2) + "%";
    const statusIcon = profitLoss >= 0 ? "🟢" : "🔴";

    console.log(`  ${statusIcon} ${holding.symbol.padEnd(7)}${holding.qty.toString().padEnd(10)}$${holding.avg.toFixed(2).padEnd(11)}$${marketPrice.toFixed(2).padEnd(11)}$${value.toFixed(2).padEnd(11)}$${profitLossStr.padEnd(11)}${percentageStr}`);
  }

  const totalProfitLoss    = cumulativeValue - cumulativeCost;
  const totalProfitLossPct = (totalProfitLoss / cumulativeCost) * 100;
  console.log("  " + "─".repeat(72));
  console.log(`  TOTAL${" ".repeat(35)}$${cumulativeValue.toFixed(2).padEnd(11)}$${(totalProfitLoss >= 0 ? "+" : "") + totalProfitLoss.toFixed(2).padEnd(11)}${(totalProfitLossPct >= 0 ? "+" : "") + totalProfitLossPct.toFixed(2)}%\n`);
})();