import { print } from 'gluegun'

const { blue, cyan, gray, white, bold, yellow } = print.colors
const { underline } = print.colors

const INDENT = '  '
const p = (m = '') => print.info(gray(`   ${m}`))
const heading = (m = '') => p(white(bold(m)))
const link = (m = '') => underline(white(m))

const tripayHeading = () => {
  return p(
    blue(
      bold(
        '· · · · · · · · · · · · · · · · 💳 TriPay CLI 💳 · · · · · · · · · · · · · · · ·\n'
      )
    )
  )
}

const command = (m = '', second = '', examples = []) => {
  p(white(m) + '  ' + gray(second))
  const indent = m.length + 2
  if (examples) {
    examples.forEach((ex) => p(gray(' '.repeat(indent) + ex)))
  }
}
const direction = (m = '') => p(cyan(m))
const warning = (m = '') => p(yellow(m))

/**
 * enquirer style customization
 * @see https://github.dev/enquirer/enquirer/blob/36785f3399a41cd61e9d28d1eb9c2fcd73d69b4c/examples/select/option-elements.js#L19
 */
const prefix = (state: {
  status: 'pending' | 'submitted' | 'canceled'
}): string => {
  return {
    pending: '📝',
    submitted: '✅',
    cancelled: '❌',
  }[state.status]
}

/** Format displayed messages for prompts */
const format = {
  /** Format boolean values for human on prompts  */
  boolean: (value: string): string | Promise<string> => {
    return value ? 'Yes' : 'No'
  },
}

const prettyPrompt = {
  prefix,
  format,
}

type Spinner = ReturnType<typeof print.spin>

const spinners: { [key: string]: Spinner } = {}

const startSpinner = (m = '') => {
  let spinner = spinners[m]
  if (!spinner) {
    spinner = print.spin({ prefixText: INDENT + ' ', text: gray(m) })
    spinners[m] = spinner
  }
  return spinner
}

const stopSpinner = (m: string, symbol: string) => {
  const spinner = spinners[m]
  if (spinner) {
    spinner.stopAndPersist({ symbol })
    delete spinners[m]
  }
}

const clearSpinners = () => {
  Object.keys(spinners).forEach((m) => {
    spinners[m].stop()
    delete spinners[m]
  })
}

const spinner = {
  start: startSpinner,
  stop: stopSpinner,
  clear: clearSpinners,
} as const

const hr = () => p(` ────────────────────────────────────────────────────`)

export {
  p,
  heading,
  link,
  tripayHeading,
  command,
  direction,
  warning,
  startSpinner,
  stopSpinner,
  clearSpinners,
  spinner,
  hr,
  prefix,
  format,
  prettyPrompt,
  INDENT,
}
