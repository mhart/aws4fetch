export interface AwsClientInit {
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string | null;
  service?: string | null;
  region?: string | null;
  cache?: Map<string,string> | null;
  retries?: number | null;
  initRetryMs?: number | null;
}

export interface AwsSignerInit extends AwsClientInit {
  url?: string | URL;
  method?: string ;
  headers?: HeadersInit | null;
  body?: BodyInit | null;
  datetime?: string | null;
  signQuery?: boolean | null;
  appendSessionToken?: boolean | null;
  allHeaders?: boolean | null;
  singleEncode?: boolean | null;
}

export interface AwsRequestInfo {
  method: string;
  url: URL;
  headers: Headers;
  body: BodyInit;
}

export interface AwsRequestInit extends RequestInit {
  aws?: AwsSignerInit | null;
}

export class AwsSigner {
  constructor(init: AwsSignerInit);
  public sign(): Promise<AwsRequestInfo>;
}

export class AwsClient {
  constructor(init: AwsClientInit);
  public sign(input: RequestInfo, init?: AwsRequestInit): Promise<Request>;
  public fetch(input: RequestInfo, init?: AwsRequestInit): Promise<Response>;
}
