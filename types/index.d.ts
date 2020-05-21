// Minimum TypeScript Version: 3.5

export type Body = ArrayBuffer | ArrayBufferView | string;

export interface AwsClientInit {
  /** The access key. Akin to AWS_ACCESS_KEY_ID. */
  readonly accessKeyId: string;

  /** The secret access key. Akin to AWS_SECRET_ACCESS_KEY. */
  readonly secretAccessKey: string;

  /** The session token. Akin to AWS_SESSION_TOKEN if using temp credentials. */
  readonly sessionToken?: string;

  /**
   * The service name.
   * If not specified, it's attempted to be extracted from the service endpoint URL.
   * See: https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html
   */
  readonly service?: string;

  /**
   * The AWS region code.
   * If not specified, it's attempted to be extracted from the URL/headers.
   * See: https://docs.aws.amazon.com/general/latest/gr/rande.html#region-names-codes
   */
  readonly region?: string;

  /**
   * The AWS credentials cache.
   *
   * @default new Map()
   */
  readonly cache?: Map<string, string>;

  /**
   * The number of retries before giving up.
   * Set to 0 for no retrying.
   *
   * @default 10
   */
  readonly retries?: number;

  /**
   * The retry timeout that doubles with each retry in milliseconds.
   *
   * @default 50
   */
  readonly initRetryMs?: number;
}

export interface AwsSignerInit<TBody extends Body | undefined = undefined>
  extends Omit<AwsClientInit, "retries" | "initRetryMs"> {
  /** The URL of the request. */
  readonly url: string | URL;

  /**
   * The method of the request.
   *
   * @default POST if a body
   */
  readonly method?: string;

  /** The headers of the request. */
  readonly headers?: HeadersInit;

  /** The body of the request. */
  readonly body?: TBody;

  /**
   * The date of the request.
   * Use format yyyyMMddThhmmssZ (e.g. 20150830T123600Z)
   *
   * @default Date.now()
   */
  readonly datetime?: string | null;

  /**
   * Indicates whether the signature should be included in the query rather than the `Authorization` header.
   *
   * @default false
   */
  readonly signQuery?: boolean;

  /**
   * Indicates whether `X-Amz-Security-Token` should be appended to the request.
   *
   * @default true for `service === "iotdevicegateway"`
   */
  readonly appendSessionToken?: boolean;

  /**
   * Indicates whether all headers should be signed instead of the default ones.
   *
   * @default false
   */
  readonly allHeaders?: boolean;

  /**
   * Indicates whether "%2F" (i.e. "/") should be URL-encoded only once.
   * Usually this is only needed for testing.
   *
   * @default false
   */
  readonly singleEncode?: boolean;
}

export interface AwsRequestInfo<T extends Body | undefined = undefined> {
  /** The method of the signed request. */
  readonly method: string;

  /** The URL of the signed request. */
  readonly url: URL;

  /** The headers of the signed request. */
  readonly headers: Headers;

  /** The body of the signed request. */
  readonly body: T;
}

export interface AwsRequestInit<TBody extends Body | undefined = undefined>
  extends RequestInit {
  readonly aws?: Partial<
    Omit<AwsSignerInit<TBody>, "body" | "headers" | "method" | "url">
  >;
}

export class AwsV4Signer<TBody extends Body | undefined = undefined> {
  constructor(init: AwsSignerInit<TBody>);

  /**
   * Returns a Promise that resolves to the signed string to use in the `Authorization` header.
   * Used by the `sign()` method – you shouldn't need to access this directly unless you're constructing your own requests.
   * See: https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html#sigv4-add-signature-auth-header
   */
  authHeader(): Promise<string>;

  /** Actually perform the signing of the request and return a Promise that resolves to an object containing the signed method, url, headers and body. */
  sign(): Promise<AwsRequestInfo<TBody>>;

  /**
   * Returns a string with the hex signature.
   * Used by the `sign()` method – you shouldn't need to access this directly unless you're constructing your own requests.
   * See: https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html#sigv4-calculate-signature
   */
  signature(): Promise<string>;
}

export class AwsClient {
  constructor(init: AwsClientInit);

  /**
   * Returns a Promise that resolves to an AWS4 signed `Request`.
   * Use this to create a Request you can send using fetch() yourself.
   * @param input The URL or `Request` instance
   * @param init The request initialization object
   */
  sign(input: RequestInfo, init?: AwsRequestInit): Promise<Request>;

  /**
   * Equivalent of `fetch` but with AWS SigV4.
   * @param input The URL or `Request` instance
   * @param init The request initialization object
   */
  fetch(input: RequestInfo, init?: AwsRequestInit): Promise<Response>;
}
