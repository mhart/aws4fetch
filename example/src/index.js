import { AwsClient } from 'aws4fetch'

const LAMBDA_FN = 'my-api-function'

/** @type {AwsClient | undefined} */
let aws

/** @type {ExportedHandler} */
export default {
  async fetch(request, env, ctx) {
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

    if (aws == null) {
      // Assume AWS_* vars have added to your environment
      // https://developers.cloudflare.com/workers/reference/apis/environment-variables/#secrets
      aws = new AwsClient({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      })
    }

    // https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
    const LAMBDA_INVOKE_URL = `https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/${LAMBDA_FN}/invocations`

    const lambdaResponse = await aws.fetch(LAMBDA_INVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await toLambdaEvent(request)),
    })

    if (!lambdaResponse.ok) {
      console.error(await lambdaResponse.text())
      return Response.json({ error: `Lambda API returned ${lambdaResponse.status}` }, { status: 500 })
    }

    const { statusCode: status, headers, body } = await lambdaResponse.json()

    const response = new Response(body, { status, headers })

    if (isCacheable && response.headers.has('Cache-Control')) {
      ctx.waitUntil(cache.put(url, response.clone()))
    }

    return response
  },
}

/**
 * @param {Request} request
 */
async function toLambdaEvent(request) {
  const url = new URL(request.url)
  return {
    httpMethod: request.method,
    path: url.pathname,
    queryStringParameters: Object.fromEntries([...url.searchParams]),
    headers: Object.fromEntries([...request.headers]),
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
  }
}
