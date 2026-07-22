import type { HttpRequest, HttpResponse, HttpTransport, SystemBrowser } from './ports';

function normalizeHeaders(header: unknown): Record<string, string> {
  if (!header || typeof header !== 'object') return {};
  return Object.fromEntries(Object.entries(header).map(([key, value]) => [key.toLowerCase(), String(value)]));
}

export class UniHttpTransport implements HttpTransport {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      uni.request({
        url: request.url,
        method: request.method as UniApp.RequestOptions['method'],
        header: request.headers,
        data: request.body,
        success: (response) => resolve({
          status: response.statusCode,
          headers: normalizeHeaders(response.header),
          body: response.data as T,
        }),
        fail: (error) => reject(new Error(error.errMsg || '网络请求失败')),
      });
    });
  }
}

export class UniSystemBrowser implements SystemBrowser {
  async open(url: string): Promise<void> {
    // #ifdef APP-PLUS
    plus.runtime.openURL(url);
    // #endif
    // #ifdef H5
    window.location.assign(url);
    // #endif
  }
}
