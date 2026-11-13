/**
 * Capa de datos de Movienatic.
 *
 * - Autenticación: API real con JWT (http://localhost:8080).
 * - Resto de datos: mock local mientras se conectan los endpoints.
 */

import {
  GENRES,
  MOVIES,
  MOVIE_LISTS,
  USERS,
  type Genre,
  type Movie,
  type MovieList,
  type UserBasic,
} from './data/mockData';

export type {
  Genre,
  Movie,
  MovieList,
  UserBasic,
} from './data/mockData';

// ---------------------------------------------------------------------------
// Tipos de peticiones
// ---------------------------------------------------------------------------

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  username: string;
  email: string;
  password: string;
};

export type AuthUser = {
  username: string;
  email: string;
  roles: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  email: string;
  roles: string[];
};

/** Respuesta de POST /auth/login (el backend devuelve `token`). */
export type LoginResponse = {
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken: string;
  email: string;
  username: string;
  type?: string;
};

/** Respuesta de POST /auth/refresh. */
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  type?: string;
  email: string;
  username: string;
};

export type RegisterResponse = {
  message: string;
};

export type MovieFilter = {
  title?: string;
  genreIds?: number[];
  director?: string;
  releaseYear?: number;
  minRating?: number;
};

/** Datos que devuelve GET /movies (vista resumen). */
export type MovieSummary = {
  id: number;
  title: string;
  posterURL?: string | null;
  releaseYear?: number;
  averageRating?: number | null;
};

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type MoviePageResponse = PageResponse<MovieSummary>;

/** Miembro del reparto tal como lo devuelve el backend. */
export type CastingItem = {
  name: string;
  character?: string | null;
};

/** Respuesta de GET /movies/{movieId}/detail. */
export type MovieDetail = MovieSummary & {
  description?: string | null;
  genres?: Genre[];
  numberOfRatings?: number | null;
  casting?: CastingItem[];
};

/** Reseña de una película (GET /movies/{id}/reviews). */
export type Review = {
  id?: number;
  movieId?: number;
  userId?: number;
  username?: string | null;
  content: string;
  rating: number;
  likes: number;
  dislikes: number;
  timestamp: string;
  user?: {
    id?: number;
    username: string;
    photoURL?: string | null;
  };
};

/** Voto del usuario autenticado sobre una reseña. */
export type ReviewVote = {
  reviewId: number;
  isLike: boolean;
};

export type Pageable = {
  page?: number;
  size?: number;
  sort?: string[];
};

// ---------------------------------------------------------------------------
// Configuración y almacenamiento de la sesión JWT
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ACCESS_TOKEN_KEY = 'movienatic_access_token';
const REFRESH_TOKEN_KEY = 'movienatic_refresh_token';
const USER_KEY = 'movienatic_user';
const LEGACY_TOKEN_KEY = 'movienatic_token';

/** Evento que avisa a React de que la sesión guardada ha cambiado. */
export const AUTH_EVENT = 'movienatic:auth-change';

function notifyAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

// Limpia el token mock de versiones anteriores.
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: session.username,
      email: session.email,
      roles: session.roles,
    })
  );
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  notifyAuthChange();
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  notifyAuthChange();
}

/** Reconstruye la sesión a partir de lo guardado en localStorage. */
export function getStoredSession(): AuthSession | null {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getCurrentUser();
  if (!accessToken || !refreshToken || !user) return null;

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    username: user.username,
    email: user.email,
    roles: user.roles?.length ? user.roles : rolesFromToken(accessToken),
  };
}

// ---------------------------------------------------------------------------
// Utilidades JWT
// ---------------------------------------------------------------------------

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  return typeof payload?.exp === 'number' ? payload.exp : null;
}

/** `skewSeconds` permite considerar expirado un token unos segundos antes. */
export function isTokenExpired(token: string, skewSeconds = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return Date.now() >= (expiry - skewSeconds) * 1000;
}

function rolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  const roles = payload?.roles ?? payload?.authorities;
  if (Array.isArray(roles)) return roles.map(String);
  if (typeof roles === 'string') return [roles];
  return ['USER'];
}

// ---------------------------------------------------------------------------
// Cliente HTTP
// ---------------------------------------------------------------------------

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
  /** Algunos endpoints (p. ej. crear reseña) devuelven texto plano en vez de JSON. */
  responseType?: 'json' | 'text';
  /** Fuerza a ignorar la caché HTTP cuando necesitamos datos frescos. */
  cache?: RequestCache;
};

async function parseError(
  response: Response
): Promise<Error & { status?: number }> {
  let message = `Error ${response.status}`;
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message = body.message || body.error || message;
    } else {
      const text = await response.text();
      if (text) message = text;
    }
  } catch {
    // Si el cuerpo no se puede leer, mantenemos el mensaje genérico.
  }
  const error = new Error(message) as Error & { status?: number };
  error.status = response.status;
  return error;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = options;

  if (auth) {
    const currentToken = getAccessToken();
    if (!currentToken || isTokenExpired(currentToken, 15)) {
      await refreshSession();
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    cache: options.cache,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Token caducado o revocado: intentamos refrescar y repetir una sola vez.
  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  if (options.responseType === 'text') return text as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Autenticación real (JWT)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<AuthSession | null> | null = null;

/**
 * Refresca el access token usando el refresh token.
 * Es single-flight: varias peticiones simultáneas comparten la misma llamada,
 * lo que evita invalidar el refresh token por rotación.
 */
export async function refreshSession(): Promise<AuthSession | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const response = await request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        auth: false,
      });

      const session: AuthSession = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.type || 'Bearer',
        username: response.username,
        email: response.email,
        roles: rolesFromToken(response.accessToken),
      };
      saveAuthSession(session);
      return session;
    } catch {
      clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function login(data: LoginDto): Promise<AuthSession> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
    auth: false,
  });

  const accessToken = response.token || response.accessToken;
  if (!accessToken) {
    throw new Error('El servidor no devolvió un token de acceso.');
  }
  if (!response.refreshToken) {
    throw new Error('El servidor no devolvió un refresh token.');
  }

  const session: AuthSession = {
    accessToken,
    refreshToken: response.refreshToken,
    tokenType: response.type || 'Bearer',
    username: response.username,
    email: response.email,
    roles: rolesFromToken(accessToken),
  };

  saveAuthSession(session);
  return session;
}

export async function register(
  data: RegisterDto
): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: data,
    auth: false,
  });
}

export function logout(): void {
  clearAuthSession();
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Películas
// ---------------------------------------------------------------------------

export async function getMovies(
  pageable: Pageable = {},
  filter: MovieFilter = {}
): Promise<MoviePageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(pageable.page ?? 0));
  params.set('size', String(pageable.size ?? 20));

  // Sin orden por defecto: respetamos el orden que devuelve el backend.
  pageable.sort?.forEach((sort) => params.append('sort', sort));

  const title = filter.title?.trim();
  if (title) params.set('title', title);

  filter.genreIds?.forEach((genreId) =>
    params.append('genreIds', String(genreId))
  );

  const director = filter.director?.trim();
  if (director) params.set('director', director);

  if (filter.releaseYear != null) {
    params.set('releaseYear', String(filter.releaseYear));
  }
  if (filter.minRating != null) {
    params.set('minRating', String(filter.minRating));
  }

  return request<MoviePageResponse>(`/movies?${params.toString()}`, {
    auth: false,
    cache: 'no-store',
  });
}

export async function getMovieById(movieId: number): Promise<MovieSummary> {
  return request<MovieSummary>(`/movies/${movieId}`, { auth: false, cache: 'no-store' });
}

export async function getMovieDetail(movieId: number): Promise<MovieDetail> {
  return request<MovieDetail>(`/movies/${movieId}/detail`, {
    auth: false,
    cache: 'no-store',
  });
}

export async function getMovieCasting(movieId: number): Promise<CastingItem[]> {
  const response = await request<{ casting?: CastingItem[] }>(
    `/movies/${movieId}/casting`,
    { auth: false }
  );
  return response.casting ?? [];
}

export async function getMovieReviews(movieId: number): Promise<Review[]> {
  return request<Review[]>(`/movies/${movieId}/reviews`, {
    auth: false,
    cache: 'no-store',
  });
}

export async function getGenres(): Promise<Genre[]> {
  await delay(40);
  return GENRES;
}

/**
 * Resuelve el id del usuario autenticado a partir de su nombre de usuario.
 * El backend identifica las reseñas por `/users/{userId}/reviews` y el JWT
 * solo incluye el email, así que consultamos la lista de usuarios una vez.
 */
let cachedUserId: { username: string; id: number } | null = null;

export async function getUserIdByUsername(username: string): Promise<number> {
  if (cachedUserId?.username === username) return cachedUserId.id;

  const response = await request<PageResponse<UserBasic>>('/users?size=1000', {
    auth: true,
  });
  const match = (response.content || []).find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (!match) {
    throw new Error('No se pudo identificar tu usuario. Vuelve a iniciar sesión.');
  }

  cachedUserId = { username, id: match.id };
  return match.id;
}

// ---------------------------------------------------------------------------
// Reseñas
// ---------------------------------------------------------------------------

export async function addReview(
  userId: number,
  data: { movieId: number; content: string; rating: number }
): Promise<void> {
  await request<string>(`/users/${userId}/reviews`, {
    method: 'POST',
    responseType: 'text',
    body: {
      movieId: data.movieId,
      content: data.content,
      rating: data.rating,
    },
  });
}

export async function updateReview(
  userId: number,
  reviewId: number,
  data: { content: string; rating: number }
): Promise<void> {
  await request<string>(`/users/${userId}/reviews/${reviewId}`, {
    method: 'PATCH',
    responseType: 'text',
    body: {
      content: data.content,
      rating: data.rating,
    },
  });
}

export async function deleteReview(
  userId: number,
  reviewId: number
): Promise<void> {
  await request<string>(`/users/${userId}/reviews/${reviewId}`, {
    method: 'DELETE',
    responseType: 'text',
  });
}

export async function likeReview(userId: number, reviewId: number): Promise<void> {
  await request<string>(`/users/${userId}/reviews/${reviewId}/like`, {
    method: 'PATCH',
    responseType: 'text',
  });
}

export async function dislikeReview(userId: number, reviewId: number): Promise<void> {
  await request<string>(`/users/${userId}/reviews/${reviewId}/dislike`, {
    method: 'PATCH',
    responseType: 'text',
  });
}

/** Votos del usuario para las reseñas de una película (o todos si se omite). */
export async function getReviewVotes(
  userId: number,
  movieId?: number
): Promise<ReviewVote[]> {
  const query = movieId != null ? `?movieId=${movieId}` : '';
  return request<ReviewVote[]>(`/users/${userId}/reviews/votes${query}`, {
    cache: 'no-store',
  });
}

// ---------------------------------------------------------------------------
// Favoritos / Pendientes (mock en memoria)
// ---------------------------------------------------------------------------

const favouritesByUser = new Map<number, Set<number>>();
const pendingByUser = new Map<number, Set<number>>();

function getSet(map: Map<number, Set<number>>, userId: number): Set<number> {
  if (!map.has(userId)) map.set(userId, new Set());
  return map.get(userId)!;
}

export async function getFavourites(userId: number): Promise<Movie[]> {
  await delay(60);
  const ids = getSet(favouritesByUser, userId);
  return MOVIES.filter((m) => ids.has(m.id));
}

export async function addFavourite(userId: number, movieId: number): Promise<void> {
  await delay(60);
  getSet(favouritesByUser, userId).add(movieId);
}

export async function removeFavourite(userId: number, movieId: number): Promise<void> {
  await delay(60);
  getSet(favouritesByUser, userId).delete(movieId);
}

export async function getPending(userId: number): Promise<Movie[]> {
  await delay(60);
  const ids = getSet(pendingByUser, userId);
  return MOVIES.filter((m) => ids.has(m.id));
}

export async function addPending(userId: number, movieId: number): Promise<void> {
  await delay(60);
  getSet(pendingByUser, userId).add(movieId);
}

export async function removePending(userId: number, movieId: number): Promise<void> {
  await delay(60);
  getSet(pendingByUser, userId).delete(movieId);
}

// ---------------------------------------------------------------------------
// Listas de películas
// ---------------------------------------------------------------------------

export async function getLists(userId: number): Promise<MovieList[]> {
  await delay(60);
  return MOVIE_LISTS.filter((l) => l.userId === userId);
}

export async function getListById(_userId: number, listId: number): Promise<MovieList> {
  await delay(60);
  const list = MOVIE_LISTS.find((l) => l.id === listId);
  if (!list) throw new Error('Lista no encontrada.');
  return list;
}

export async function addList(userId: number, listId: number): Promise<MovieList> {
  await delay(60);
  void userId;
  return getListById(userId, listId);
}

export async function removeList(_userId: number, _listId: number): Promise<void> {
  await delay(60);
}

// ---------------------------------------------------------------------------
// Usuarios / Social
// ---------------------------------------------------------------------------

export async function getUsers(
  pageable: Pageable = {}
): Promise<PageResponse<UserBasic>> {
  await delay(80);
  const page = pageable.page ?? 0;
  const size = pageable.size ?? 20;
  const totalElements = USERS.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const content = USERS.slice(page * size, page * size + size);
  return { content, totalPages, totalElements, number: page, size };
}

export async function getUserById(userId: number): Promise<UserBasic> {
  await delay(60);
  const user = USERS.find((u) => u.id === userId);
  if (!user) throw new Error('Usuario no encontrado.');
  return user;
}

export async function getFollowing(userId: number): Promise<UserBasic[]> {
  await delay(60);
  return USERS.filter((u) => u.id !== userId).slice(0, 3);
}

export async function getFollowers(userId: number): Promise<UserBasic[]> {
  await delay(60);
  return USERS.filter((u) => u.id !== userId).slice(0, 4);
}

export async function followUser(_userId: number, _targetUserId: number): Promise<void> {
  await delay(60);
}

export async function unfollowUser(_userId: number, _targetUserId: number): Promise<void> {
  await delay(60);
}

// ---------------------------------------------------------------------------
// Listas públicas (página Social: las más gustadas)
// ---------------------------------------------------------------------------

export async function getPublicLists(): Promise<MovieList[]> {
  await delay(120);
  return [...MOVIE_LISTS].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
}
