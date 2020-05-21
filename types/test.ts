import { AwsClient, AwsRequestInit, AwsV4Signer } from "aws4fetch";

function AwsClientTest() {
  function constructor() {
    // $ExpectError
    new AwsClient({});

    const min = new AwsClient({
      accessKeyId: "value",
      secretAccessKey: "value",
    });

    const all = new AwsClient({
      accessKeyId: "value",
      secretAccessKey: "value",
      sessionToken: "value",
      service: "value",
      region: "value",
      cache: new Map(),
      retries: 1,
      initRetryMs: 1,
    });
  }

  function fetch(client: AwsClient, init: AwsRequestInit) {
    // $ExpectError
    client.fetch();

    // $ExpectType Promise<Response>
    client.fetch("value");
    client.fetch("value", {});
    client.fetch("value", { aws: {} });
    client.fetch("value", init);
    client.fetch(new Request("value"));
    client.fetch(new Request("value"), {});
    client.fetch(new Request("value"), { aws: {} });
    client.fetch(new Request("value"), init);
  }

  function sign(client: AwsClient, init: AwsRequestInit) {
    // $ExpectError
    client.sign();

    // $ExpectType Promise<Request>
    client.sign("value");
    client.sign("value", {});
    client.sign("value", { aws: {} });
    client.sign("value", init);
    client.sign(new Request("value"));
    client.sign(new Request("value"), {});
    client.sign(new Request("value"), { aws: {} });
    client.sign(new Request("value"), init);
  }
}

function AwsRequestInitTest() {
  const min: AwsRequestInit = {};

  const all: AwsRequestInit = {
    method: "value",
    headers: {},
    body: "value",
    aws: {
      signQuery: true,
      accessKeyId: "value",
      secretAccessKey: "value",
      sessionToken: "value",
      service: "value",
      region: "value",
      cache: new Map(),
      datetime: "value",
      appendSessionToken: true,
      allHeaders: true,
      singleEncode: true,
    },
    cache: "default",
    credentials: "same-origin",
    integrity: "value",
    keepalive: true,
    mode: "cors",
    redirect: "follow",
    referrer: "value",
    referrerPolicy: "same-origin",
    signal: new AbortSignal(),
    window: null,
  };
}

function AwsV4SignerTest() {
  function constructor() {
    // $ExpectError
    new AwsV4Signer();

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      retries: 1, // $ExpectError
    });

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      initRetryMs: 1, // $ExpectError
    });

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new Blob(), // $ExpectError
    });

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new FormData(), // $ExpectError
    });

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new URLSearchParams(), // $ExpectError
    });

    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new ReadableStream(), // $ExpectError
    });

    const min = new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
    });

    const all = new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      sessionToken: "value",
      method: "value",
      headers: {},
      body: "value",
      signQuery: true,
      service: "value",
      region: "value",
      cache: new Map(),
      datetime: "value",
      appendSessionToken: true,
      allHeaders: true,
      singleEncode: true,
    });
  }

  function authHeader(signer: AwsV4Signer) {
    // $ExpectType Promise<string>
    signer.authHeader();
  }

  function sign() {
    // $ExpectType Promise<AwsRequestInfo<undefined>>
    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
    }).sign();

    // $ExpectType Promise<AwsRequestInfo<"value">>
    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: "value",
    }).sign();

    // $ExpectType Promise<AwsRequestInfo<ArrayBuffer>>
    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new ArrayBuffer(1),
    }).sign();

    // $ExpectType Promise<AwsRequestInfo<Uint8Array>>
    new AwsV4Signer({
      url: "value",
      accessKeyId: "value",
      secretAccessKey: "value",
      body: new Uint8Array(),
    }).sign();
  }

  function signature(signer: AwsV4Signer) {
    // $ExpectType Promise<string>
    signer.signature();
  }
}
