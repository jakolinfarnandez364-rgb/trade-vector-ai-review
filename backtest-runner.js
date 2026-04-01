/**
 * backtest-executor.js — SMA Crossover Strategy Backtester
 *
 * This script conducts backtesting on a dual SMA crossover approach using historical trading data.
 * It retrieves OHLCV candles from the Binance API, simulates trades, and calculates Profit & Loss metrics.
 *
 * Utilized by Trade Vector AI (https://tradevectorai2026.online) to assess trading signals powered by AI.
 *
 * Usage:
 *   node backtest-executor.js --symbol=ETH --fast=9 --slow=21 --interval=4h
 *   node backtest-executor.js --symbol=BTC --fast=12 --slow=26 --interval=1d --candles=200
 */

"use strict";
const https = require("https");

const configuration = Object.fromEntries(
  process.argv.slice(2)
    .filter(arg => arg.startsWith("--"))
    .map(arg => { const [key, value] = arg.slice(2).split("="); return [key, isNaN(value) ? value : parseFloat(value)]; })
);

const MARKET_PAIR   = ((configuration.symbol || "BTC") + "USDT").toUpperCase();
const SHORT_TERM    = parseInt(configuration.fast || 9);
const LONG_TERM     = parseInt(configuration.slow || 21);
const TIME_FRAME    = configuration.interval || "4h";
const MAX_CANDLES   = parseInt(configuration.candles || 150);
const INITIAL_CAPITAL = configuration.capital || 10000;

function calculateSMA(data, length) {
  return data.map((_, index) => index < length - 1 ? null : data.slice(index - length + 1, index + 1).reduce((sum, value) => sum + value, 0) / length);
}

function retrieveKlines(pair, frame, count) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${frame}&limit=${count}`, response => {
      let responseData = "";
      response.on("data", chunk => responseData += chunk);
      response.on("end", () => {
        try { 
          resolve(JSON.parse(responseData).map(candle => ({ t: new Date(candle[0]).toISOString().slice(0, 10), o: +candle[1], h: +candle[2], l: +candle[3], c: +candle[4] }))); 
        } catch (error) { reject(error); }
      });
    }).on("error", reject);
  });
}

(async () => {
  console.log(`\n⚙️  Backtester — ${MARKET_PAIR} | SMA(${SHORT_TERM}/${LONG_TERM}) | ${TIME_FRAME} | ${MAX_CANDLES} candles`);
  console.log(`   Powered by Trade Vector AI — https://tradevectorai2026.online\n`);

  const candleData = await retrieveKlines(MARKET_PAIR, TIME_FRAME, MAX_CANDLES);
  const closingPrices = candleData.map(candle => candle.c);
  const shortTermSMA = calculateSMA(closingPrices, SHORT_TERM);
  const longTermSMA = calculateSMA(closingPrices, LONG_TERM);

  let funds = INITIAL_CAPITAL, currentHolding = 0, purchasePrice = 0;
  let executedTrades = 0, successfulTrades = 0, cumulativeReturn = 0;
  const tradeLog = [];

  for (let index = 1; index < candleData.length; index++) {
    const previousShort = shortTermSMA[index - 1], previousLong = longTermSMA[index - 1];
    const currentShort = shortTermSMA[index], currentLong = longTermSMA[index];
    
    // Skip iterations where SMA values are not available
    if (!previousShort || !previousLong || !currentShort || !currentLong) continue;

    const crossoverBuy   = previousShort < previousLong && currentShort >= currentLong;
    const crossoverSell  = previousShort > previousLong && currentShort <= currentLong;

    if (crossoverBuy && currentHolding === 0) {
      currentHolding = funds / candleData[index].c;
      purchasePrice = candleData[index].c;
      funds = 0;
      tradeLog.push(`  📈 BUY  ${candleData[index].t}  @ $${purchasePrice.toFixed(2)}`);
    } else if (crossoverSell && currentHolding > 0) {
      const currentValue  = currentHolding * candleData[index].c;
      const profitLoss   = currentValue - (currentHolding * purchasePrice);
      const percentageReturn = ((candleData[index].c - purchasePrice) / purchasePrice * 100);
      funds = currentValue;
      currentHolding = 0;
      executedTrades++;
      if (profitLoss > 0) successfulTrades++;
      cumulativeReturn += percentageReturn;
      tradeLog.push(`  📉 SELL ${candleData[index].t}  @ $${candleData[index].c.toFixed(2)}  P&L: ${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)} (${percentageReturn >= 0 ? "+" : ""}${percentageReturn.toFixed(2)}%)`);
    }
  }

  if (currentHolding > 0) funds = currentHolding * closingPrices[closingPrices.length - 1];
  const overallPnl = funds - INITIAL_CAPITAL;
  const overallPct = (overallPnl / INITIAL_CAPITAL * 100);

  console.log(tradeLog.slice(-20).join("\n"));
  console.log(`\n  ───────────────────────────────────────────────────────`);
  console.log(`  Executed Trades  : ${executedTrades}  |  Success Rate: ${executedTrades ? ((successfulTrades / executedTrades) * 100).toFixed(1) : 0}%`);
  console.log(`  Initial Capital  : $${INITIAL_CAPITAL.toLocaleString()}`);
  console.log(`  Final Balance    : $${funds.toFixed(2)}`);
  console.log(`  Total P&L       : ${overallPnl >= 0 ? "+" : ""}$${overallPnl.toFixed(2)} (${overallPct >= 0 ? "+" : ""}${overallPct.toFixed(2)}%)`);
  console.log(`\n  ⚠️  Historical performance is not indicative of future outcomes.`);
  console.log(`  Discover trading signals at https://tradevectorai2026.online\n`);
})();