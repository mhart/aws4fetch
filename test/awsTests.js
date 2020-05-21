import { AwsClient, AwsV4Signer } from '../src/main'

export default async(fixtures) => {
  return Promise.all(fixtures.map(awsTest))
}

const accessKeyId = 'AKIDEXAMPLE'
const secretAccessKey = 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
const service = 'service'
const datetime = '20150830T123600Z'

async function awsTest({ test, method, url, headers, body, canonicalString, stringToSign, authHeader }) {
  const reqHeaders = new Headers()
  headers.forEach(([name, value]) => {
    try {
      reqHeaders.append(name, value) // Cloudflare doesn't trim value
      reqHeaders.set(name, reqHeaders.get(name).replace(/, /g, ',')) // Multiple values
    } catch (e) {
      throw new Error(`append() failed for '${name}': '${value}'`)
    }
  })

  const sessionToken = reqHeaders.get('X-Amz-Security-Token')

  const signer = new AwsV4Signer({
    method,
    url,
    headers: reqHeaders,
    body,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    service,
    datetime,
    allHeaders: true,
    singleEncode: true,
  })

  const reqCanonicalString = await signer.canonicalString()
  console.assert(reqCanonicalString === canonicalString, `${test}: Expected canonicalString ${canonicalString}, got ${reqCanonicalString}`)

  const reqStringToSign = await signer.stringToSign()
  console.assert(reqStringToSign === stringToSign, `${test}: Expected stringToSign ${stringToSign}, got ${reqStringToSign}`)

  const reqAuthHeader = await signer.authHeader()
  console.assert(reqAuthHeader === authHeader, `${test}: Expected authHeader ${authHeader}, got ${reqAuthHeader}`)

  const client = new AwsClient({ accessKeyId, secretAccessKey, sessionToken, service })

  const inputReq = new Request(url, { method, headers: reqHeaders, body })
  const req1 = await client.sign(inputReq, { aws: { datetime, allHeaders: true, singleEncode: true } })

  const clientAuthHeader = req1.headers.get('Authorization')
  console.assert(clientAuthHeader === authHeader, `${test}: Expected authHeader ${authHeader}, got ${clientAuthHeader}`)

  console.assert(req1.method === method, `${test}: Expected method ${method}, got ${req1.method}`)
  const body1 = await req1.text()
  console.assert(body1 === (body || ''), `${test}: Expected body ${body}, got ${body1}`)

  const req2 = await client.sign(url, { method, headers: reqHeaders, body, aws: { datetime, allHeaders: true, singleEncode: true } })

  const client2AuthHeader = req2.headers.get('Authorization')
  console.assert(client2AuthHeader === authHeader, `${test}: Expected authHeader ${authHeader}, got ${client2AuthHeader}`)

  console.assert(req2.method === method, `${test}: Expected method ${method}, got ${req2.method}`)
  const body2 = await req2.text()
  console.assert(body2 === (body || ''), `${test}: Expected body ${body}, got ${body2}`)
}
