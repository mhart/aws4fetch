import { AwsClient } from 'aws4fetch'

// Assume AWS_* vars have added to your environment
// https://developers.cloudflare.com/workers/reference/apis/environment-variables/#secrets
const aws = new AwsClient({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY }) // eslint-disable-line no-undef

const LAMBDA_FN = 'my-api-function'

// https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
const LAMBDA_INVOKE_URL = `https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/${LAMBDA_FN}/invocations`

addEventListener('fetch', event => event.respondWith(handle(event)))

async function handle(event) {
  const { request } = event
  const { method, url } = request

  if (method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // https://developers.cloudflare.com/workers/reference/apis/cache/
  const cache = caches.default

  const isCacheable = ['GET', 'HEAD'].includes(method)
  if (isCacheable) {
    const response = await cache.match(url)
    if (response != null) {
      return response
    }
  }

  const lambdaResponse = await aws.fetch(LAMBDA_INVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(await toLambdaEvent(request)),
  })

  if (lambdaResponse.status !== 200) {
    return new Response(JSON.stringify({ error: `Lambda returned ${lambdaResponse.status}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { statusCode: status, headers, body } = await lambdaResponse.json()

  const response = new Response(body, { status, headers })

  if (isCacheable && response.headers.has('Cache-Control')) {
    event.waitUntil(cache.put(url, response.clone()))
  }

  return response
}

async function toLambdaEvent(request) {
  const url = new URL(request.url)
  return {
    httpMethod: request.method,
    path: url.pathname,
    queryStringParameters: [...url.searchParams].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    headers: [...request.headers].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
  }
}
