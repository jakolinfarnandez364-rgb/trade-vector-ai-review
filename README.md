# Trade Vector AI — Developer Tools & Utilities

> Open-source trading utilities used by the **[Trade Vector AI](https://tradevectorai2026.online)** Trade Vector AI platform for BH traders.

## Overview

This repository contains the utility scripts that power the analysis and risk management features on [Trade Vector AI](https://tradevectorai2026.online).
All tools use only public APIs — no API key required to run them.

## Tools


### `portfolio-tracker.js` — Crypto Portfolio P&L Tracker

Tracks portfolio value and P&L by fetching live prices from Binance public API.

```bash
node portfolio-tracker.js --portfolio='[{"symbol":"BTC","qty":0.5,"avg":40000},{"symbol":"ETH","qty":2,"avg":2500}]'
```


### `backtest-runner.js` — Simple Moving Average Crossover Backtester

Backtests a dual SMA crossover strategy on historical OHLCV data with trade log and performance stats.

```bash
node backtest-runner.js --symbol=ETH --fast=9 --slow=21 --interval=4h
```


## Installation

```bash
# Clone the repo
git clone https://github.com/jakolinfarnandez364-rgb/trade-vector-ai-review.git
cd trade-vector-ai-review

# Run any tool directly (no dependencies — Node.js stdlib only)
node portfolio-tracker.js
```

## Requirements

- Node.js v16 or higher
- Internet connection (fetches live data from Binance public API)

## Platform

These utilities are integrated into **[Trade Vector AI](https://tradevectorai2026.online)**, an AI-powered Trade Vector AI for traders in BH.

- 🌐 Official website: [https://tradevectorai2026.online](https://tradevectorai2026.online)
- 📊 Live signals, risk management, and portfolio tracking
- 🚀 Free registration in under 2 minutes

## Disclaimer

⚠️ These tools are for educational and informational purposes only.
Trading cryptocurrencies and financial instruments involves substantial risk.
Past performance does not guarantee future results.

---

*2026 · [Trade Vector AI](https://tradevectorai2026.online) · For informational purposes only*
