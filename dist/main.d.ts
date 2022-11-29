export class AwsClient {
    constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs, api }: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
        service?: string;
        region?: string;
        cache?: Map<string, ArrayBuffer>;
        retries?: number;
        initRetryMs?: number;
        api?: typeof DEFAULT_API;
    });
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string | undefined;
    service: string | undefined;
    region: string | undefined;
    cache: Map<any, any>;
    retries: number;
    initRetryMs: number;
    api: {
        fetch: typeof fetch;
        Request: {
            new (input: RequestInfo | URL, init?: RequestInit | undefined): Request;
            prototype: Request;
        };
        Headers: {
            new (init?: HeadersInit | undefined): Headers;
            prototype: Headers;
        };
        crypto: Crypto;
        TextEncoder: {
            new (): TextEncoder;
            prototype: TextEncoder;
        };
    };
    textEncoder: TextEncoder;
    sign(input: RequestInfo, init?: (RequestInit & {
        aws?: {
            accessKeyId?: string | undefined;
            secretAccessKey?: string | undefined;
            sessionToken?: string | undefined;
            service?: string | undefined;
            region?: string | undefined;
            cache?: Map<string, ArrayBuffer> | undefined;
            datetime?: string | undefined;
            signQuery?: boolean | undefined;
            appendSessionToken?: boolean | undefined;
            allHeaders?: boolean | undefined;
            singleEncode?: boolean | undefined;
        } | undefined;
    }) | null | undefined): Promise<Request>;
    fetch(input: RequestInfo, init?: (RequestInit & {
        aws?: {
            accessKeyId?: string | undefined;
            secretAccessKey?: string | undefined;
            sessionToken?: string | undefined;
            service?: string | undefined;
            region?: string | undefined;
            cache?: Map<string, ArrayBuffer> | undefined;
            datetime?: string | undefined;
            signQuery?: boolean | undefined;
            appendSessionToken?: boolean | undefined;
            allHeaders?: boolean | undefined;
            singleEncode?: boolean | undefined;
        } | undefined;
    }) | null | undefined): Promise<Response>;
}
export class AwsV4Signer {
    constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode, api, textEncoder }: {
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
        textEncoder?: TextEncoder;
        api?: {
            Headers: typeof Headers;
            crypto: Crypto;
        };
    });
    api: {
        Headers: typeof Headers;
        crypto: Crypto;
    };
    textEncoder: TextEncoder;
    method: string;
    url: URL;
    headers: Headers;
    body: BodyInit | null | undefined;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string | undefined;
    service: string;
    region: string;
    cache: Map<any, any>;
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
declare namespace DEFAULT_API {
    const fetch_1: typeof globalThis.fetch;
    export { fetch_1 as fetch };
    const Request_1: {
        new (input: RequestInfo | URL, init?: RequestInit | undefined): Request;
        prototype: Request;
    };
    export { Request_1 as Request };
    const Headers_1: {
        new (init?: HeadersInit | undefined): Headers;
        prototype: Headers;
    };
    export { Headers_1 as Headers };
    const crypto_1: Crypto;
    export { crypto_1 as crypto };
    const TextEncoder_1: {
        new (): TextEncoder;
        prototype: TextEncoder;
    };
    export { TextEncoder_1 as TextEncoder };
}
export {};
