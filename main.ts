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

    const balance = +(accountInfo.balances.find(balance => {
        return balance.asset === symbol
    }).free)
    let high = +process.env.STARTING_HIGH

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
            const sellQuantity = Math.floor(balance).toFixed(2)
            console.log(`Selling ${sellQuantity} ${symbol}`)

            client.order({
                symbol: `${symbol}USDT`,
                side: 'SELL',
                type: 'MARKET',
                quantity: sellQuantity
            }).then(orderResult => {
                console.log(orderResult)
                process.exit(1)
            }).catch(error => {
                console.log(error)
                process.exit(1)
            })
        }
    })
}

main()
