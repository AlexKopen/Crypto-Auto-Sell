import Binance from 'binance-api-node'
import * as dotEnv from 'dotenv'
import logUpdate from 'log-update'

dotEnv.config()

const client = Binance({
    apiKey: process.env.PUBLIC,
    apiSecret: process.env.PRIVATE,
    httpBase: 'https://api.binance.us',
    wsBase: 'wss://stream.binance.us:9443'
})
const lossPercentage = +(process.env.LOSS_PERCENTAGE)
const symbol = process.env.SYMBOL

const main = async () => {
    const accountInfo = await client.accountInfo()

    const balance = +(accountInfo.balances.filter(balance => {
        return balance.asset === symbol
    })[0].free)
    let high = 0

    console.log(`${symbol} balance: ${balance}`)

    client.ws.candles([`${symbol}USDT`], '1m', candle => {
        const currentClose = +candle.close

        high = Math.max(currentClose, high)
        const percentChange = +((((currentClose - high) / high) * 100).toFixed(2))
        const payout = ((high - (high * (lossPercentage / 100) * -1)) * balance).toFixed(2)

        logUpdate(`
            High:\t$${high}
            Current:\t$${currentClose}
            Fall:\t${percentChange}%
            Payout:\t$${payout}`.replace(/^ +| +$/gm, '')
        )

        if (percentChange < lossPercentage) {
            // Sell
            client.order({
                symbol: `${symbol}USDT`,
                side: 'SELL',
                type: 'MARKET',
                quantity: balance.toFixed(2),
            }).then(orderResult => {
                console.log(orderResult)
                process.exit(1)
            })
        }
    })
}

main()
