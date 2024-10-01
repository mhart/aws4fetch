# aws4fetch Example: Calling AWS services from Cloudflare Workers

`src/index.js` contains an example script you can use in a
[Cloudflare Worker](https://workers.cloudflare.com/) to call an
AWS Lambda function, including caching – you could use this in place of an API
Gateway integration, for example.

The relevant portions of the code are the import/setup:

```js
// to allow importing set the type of the project to "webpack" in wrangler.toml
// https://developers.cloudflare.com/workers/tooling/wrangler/configuration#per-project
import { AwsClient } from 'aws4fetch'

// ...

// Assume AWS_* vars have added to your environment
// https://developers.cloudflare.com/workers/reference/apis/environment-variables/#secrets
aws = new AwsClient({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
})

// https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
const LAMBDA_INVOKE_URL = `https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/${LAMBDA_FN}/invocations`

const lambdaResponse = await aws.fetch(LAMBDA_INVOKE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(await toLambdaEvent(request)),
})
```

The conversion from the incoming [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)
to an API-Gateway-style Lambda event:

```js
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
```

And the call to Lambda itself, converting the response into a
[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) you can return from the worker:

```js
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

return new Response(body, { status, headers })
```

## Deploying to Cloudflare

```console
npm install
npx wrangler deploy
```

