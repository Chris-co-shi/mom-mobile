import { AuthRuntimeError } from './errors';
import type { HttpTransport, IdTokenValidationInput, IdTokenValidator } from './ports';

interface JwtHeader { alg?: string; kid?: string }
interface JwtClaims { iss?: string; aud?: string | string[]; exp?: number; iat?: number; nonce?: string }
interface Discovery { issuer: string; jwks_uri: string }
interface JsonWebKeySet { keys: Array<JsonWebKey & { kid?: string }> }

function decodePart<T>(part: string): T {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function decodeBytes(part: string): Uint8Array {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

export class RemoteJwksIdTokenValidator implements IdTokenValidator {
  constructor(private readonly transport: HttpTransport) {}

  async validate(input: IdTokenValidationInput): Promise<void> {
    const parts = input.idToken.split('.');
    if (parts.length !== 3) throw new AuthRuntimeError('invalid_id_token', 'ID Token 格式无效');
    const header = decodePart<JwtHeader>(parts[0]);
    const claims = decodePart<JwtClaims>(parts[1]);
    if (header.alg !== 'RS256' || !header.kid) {
      throw new AuthRuntimeError('invalid_id_token', 'ID Token 必须使用带 kid 的 RS256');
    }
    const issuer = input.issuer.replace(/\/$/, '');
    const discoveryResponse = await this.transport.request<Discovery>({
      url: `${issuer}/.well-known/openid-configuration`, method: 'GET',
    });
    if (discoveryResponse.status !== 200 || discoveryResponse.body.issuer !== issuer
      || discoveryResponse.body.jwks_uri !== input.jwksUri) {
      throw new AuthRuntimeError('invalid_issuer', 'OIDC Discovery issuer 或 JWKS URI 与显式配置不匹配');
    }
    const jwksResponse = await this.transport.request<JsonWebKeySet>({
      url: input.jwksUri, method: 'GET',
    });
    const jwk = jwksResponse.body.keys?.find((candidate) => candidate.kid === header.kid);
    if (jwksResponse.status !== 200 || !jwk) {
      throw new AuthRuntimeError('unknown_signing_key', 'OIDC 签名密钥不存在');
    }
    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'],
    );
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', key, decodeBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!verified || claims.iss !== issuer || !audiences.includes(input.audience)
      || claims.nonce !== input.nonce || !claims.exp || claims.exp <= input.nowEpochSeconds
      || (claims.iat !== undefined && claims.iat > input.nowEpochSeconds + 60)) {
      throw new AuthRuntimeError('invalid_id_token', 'ID Token 签名或 Claims 校验失败');
    }
  }
}
