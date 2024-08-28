(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.aws4fetch = {}));
})(this, (function (exports) { 'use strict';

  /**
   * @license MIT <https://opensource.org/licenses/MIT>
   * @copyright Michael Hart 2024
   */
  const encoder = new TextEncoder();
  const HOST_SERVICES = {
    appstream2: 'appstream',
    cloudhsmv2: 'cloudhsm',
    email: 'ses',
    marketplace: 'aws-marketplace',
    mobile: 'AWSMobileHubService',
    pinpoint: 'mobiletargeting',
    queue: 'sqs',
    'git-codecommit': 'codecommit',
    'mturk-requester-sandbox': 'mturk-requester',
    'personalize-runtime': 'personalize',
  };
  const UNSIGNABLE_HEADERS = new Set([
    'authorization',
    'content-type',
    'content-length',
    'user-agent',
    'presigned-expires',
    'expect',
    'x-amzn-trace-id',
    'range',
    'connection',
  ]);
  class AwsClient {
    constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs }) {
      if (accessKeyId == null) throw new TypeError('accessKeyId is a required option')
      if (secretAccessKey == null) throw new TypeError('secretAccessKey is a required option')
      this.accessKeyId = accessKeyId;
      this.secretAccessKey = secretAccessKey;
      this.sessionToken = sessionToken;
      this.service = service;
      this.region = region;
      this.cache = cache || new Map();
      this.retries = retries != null ? retries : 10;
      this.initRetryMs = initRetryMs || 50;
    }
    async sign(input, init) {
      if (input instanceof Request) {
        const { method, url, headers, body } = input;
        init = Object.assign({ method, url, headers }, init);
        if (init.body == null && headers.has('Content-Type')) {
          init.body = body != null && headers.has('X-Amz-Content-Sha256') ? body : await input.clone().arrayBuffer();
        }
        input = url;
      }
      const signer = new AwsV4Signer(Object.assign({ url: input.toString() }, init, this, init && init.aws));
      const signed = Object.assign({}, init, await signer.sign());
      delete signed.aws;
      try {
        return new Request(signed.url.toString(), signed)
      } catch (e) {
        if (e instanceof TypeError) {
          return new Request(signed.url.toString(), Object.assign({ duplex: 'half' }, signed))
        }
        throw e
      }
    }
    async fetch(input, init) {
      for (let i = 0; i <= this.retries; i++) {
        const fetched = fetch(await this.sign(input, init));
        if (i === this.retries) {
          return fetched
        }
        const res = await fetched;
        if (res.status < 500 && res.status !== 429) {
          return res
        }
        await new Promise(resolve => setTimeout(resolve, Math.random() * this.initRetryMs * Math.pow(2, i)));
      }
      throw new Error('An unknown error occurred, ensure retries is not negative')
    }
  }
  class AwsV4Signer {
    constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }) {
      if (url == null) throw new TypeError('url is a required option')
      if (accessKeyId == null) throw new TypeError('accessKeyId is a required option')
      if (secretAccessKey == null) throw new TypeError('secretAccessKey is a required option')
      this.method = method || (body ? 'POST' : 'GET');
      this.url = new URL(url);
      this.headers = new Headers(headers || {});
      this.body = body;
      this.accessKeyId = accessKeyId;
      this.secretAccessKey = secretAccessKey;
      this.sessionToken = sessionToken;
      let guessedService, guessedRegion;
      if (!service || !region) {
  [guessedService, guessedRegion] = guessServiceRegion(this.url, this.headers);
      }
      this.service = service || guessedService || '';
      this.region = region || guessedRegion || 'us-east-1';
      this.cache = cache || new Map();
      this.datetime = datetime || new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
      this.signQuery = signQuery;
      this.appendSessionToken = appendSessionToken || this.service === 'iotdevicegateway';
      this.headers.delete('Host');
      if (this.service === 's3' && !this.signQuery && !this.headers.has('X-Amz-Content-Sha256')) {
        this.headers.set('X-Amz-Content-Sha256', 'UNSIGNED-PAYLOAD');
      }
      const params = this.signQuery ? this.url.searchParams : this.headers;
      params.set('X-Amz-Date', this.datetime);
      if (this.sessionToken && !this.appendSessionToken) {
        params.set('X-Amz-Security-Token', this.sessionToken);
      }
      this.signableHeaders = ['host', ...this.headers.keys()]
        .filter(header => allHeaders || !UNSIGNABLE_HEADERS.has(header))
        .sort();
      this.signedHeaders = this.signableHeaders.join(';');
      this.canonicalHeaders = this.signableHeaders
        .map(header => header + ':' + (header === 'host' ? this.url.host : (this.headers.get(header) || '').replace(/\s+/g, ' ')))
        .join('\n');
      this.credentialString = [this.datetime.slice(0, 8), this.region, this.service, 'aws4_request'].join('/');
      if (this.signQuery) {
        if (this.service === 's3' && !params.has('X-Amz-Expires')) {
          params.set('X-Amz-Expires', '86400');
        }
        params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
        params.set('X-Amz-Credential', this.accessKeyId + '/' + this.credentialString);
        params.set('X-Amz-SignedHeaders', this.signedHeaders);
      }
      if (this.service === 's3') {
        try {
          this.encodedPath = decodeURIComponent(this.url.pathname.replace(/\+/g, ' '));
        } catch (e) {
          this.encodedPath = this.url.pathname;
        }
      } else {
        this.encodedPath = this.url.pathname.replace(/\/+/g, '/');
      }
      if (!singleEncode) {
        this.encodedPath = encodeURIComponent(this.encodedPath).replace(/%2F/g, '/');
      }
      this.encodedPath = encodeRfc3986(this.encodedPath);
      const seenKeys = new Set();
      this.encodedSearch = [...this.url.searchParams]
        .filter(([k]) => {
          if (!k) return false
          if (this.service === 's3') {
            if (seenKeys.has(k)) return false
            seenKeys.add(k);
          }
          return true
        })
        .map(pair => pair.map(p => encodeRfc3986(encodeURIComponent(p))))
        .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0)
        .map(pair => pair.join('='))
        .join('&');
    }
    async sign() {
      if (this.signQuery) {
        this.url.searchParams.set('X-Amz-Signature', await this.signature());
        if (this.sessionToken && this.appendSessionToken) {
          this.url.searchParams.set('X-Amz-Security-Token', this.sessionToken);
        }
      } else {
        this.headers.set('Authorization', await this.authHeader());
      }
      return {
        method: this.method,
        url: this.url,
        headers: this.headers,
        body: this.body,
      }
    }
    async authHeader() {
      return [
        'AWS4-HMAC-SHA256 Credential=' + this.accessKeyId + '/' + this.credentialString,
        'SignedHeaders=' + this.signedHeaders,
        'Signature=' + (await this.signature()),
      ].join(', ')
    }
    async signature() {
      const date = this.datetime.slice(0, 8);
      const cacheKey = [this.secretAccessKey, date, this.region, this.service].join();
      let kCredentials = this.cache.get(cacheKey);
      if (!kCredentials) {
        const kDate = await hmac('AWS4' + this.secretAccessKey, date);
        const kRegion = await hmac(kDate, this.region);
        const kService = await hmac(kRegion, this.service);
        kCredentials = await hmac(kService, 'aws4_request');
        this.cache.set(cacheKey, kCredentials);
      }
      return buf2hex(await hmac(kCredentials, await this.stringToSign()))
    }
    async stringToSign() {
      return [
        'AWS4-HMAC-SHA256',
        this.datetime,
        this.credentialString,
        buf2hex(await hash(await this.canonicalString())),
      ].join('\n')
    }
    async canonicalString() {
      return [
        this.method.toUpperCase(),
        this.encodedPath,
        this.encodedSearch,
        this.canonicalHeaders + '\n',
        this.signedHeaders,
        await this.hexBodyHash(),
      ].join('\n')
    }
    async hexBodyHash() {
      let hashHeader = this.headers.get('X-Amz-Content-Sha256') || (this.service === 's3' && this.signQuery ? 'UNSIGNED-PAYLOAD' : null);
      if (hashHeader == null) {
        if (this.body && typeof this.body !== 'string' && !('byteLength' in this.body)) {
          throw new Error('body must be a string, ArrayBuffer or ArrayBufferView, unless you include the X-Amz-Content-Sha256 header')
        }
        hashHeader = buf2hex(await hash(this.body || ''));
      }
      return hashHeader
    }
  }
  async function hmac(key, string) {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      typeof key === 'string' ? encoder.encode(key) : key,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign'],
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string))
  }
  async function hash(content) {
    return crypto.subtle.digest('SHA-256', typeof content === 'string' ? encoder.encode(content) : content)
  }
  const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  function buf2hex(arrayBuffer) {
    const buffer = new Uint8Array(arrayBuffer);
    let out = '';
    for (let idx = 0; idx < buffer.length; idx++) {
      const n = buffer[idx];
      out += HEX_CHARS[(n >>> 4) & 0xF];
      out += HEX_CHARS[n & 0xF];
    }
    return out
  }
  function encodeRfc3986(urlEncodedStr) {
    return urlEncodedStr.replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
  }
  function guessServiceRegion(url, headers) {
    const { hostname, pathname } = url;
    if (hostname.endsWith('.on.aws')) {
      const match = hostname.match(/^[^.]{1,63}\.lambda-url\.([^.]{1,63})\.on\.aws$/);
      return match != null ? ['lambda', match[1] || ''] : ['', '']
    }
    if (hostname.endsWith('.r2.cloudflarestorage.com')) {
      return ['s3', 'auto']
    }
    if (hostname.endsWith('.backblazeb2.com')) {
      const match = hostname.match(/^(?:[^.]{1,63}\.)?s3\.([^.]{1,63})\.backblazeb2\.com$/);
      return match != null ? ['s3', match[1] || ''] : ['', '']
    }
    const match = hostname.replace('dualstack.', '').match(/([^.]{1,63})\.(?:([^.]{0,63})\.)?amazonaws\.com(?:\.cn)?$/);
    let service = (match && match[1]) || '';
    let region = match && match[2];
    if (region === 'us-gov') {
      region = 'us-gov-west-1';
    } else if (region === 's3' || region === 's3-accelerate') {
      region = 'us-east-1';
      service = 's3';
    } else if (service === 'iot') {
      if (hostname.startsWith('iot.')) {
        service = 'execute-api';
      } else if (hostname.startsWith('data.jobs.iot.')) {
        service = 'iot-jobs-data';
      } else {
        service = pathname === '/mqtt' ? 'iotdevicegateway' : 'iotdata';
      }
    } else if (service === 'autoscaling') {
      const targetPrefix = (headers.get('X-Amz-Target') || '').split('.')[0];
      if (targetPrefix === 'AnyScaleFrontendService') {
        service = 'application-autoscaling';
      } else if (targetPrefix === 'AnyScaleScalingPlannerFrontendService') {
        service = 'autoscaling-plans';
      }
    } else if (region == null && service.startsWith('s3-')) {
      region = service.slice(3).replace(/^fips-|^external-1/, '');
      service = 's3';
    } else if (service.endsWith('-fips')) {
      service = service.slice(0, -5);
    } else if (region && /-\d$/.test(service) && !/-\d$/.test(region)) {
  [service, region] = [region, service];
    }
    return [HOST_SERVICES[service] || service, region || '']
  }

  exports.AwsClient = AwsClient;
  exports.AwsV4Signer = AwsV4Signer;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
