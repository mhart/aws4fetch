export class AwsClient {
    constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs }: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
        service?: string;
        region?: string;
        cache?: Map<string, ArrayBuffer>;
        retries?: number;
        initRetryMs?: number;
    });
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string | undefined;
    service: string | undefined;
    region: string | undefined;
    cache: Map<string, ArrayBuffer>;
    retries: number;
    initRetryMs: number;
    sign(input: Request | {
        toString: () => string;
    }, init?: (RequestInit & {
        aws?: {
            accessKeyId?: string;
            secretAccessKey?: string;
            sessionToken?: string;
            service?: string;
            region?: string;
            cache?: Map<string, ArrayBuffer>;
            datetime?: string;
            signQuery?: boolean;
            appendSessionToken?: boolean;
            allHeaders?: boolean;
            singleEncode?: boolean;
        };
    }) | null | undefined): Promise<Request>;
    fetch(input: Request | {
        toString: () => string;
    }, init?: (RequestInit & {
        aws?: {
            accessKeyId?: string;
            secretAccessKey?: string;
            sessionToken?: string;
            service?: string;
            region?: string;
            cache?: Map<string, ArrayBuffer>;
            datetime?: string;
            signQuery?: boolean;
            appendSessionToken?: boolean;
            allHeaders?: boolean;
            singleEncode?: boolean;
        };
    }) | null | undefined): Promise<Response>;
}
export class AwsV4Signer {
    constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }: {
        method?: string;
        url: string;
        headers?: HeadersInit;
        body?: BodyInit | null;
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
        service?: string;
        region?: string;
        cache?: Map<string, ArrayBuffer>;
        datetime?: string;
        signQuery?: boolean;
        appendSessionToken?: boolean;
        allHeaders?: boolean;
        singleEncode?: boolean;
    });
    method: string;
    url: URL;
    headers: Headers;
    body: BodyInit | null | undefined;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string | undefined;
    service: string;
    region: string;
    cache: Map<string, ArrayBuffer>;
    datetime: string;
    signQuery: boolean | undefined;
    appendSessionToken: boolean;
    signableHeaders: string[];
    signedHeaders: string;
    canonicalHeaders: string;
    credentialString: string;
    encodedPath: string;
    encodedSearch: string;
    sign(): Promise<{
        method: string;
        url: URL;
        headers: Headers;
        body?: BodyInit | null;
    }>;
    authHeader(): Promise<string>;
    signature(): Promise<string>;
    stringToSign(): Promise<string>;
    canonicalString(): Promise<string>;
    hexBodyHash(): Promise<string>;
}
