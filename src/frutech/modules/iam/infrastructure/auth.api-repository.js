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
  if (typeof id === 'string') return id.trim().length > 0; // acepta UUID o string no vacío
  return false;
}

export class AuthApiRepository {
  /**
   * Realiza login contra API .NET 9.
   * Endpoint: POST /api/v1/users/sign-in via baseURL /api
   */
  async login(email, password) {
    try {
      const resp = await http.post(`${USERS_ENDPOINT}/sign-in`, { email, password });
      let data = resp?.data;

      // 1) Si data es string, asúmelo como token
      if (typeof data === 'string') {
        const token = data;
        const claims = decodeJwtClaims(token);
        const idFromJwt = extractIdFromClaims(claims);
        if (!isValidId(idFromJwt)) throw new Error('La respuesta de login no incluye un ID de usuario válido.');
        const user = new User({ id: idFromJwt, username: claims.unique_name || '', email, password: '******', phoneNumber: '+000000000', identificator: '00000000' });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username, email: user.email }));
        return user;
      }

      // 2) Normalizar si viene envuelto en { data: {...} }
      const body = data && typeof data === 'object' && data.data && typeof data.data === 'object' ? data.data : (data || {});

      // 3) Token por claves comunes (case-insensitive)
      const keyList = Object.keys(body || {});
      const tokenKey = keyList.find(k => ['token','accesstoken','access_token','jwt','jwttoken','bearertoken','authenticationtoken','value'].includes(k.toLowerCase()));
      let token = tokenKey ? body[tokenKey] : undefined;

      // 4) Token en lugares anidados típicos
      if (!token) token = getCI(getCI(body, 'result') || {}, 'token') || getCI(getCI(body, 'signInResponse') || {}, 'token') || getCI(getCI(body, 'response') || {}, 'token') || getCI(getCI(body, 'user') || {}, 'token');

      // 5) Token en headers Authorization: Bearer xxx
      if (!token) {
        const authHeader = resp?.headers?.authorization || resp?.headers?.Authorization;
        if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7);
        }
      }

      // 6) Búsqueda genérica por patrón/clave token
      if (!token) token = findJwtInObject(body);

      // Preparar user con la mejor info disponible
      const userBody = (getCI(body, 'user') && typeof getCI(body, 'user') === 'object') ? getCI(body, 'user') : body;
      let id = getCI(userBody, 'id') ?? getCI(userBody, 'userId') ?? getCI(userBody, 'user_id');

      // Si hay token y no hay id en body, intentamos extraerlo del JWT
      if (!isValidId(id) && token) {
        const claims = decodeJwtClaims(token);
        const idFromJwt = extractIdFromClaims(claims);
        if (isValidId(idFromJwt)) id = idFromJwt;
      }

      // Aceptar sesión con token o con cookie; sólo requerimos ID válido
      if (!isValidId(id)) {
        const backendMessage = getCI(body, 'message') || getCI(body, 'error') || getCI(body, 'detail') || getCI(body, 'title');
        throw new Error(backendMessage || 'La respuesta de login no incluye un ID de usuario válido.');
      }

      const username = getCI(userBody, 'userName') ?? getCI(userBody, 'username') ?? getCI(userBody, 'name') ?? '';
      const emailResp = getCI(userBody, 'email') ?? email;
      const phoneNumberRaw = getCI(userBody, 'phoneNumber');
      const identificatorRaw = getCI(userBody, 'identificator');
      const phoneNumber = typeof phoneNumberRaw === 'string' && /^\+\d+/.test(phoneNumberRaw) ? phoneNumberRaw : '+000000000';
      const identificator = typeof identificatorRaw === 'string' && /^\d{8}$/.test(identificatorRaw) ? identificatorRaw : '00000000';

      const user = new User({ id, username, email: emailResp, password: '******', phoneNumber, identificator });

      // Si hay token, lo guardamos; si no, asumimos sesión vía cookie (withCredentials)
      if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
      localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username, email: user.email }));
      return user;
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Registro de usuario.
   * Endpoint: POST /api/v1/users/sign-up via baseURL /api
   */
  async register({ username, email, phoneNumber, identificator, password }) {
    try {
      if (!email || !password) throw new Error('Email y password son requeridos');
      const payload = { userName: username, email, phoneNumber, identificator, password };
      const response = await http.post(`${USERS_ENDPOINT}/sign-up`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Error en el registro');
    }
  }
}
