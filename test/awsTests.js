import { AwsV4Signer } from '../src/main'

export default async(fixtures) => {
  return Promise.all(fixtures.map(awsTest))
}

async function awsTest({ test, method, url, headers, body, canonicalString, stringToSign, authHeader }) {
  let reqHeaders = new Headers()
  headers.forEach(([name, value]) => {
    try {
      reqHeaders.append(name, value) // Cloudflare doesn't trim value
      reqHeaders.set(name, reqHeaders.get(name).replace(/, /g, ',')) // Multiple values
    } catch (e) {
      throw new Error(`append() failed for '${name}': '${value}'`)
    }
  })

  let signer = new AwsV4Signer(url, {
    method,
    headers: reqHeaders,
    body,
    accessKeyId: 'AKIDEXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
    securityToken: reqHeaders.get('X-Amz-Security-Token'),
    service: 'service',
    datetime: '20150830T123600Z',
    allHeaders: true,
    singleEncode: true,
  })

  let reqCanonicalString = await signer.canonicalString()
  console.assert(reqCanonicalString === canonicalString, `${test}: Expected canonicalString ${canonicalString}, got ${reqCanonicalString}`)

  let reqStringToSign = await signer.stringToSign()
  console.assert(reqStringToSign === stringToSign, `${test}: Expected stringToSign ${canonicalString}, got ${reqCanonicalString}`)

  let reqAuthHeader = await signer.authHeader()
  console.assert(reqAuthHeader === authHeader, `${test}: Expected authHeader ${authHeader}, got ${reqAuthHeader}`)
}
