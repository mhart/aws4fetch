import { AwsClient, AwsV4Signer } from '../src/main'

const keys = {
  accessKeyId: 'AKIDEXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
}

const datetime = '20150830T123600Z'
const url = 'https://example-bucket.s3.us-east-1.amazonaws.com/file.txt'

export default async() => {
  const client = new AwsClient(keys)
  const values = [
    ['hello world', 'hello%20world'],
    ['hello+world', 'hello%2Bworld'],
    ['hello + world', 'hello%20%2B%20world'],
    ['hello%20world', 'hello%2520world'],
    ['café 世界', 'caf%C3%A9%20%E4%B8%96%E7%95%8C'],
    ['', ''],
  ]

  for (const [value, encoded] of values) {
    const input = new URL(url)
    input.searchParams.set('value', value)
    const request = await client.sign(input, { aws: { datetime, signQuery: true } })
    const signedUrl = new URL(request.url)
    assertEqual(signedUrl.search.split('&').find(part => part.startsWith('?value=')), `?value=${encoded}`)
    assertEqual(signedUrl.searchParams.get('value'), value)
  }

  const input = url + '?response-content-disposition=attachment%3B%20filename%3D%22hello%20world.txt%22'
  const signer = new AwsV4Signer({ ...keys, url: input, datetime, signQuery: true })
  const canonicalString = await signer.canonicalString()
  const signed = await signer.sign()
  assertEqual(signed.url.search.includes('+'), false)
  assertEqual(signed.url.searchParams.get('X-Amz-Signature'), '5bdf9ab309960788951408d5ef912a01be56b5fe668078a70d79bcb34338e935')
  assertEqual(await signer.canonicalString(), canonicalString)

  const request = await client.sign(new Request(input), { aws: { datetime, signQuery: true } })
  assertEqual(request.url, signed.url.toString())

  for (const appendSessionToken of [false, true]) {
    const tokenClient = new AwsClient({ ...keys, sessionToken: 'token +/=' })
    const tokenRequest = await tokenClient.sign(url, { aws: { datetime, signQuery: true, appendSessionToken } })
    const tokenUrl = new URL(tokenRequest.url)
    assertEqual(tokenUrl.search.includes('+'), false)
    assertEqual(tokenUrl.search.includes('X-Amz-Security-Token=token%20%2B%2F%3D'), true)
    assertEqual(tokenUrl.searchParams.get('X-Amz-Security-Token'), 'token +/=')
  }

  const headerRequest = await client.sign(input, { aws: { datetime } })
  assertEqual(headerRequest.url, input)
  assertEqual(headerRequest.headers.has('Authorization'), true)
}

function assertEqual(actual, expected) {
  console.assert(actual === expected, `Expected ${expected} got ${actual}`)
}
