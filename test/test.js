const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const rollup = require('rollup')

;(async() => {
  const bundle = await rollup.rollup({ input: path.join(__dirname, 'suite.js') })
  const { output: [{ code }] } = await bundle.generate({ format: 'es', intro: `self.AWS_FIXTURES = ${JSON.stringify(awsFixtures())};` })

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('file:///dev/null')

  const errs = []
  page.on('console', msg => {
    if (msg.type() === 'assert') {
      errs.push(msg.text())
    }
  })

  try {
    await page.evaluate(code)
  } catch (e) {
    errs.push(e)
  }

  await browser.close()

  if (!errs.length) {
    console.log('All tests passed')
  } else {
    errs.forEach(err => console.error(err))
    process.exit(1)
  }
})()

function awsFixtures() {
  return matchingFiles(path.join(__dirname, 'aws-sig-v4-test-suite'), /\.req$/).map(file => {
    const test = file.split('/').pop().split('.')[0]
    const [preamble, body] = fs.readFileSync(file, 'utf8').trim().split('\n\n')
    const lines = (preamble + '\n').split('\n')
    const methodPath = lines[0].split(' ')
    const method = methodPath[0]
    const pathname = methodPath.slice(1, -1).join(' ')
    const headerLines = lines.slice(1).join('\n').split(':')
    const headers = []
    let url = ''
    for (let i = 0; i < headerLines.length - 1; i++) {
      const name = headerLines[i]
      const newlineIx = headerLines[i + 1].lastIndexOf('\n')
      const value = headerLines[i + 1].slice(0, newlineIx)
      headerLines[i + 1] = headerLines[i + 1].slice(newlineIx + 1)
      if (name.toLowerCase() === 'host') {
        url = `https://${value}${pathname}`
      } else {
        value.split('\n').forEach(v => headers.push([name, v]))
      }
    }
    const canonicalString = fs.readFileSync(file.replace(/\.req$/, '.creq'), 'utf8').trim()
    const stringToSign = fs.readFileSync(file.replace(/\.req$/, '.sts'), 'utf8').trim()
    const authHeader = fs.readFileSync(file.replace(/\.req$/, '.authz'), 'utf8').trim()

    return { test, method, url, headers, body, canonicalString, stringToSign, authHeader }
  })
}

function matchingFiles(dir, regex) {
  const ls = fs.readdirSync(dir).map(file => path.join(dir, file))
  const dirs = ls.filter(file => fs.lstatSync(file).isDirectory())
  let files = ls.filter(regex.test.bind(regex))
  dirs.forEach(dir => { files = files.concat(matchingFiles(dir, regex)) })
  return files
}
