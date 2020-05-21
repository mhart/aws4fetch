// @ts-check

import { AwsClient, AwsV4Signer } from '../src/main'

const decoder = new TextDecoder()

const keys = {
  accessKeyId: 'AKIDEXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
}

const datetime = '20150830T123600Z'
const url = 'https://queue.amazonaws.com/'

export default async() => {
  let signer = new AwsV4Signer({ ...keys, url })
  let hash = await signer.hexBodyHash()
  assertEqual(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')

  signer = new AwsV4Signer({ ...keys, url, body: 'a' })
  hash = await signer.hexBodyHash()
  assertEqual(hash, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb')

  signer = new AwsV4Signer({ ...keys, url, body: new ArrayBuffer(0) })
  hash = await signer.hexBodyHash()
  assertEqual(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')

  const bodies = [
    new ArrayBuffer(8),
    new Int8Array(8),
    new Int16Array(4),
    new Int32Array(2),
    new Uint8Array(8),
    new Uint16Array(4),
    new Uint32Array(2),
    new Uint8ClampedArray(8),
    new Float32Array(2),
    new Float64Array(1),
    new DataView(new ArrayBuffer(8)),
  ]

  for (const body of bodies) {
    signer = new AwsV4Signer({ ...keys, url, body })
    hash = await signer.hexBodyHash()
    assertEqual(hash, 'af5570f5a1810b7af78caf4bc70a660f0df51e42baf91d4de5b2328de0e83dfc')
  }

  const client = new AwsClient(keys)

  const buf = await (await client.sign(url, { body: 'a' })).arrayBuffer()
  assertEqual(decoder.decode(buf), 'a')

  for (const body of bodies) {
    const authorization = (await client.sign(url, {
      body,
      aws: { datetime },
    })).headers.get('authorization')
    assertEqual(authorization, 'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/sqs/aws4_request, SignedHeaders=host;x-amz-date, Signature=07135e035abf2ecd131815a03fd5dffc64f7324cc79eaa6400a6d68373a8863d')
  }

  const extraBodies = [
    new Blob(),
    new FormData(),
    new URLSearchParams(),
    new ReadableStream(),
  ]

  for (const body of extraBodies) {
    const authorization = (await client.sign(url, {
      body,
      headers: { 'X-Amz-Content-Sha256': 'af5570f5a1810b7af78caf4bc70a660f0df51e42baf91d4de5b2328de0e83dfc' },
      aws: { datetime },
    })).headers.get('authorization')
    assertEqual(authorization, 'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/sqs/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=28cde03d679fcd9082587d2705ea318df3d61f4d5d7006668b039b66f06c750c')
  }
}

function assertEqual(actual, expected) {
  console.assert(actual === expected, `Expected ${expected} got ${actual}`)
}
