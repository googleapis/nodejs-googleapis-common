import {GaxiosResponse} from 'gaxios';

// TypeScript does not have `HeadersInit` in the standard types yet
export type HeadersInit = ConstructorParameters<typeof Headers>[0];

/**
 * A utility for converting potential {@link Headers `Headers`} objects to plain headers objects.
 *
 * @param headers any compatible `HeadersInit` (`Headers`, (string, string)[], {})
 * @returns the headers in `Record<string, string>` form.
 */
export function headersToClassicHeaders<T extends Record<string, string>>(
  headers: HeadersInit,
): T {
  let classicHeaders: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      classicHeaders[key] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      classicHeaders[key] = value;
    }
  } else {
    classicHeaders = headers || {};
  }

  return classicHeaders as T;
}

/**
 * Martial a GaxiosResponse into a library-friendly type.
 *
 * @param res the Gaxios Response
 * @returns the GaxiosResponse with HTTP2-ready/compatible headers
 */
export function martialGaxiosResponse<T extends GaxiosResponse>(res?: T) {
  return Object.assign({}, res, {
    headers: headersToClassicHeaders(res?.headers),
  });
}
