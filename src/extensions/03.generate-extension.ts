import * as crypto from 'crypto'
import {
  p,
  tripayHeading,
  direction,
  link,
  prettyPrompt,
  prefix,
  startSpinner,
  stopSpinner,
  clearSpinners,
} from '../tools/pretty'
import { format as formatDate } from 'date-fns'

// Types
import type { GluegunToolbox } from 'gluegun'
import type { SignaturePayloadType, PaymentPayload } from '../types'

module.exports = (toolbox: GluegunToolbox) => {
  const {
    loadConfig,
    prompt,
    print,
    parameters,
    paymentChannels,
    createPayment,
  } = toolbox
  const { green } = print.colors
  const options = parameters.options
  const isSandbox = options.sandbox || options.s

  const buildSignature = async (payload: SignaturePayloadType) => {
    const config = await loadConfig(isSandbox)

    return new Promise((resolve, reject) => {
      try {
        const signature = crypto
          .createHmac('sha256', config.private_key)
          .update(config.merchant_code + payload.invoiceRef + payload.amount)
          .digest('hex')

        resolve(signature)
      } catch (e) {
        reject(e)
      }
    })
  }

  const buildPayment = async (payload: PaymentPayload) => {
    try {
      const doCreatePayment = await createPayment(payload)

      const paymentDetail = doCreatePayment.data

      const isCustomerFee =
        paymentDetail.fee_customer !== 0 ? 'Customer' : 'Merchant'

      stopSpinner(' Generating payment request...', '✅')
      p()
      p(green('+===================================+'))
      p(green('| New Payment Info                  |'))
      p(green('+===================================+'))
      p(green(`| Reference: ${paymentDetail.reference}`))
      p(green(`| Invoice ref: ${paymentDetail.merchant_ref}`))
      p(green(`+=========[ Customer Info ]=========+`))
      p(green(`| Name: ${paymentDetail.customer_name}`))
      p(green(`| Email: ${paymentDetail.customer_email}`))
      p(green(`| Phone: ${paymentDetail.customer_phone}`))
      p(green(`+============[ Payment ]============+`))
      p(green(`| Subtotal: ${paymentDetail.amount_received}`))
      p(green(`| Fee (${isCustomerFee}): ${paymentDetail.total_fee}`))
      p(green(`| Total: ${paymentDetail.amount}`))
      p(green(`+========[ Additional Info ]========+`))
      p(
        green(
          `| Channel: ${paymentDetail.payment_name} (${paymentDetail.payment_method})`
        )
      )
      p(green(`| Pay code: ${paymentDetail.pay_code}`))
      p(green(`| Status: ${paymentDetail.status}`))
      p(
        green(
          `| Expired at: ${formatDate(
            paymentDetail.expired_time * 1000,
            'yyyy-MM-dd HH:mm:ss'
          )}`
        )
      )
      p(green('+===================================+'))

      clearSpinners()
      p()
      direction(' 🚀 Your payment link is ready!')
      direction(` 🔗 ${link(`${paymentDetail.checkout_url}`)}`)
      p()
      tripayHeading()
      process.exit(0)
    } catch (e) {
      clearSpinners()
      print.error('█ Canceling...')
      print.error(`Reason: ${e?.message}`)
      process.exit(0)
    }
  }

  toolbox.generateSignature = async () => {
    // Form
    const generateSignatureForm = [
      {
        type: 'input',
        name: 'invoice_ref',
        message: 'Enter your invoice ref',
      },
      {
        type: 'input',
        name: 'amount',
        message: 'Enter your amount',
      },
    ]

    p('\n')
    tripayHeading()
    const { invoice_ref, amount } = await prompt.ask(generateSignatureForm)

    if (invoice_ref === '') {
      print.error('█ Canceling...')
      print.error('Reason: Invoice ref cannot be empty.')
      return false
    }
    if (amount === '') {
      print.error('█ Canceling...')
      print.error('Reason: Amount cannot be empty.')
      return false
    }
    if (isNaN(Number(amount))) {
      print.error('█ Canceling...')
      print.error('Reason: Amount must be a number.')
      return false
    }

    startSpinner(' Generating signature...')

    try {
      const signature = await buildSignature({
        invoiceRef: invoice_ref,
        amount: Number(amount),
      })

      stopSpinner(' Generating signature...', '✅')
      p()
      direction(' #️⃣  Signature generated successfully')
      direction(` #️⃣  ${signature}`)
      p()
      tripayHeading()
      clearSpinners()
      process.exit(0)
    } catch (e) {
      clearSpinners()
      print.error('█ Canceling...')
      print.error(`Reason: ${e?.message}`)
      process.exit(0)
    }
  }

  toolbox.generatePaymentRequest = async () => {
    p()
    tripayHeading()
    const paymentList = await paymentChannels()

    const orderItems = []

    // Form Order Items
    const addOrderItem = async () => {
      p()
      p('🛒 Add new item')
      p()
      const inputOrderItems = [
        {
          type: 'input',
          name: 'sku',
          message: 'Product SKU (optional)',
        },
        {
          type: 'input',
          name: 'name',
          message: 'Product name',
        },
        {
          type: 'input',
          name: 'price',
          message: 'Product price',
        },
        {
          type: 'input',
          name: 'quantity',
          message: 'Product quantity',
        },
        {
          type: 'input',
          name: 'product_url',
          message: 'Product URL (optional)',
        },
        {
          type: 'input',
          name: 'image_url',
          message: 'Product image URL (optional)',
        },
      ]
      const { sku, name, price, quantity, product_url, image_url } =
        await prompt.ask(inputOrderItems)

      if (name === '') {
        print.error('█ Canceling...')
        print.error('Reason: Product name cannot be empty.')
        return false
      }
      if (price === '') {
        print.error('█ Canceling...')
        print.error('Reason: Product price cannot be empty.')
        return false
      } else {
        if (isNaN(Number(price))) {
          print.error('█ Canceling...')
          print.error('Reason: Product price must be a number.')
          return false
        }
      }
      if (quantity === '') {
        print.error('█ Canceling...')
        print.error('Reason: Product quantity cannot be empty.')
        return false
      } else {
        if (isNaN(Number(quantity))) {
          print.error('█ Canceling...')
          print.error('Reason: Product quantity must be a number.')
          return false
        }
      }

      orderItems.push({
        sku,
        name,
        price: Number(price),
        quantity: Number(quantity),
        product_url,
        image_url,
      })

      const { add_more } = await prompt.ask(() => ({
        type: 'confirm',
        name: 'add_more',
        message: 'Do you want to add more item?',
        format: prettyPrompt.format.boolean,
        prefix,
      }))

      if (add_more) {
        await addOrderItem()
      }
    }

    await addOrderItem()

    p()
    p('💳 Payment Details')
    p()
    // Form Payment
    const inputForm = [
      {
        type: 'autocomplete',
        name: 'payment_method',
        message: 'Select payment method',
        choices: paymentList?.data?.map((item: any) => item.name),
      },
      {
        type: 'input',
        name: 'invoice_ref',
        message: 'Enter your invoice ref',
      },
      {
        type: 'input',
        name: 'amount',
        message: 'Enter your amount',
      },
      {
        type: 'input',
        name: 'customer_name',
        message: 'Enter customer name',
      },
      {
        type: 'input',
        name: 'customer_email',
        message: 'Enter customer email',
      },
      {
        type: 'input',
        name: 'customer_phone',
        message: 'Enter customer phone',
      },
      {
        type: 'input',
        name: 'signature',
        message: 'Enter your signature',
      },
    ]
    const {
      payment_method,
      invoice_ref,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      signature,
    } = await prompt.ask(inputForm)

    startSpinner(' Generating payment request...')

    try {
      const selectedPaymentMethod = paymentList?.data.find(
        (payment) => payment.name === payment_method
      )
      await buildPayment({
        method: selectedPaymentMethod.code,
        merchant_ref: invoice_ref,
        amount: Number(amount),
        customer_name,
        customer_email,
        customer_phone,
        order_items: orderItems,
        signature,
      })
    } catch (e) {
      clearSpinners()
      print.error('█ Canceling...')
      print.error(`Reason: ${e?.message}`)
      process.exit(0)
    }
  }
}
