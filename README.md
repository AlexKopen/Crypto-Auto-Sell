# Crypto Auto Sell
Automatically sells a USDT trading pair on Binance.us when falling below a specified threshold.

## Instructions
1. Rename `.env.example` to `.env` and input a valid public/private Binance API key, along with a valid USDT crypto 
symbol, loss percentage, and starting high value.  Setting the starting high value to 0 will use the symbol's current
exchange price.

2. Run the bot
```
docker-compose up
```
