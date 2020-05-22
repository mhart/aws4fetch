# aws4fetch Example: Calling AWS services from Cloudflare Workers

`index.js` contains an example script you can use in a
[CF worker](https://www.cloudflare.com/products/cloudflare-workers/) to call an
AWS Lambda function, including caching – you could use this in place of an API
Gateway integration, for example.

The relevant portions of the code are the import/setup:

```js
import { AwsClient } from 'aws4fetch'

// Assume AWS_* vars have been uploaded via the Cloudflare Worker Secrets Vault
// https://developers.cloudflare.com/workers/api/resource-bindings/secrets-vault/
const aws = new AwsClient({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY })

const LAMBDA_FN = 'my-api-function'

// https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
const LAMBDA_INVOKE_URL = `https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/${LAMBDA_FN}/invocations`
```

The conversion from the incoming [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)
to an API-Gateway-style Lambda event:

```js
async function toLambdaEvent(request) {
  const url = new URL(request.url);
  return {
    httpMethod: request.method,
    path: url.pathname,
    queryStringParameters: [...url.searchParams].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    headers: [...request.headers].reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
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

if (lambdaResponse.status !== 200) {
  return new Response(JSON.stringify({ error: `Lambda returned ${lambdaResponse.status}` }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}

const { statusCode: status, headers, body } = await lambdaResponse.json()

const response = new Response(body, { status, headers })
```

## Bundling and deploying

To bundle the code up:

```console
npm install
npm run build
```

Or run the `rollup` command manually:

```
rollup index.js --format es -p @rollup/plugin-node-resolve -o worker.js
```

You could also use [`webpack`](https://webpack.js.org/), [`parcel`](https://parceljs.org/) or any other JS bundler.

You could then copy/paste the `worker.js` code into the Cloudflare Worker editor, or upload it directly
[using the API](https://developers.cloudflare.com/workers/api/):

```console
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${CF_SCRIPT}" \
  -H 'Content-Type: application/javascript' \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  --data-binary "@./worker.js"
```
