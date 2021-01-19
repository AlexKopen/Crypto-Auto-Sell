import Binance from 'binance-api-node'
import * as dotEnv from 'dotenv'
import logUpdate from 'log-update'

dotEnv.config()

const binanceClient = Binance()
const lossPercentage = +(process.env.LOSS_PERCENTAGE)
const symbol = process.env.SYMBOL

const accountSid = process.env.PUBLIC
const authToken = process.env.PRIVATE
const twilioClient = require('twilio')(accountSid, authToken)

let sendText = true
let textsSent = 0

const main = async () => {

    const balance = +process.env.STARTING_BALANCE
    let high = +process.env.STARTING_HIGH

    console.log(`${symbol} balance: ${balance}`)

    binanceClient.ws.candles([`${symbol}USDT`], '1m', candle => {
        const currentClose = +candle.close

        high = Math.max(currentClose, high)
        const percentChange = +((((currentClose - high) / high) * 100).toFixed(2))
        const payout = ((high - (high * (lossPercentage / 100) * -1)) * balance).toFixed(2)

        logUpdate(`
            High:\t\t$${high}
            Current:\t$${currentClose}
            Fall:\t\t${percentChange}%
            Payout:\t\t$${payout}
            Texts:\t\t${textsSent}`.replace(/^ +| +$/gm, '')
        )

        if (percentChange < lossPercentage) {
            if (sendText) {
                twilioClient.messages
                    .create({
                        body: `${symbol} drop: ${percentChange}%`,
                        from: process.env.FROM_NUMBER,
                        to: process.env.TO_NUMBER
                    })
                    .then(() => {
                        sendText = false
                        textsSent++

                        setTimeout(() => {
                            sendText = true
                        }, 30 * 60000)
                    });
            }
        }
    })
}

main()
