import S3 from 'aws-sdk/clients/s3'
import config from 'config'
import { getChannel } from 'server/amqp'
import crashReporter from 'modules/crashReporter/crashReporter'
import computeScreenshotDiff from 'modules/build/computeScreenshotDiff'

const QUEUE = 'screenshotDiff'

export async function push(screenshotDiffId) {
  const channel = await getChannel()
  await channel.assertQueue(QUEUE, { durable: true })
  channel.sendToQueue(QUEUE, new Buffer(screenshotDiffId), { persistent: true })
}

export async function worker() {
  const s3 = new S3({ signatureVersion: 'v4' })
  const channel = await getChannel()
  await channel.assertQueue(QUEUE, { durable: true })
  await channel.prefetch(1)
  await channel.consume(QUEUE, async (msg) => {
    try {
      const screenshotDiffId = msg.content.toString()
      await computeScreenshotDiff(screenshotDiffId, {
        s3,
        bucket: config.get('s3.screenshotsBucket'),
      })
    } catch (error) {
      console.error(error.message) // eslint-disable-line no-console
      console.error(error.stack) // eslint-disable-line no-console
      crashReporter.captureException(error)
      channel.nack(msg, { requeue: true })
      return
    }
    channel.ack(msg)
  })
}
