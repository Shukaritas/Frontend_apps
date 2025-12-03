import http from '@/services/http-common';
import { User } from '../domain/models/user.model';

const USERS_ENDPOINT = import.meta.env.VITE_ENDPOINT_USERS;

function findJwtInObject(obj) {
  const isJwt = (val) => typeof val === 'string' && val.split('.').length === 3;
  const stack = [obj];
  while (stack.length) {
    const current = stack.pop();
    if (current && typeof current === 'object') {
      for (const key of Object.keys(current)) {
        const val = current[key];
        if (typeof val === 'string' && (isJwt(val) || key.toLowerCase().includes('token'))) return val;
        if (val && typeof val === 'object') stack.push(val);
      }
    }
  }
  return null;
}

function getCI(obj, key) {
  if (!obj || typeof obj !== 'object') return undefined;
  const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
  return found ? obj[found] : undefined;
}

function decodeJwtClaims(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload || {};
  } catch { return {}; }
}

function extractIdFromClaims(claims) {
  return claims?.id ?? claims?.userId ?? claims?.nameid ?? claims?.sub ?? claims?.uid;
}

function isValidId(id) {
  if (id === undefined || id === null) return false;
  if (typeof id === 'number') return Number.isFinite(id);
  if (typeof id === 'string') return id.trim().length > 0;
  return false;
}

export class AuthApiRepository {
  async login(credentials) {
    const endpoint = `${USERS_ENDPOINT}/sign-in`;
    const response = await http.post(endpoint, credentials);
    const data = response.data;

    const token = findJwtInObject(data);
    if (!token) throw new Error('Token no encontrado en la respuesta');

    const claims = decodeJwtClaims(token);
    const id = extractIdFromClaims(claims);
    if (!isValidId(id)) throw new Error('ID de usuario inválido en el token');

    const username = getCI(claims, 'username') || getCI(claims, 'name') || 'Unknown';
    const role = getCI(claims, 'role') || 'USER';

    return { user: new User(id, username, role), token };
  }

  async register(userData) {
    const endpoint = `${USERS_ENDPOINT}/sign-up`;
    const response = await http.post(endpoint, userData);
    const data = response.data;

    const token = findJwtInObject(data);
    if (!token) throw new Error('Token no encontrado en la respuesta');

    const claims = decodeJwtClaims(token);
    const id = extractIdFromClaims(claims);
    if (!isValidId(id)) throw new Error('ID de usuario inválido en el token');

    const username = getCI(claims, 'username') || getCI(claims, 'name') || userData.username;
    const role = getCI(claims, 'role') || 'USER';

    return { user: new User(id, username, role), token };
  }
}
