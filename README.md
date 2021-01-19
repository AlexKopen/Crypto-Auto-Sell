# Crypto Auto Sell
Automatically notifies a user via [a Twilio SMS](https://www.twilio.com/sms) when the price of a cryptocurrency falls below a specified threshold.
The bot dynamically changes the coin's high price to reference in real time as new peak values are reached.

## Instructions
1. Rename `.env.example` to `.env` and input a valid public/private Twilio API key, along with a from and to phone number,
valid USDT crypto symbol, loss percentage, starting blalance, and starting high value.  Setting the starting high value to 0 will use the symbol's current
exchange price.

2. Run the bot
```
docker-compose up
```

## TODO
1. [Uniswap](https://uniswap.org/) integration
