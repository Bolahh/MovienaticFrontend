/**
 * Capa de datos de Movienatic.
 *
 * Funciona íntegramente con datos mock (src/data/mockData.ts), por lo que
 * NO necesita que el backend esté encendido. Las funciones son asíncronas
 * para poder sustituirlas por llamadas HTTP reales más adelante sin tocar
 * las páginas.
 */

import {
  GENRES,
  MOVIES,
  MOVIE_LISTS,
  USERS,
  CASTING,
  REVIEWS,
  type Genre,
  type Movie,
  type MovieDetail,
  type CastingItem,
  type Review,
  type MovieList,
  type UserBasic,
  type AuthUser,
} from './data/mockData';

export type {
  Genre,
  Movie,
  MovieDetail,
  CastingItem,
  Review,
  MovieList,
  UserBasic,
  AuthUser,
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

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: AuthUser;
};

export type MovieFilter = {
  title?: string;
  genreIds?: number[];
  releaseYear?: number;
  minRating?: number;
};

export type MoviePageResponse = {
  content: Movie[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type Pageable = {
  page?: number;
  size?: number;
  sort?: string[];
};

// ---------------------------------------------------------------------------
// Autenticación (mock, persistida en localStorage)
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'movienatic_token';
const USER_KEY = 'movienatic_user';

export function setAuthToken(newToken: string | null) {
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(data: LoginDto): Promise<AuthResponse> {
  await delay();
  const email = data.email.trim();
  if (!email || !email.includes('@')) {
    throw new Error('Introduce un correo electrónico válido.');
  }
  if (!data.password) {
    throw new Error('Introduce tu contraseña.');
  }

  const user: AuthUser = {
    id: 1,
    username: email.split('@')[0] || 'usuario',
    email,
    photoURL: null,
  };

  const token = `mock-token-${Date.now()}`;
  setAuthToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token, user };
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  await delay();
  const username = data.username.trim();
  const email = data.email.trim();

  if (username.length < 3) {
    throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
  }
  if (!email || !email.includes('@')) {
    throw new Error('Introduce un correo electrónico válido.');
  }
  if (data.password.length < 4) {
    throw new Error('La contraseña debe tener al menos 4 caracteres.');
  }

  const user: AuthUser = { id: Date.now(), username, email, photoURL: null };
  const token = `mock-token-${Date.now()}`;
  setAuthToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token, user };
}

// ---------------------------------------------------------------------------
// Películas
// ---------------------------------------------------------------------------

export async function getMovies(
  pageable: Pageable = {},
  filter: MovieFilter = {}
): Promise<MoviePageResponse> {
  await delay(120);

  const page = pageable.page ?? 0;
  const size = pageable.size ?? 12;

  let result = [...MOVIES];

  if (filter.title) {
    const q = filter.title.trim().toLowerCase();
    result = result.filter((m) => m.title.toLowerCase().includes(q));
  }

  if (filter.genreIds && filter.genreIds.length > 0) {
    result = result.filter((m) =>
      (m.genres || []).some((g) => filter.genreIds!.includes(g.id))
    );
  }

  if (filter.releaseYear != null) {
    result = result.filter((m) => m.releaseYear === filter.releaseYear);
  }

  if (filter.minRating != null) {
    result = result.filter((m) => (m.averageRating ?? 0) >= filter.minRating!);
  }

  const sort = pageable.sort?.[0];
  if (sort === 'title,asc') {
    result.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  } else if (sort === 'title,desc') {
    result.sort((a, b) => b.title.localeCompare(a.title, 'es'));
  } else if (sort === 'averageRating,desc') {
    result.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
  } else if (sort === 'releaseYear,desc') {
    result.sort((a, b) => b.releaseYear - a.releaseYear);
  }

  const totalElements = result.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const content = result.slice(start, start + size);

  return { content, totalPages, totalElements, number: page, size };
}

export async function getMovieById(movieId: number): Promise<Movie> {
  await delay(80);
  const movie = MOVIES.find((m) => m.id === movieId);
  if (!movie) throw new Error('Película no encontrada.');
  return movie;
}

export async function getMovieDetail(movieId: number): Promise<MovieDetail> {
  const movie = await getMovieById(movieId);
  return { ...movie, casting: CASTING };
}

export async function getMovieCasting(movieId: number): Promise<CastingItem[]> {
  await delay(80);
  void movieId;
  return CASTING;
}

export async function getMovieReviews(movieId: number): Promise<Review[]> {
  await delay(80);
  void movieId;
  return REVIEWS;
}

export async function getGenres(): Promise<Genre[]> {
  await delay(40);
  return GENRES;
}

// ---------------------------------------------------------------------------
// Reseñas
// ---------------------------------------------------------------------------

export async function addReview(
  userId: number,
  data: { movieId: number; content: string; rating: number }
): Promise<Review> {
  await delay();
  return {
    id: Date.now(),
    content: data.content,
    rating: data.rating,
    likes: 0,
    dislikes: 0,
    timestamp: new Date().toISOString(),
    user: { id: userId, username: getCurrentUser()?.username || 'usuario', photoURL: null },
  };
}

export async function likeReview(_userId: number, reviewId: number): Promise<Review> {
  await delay(60);
  const review = REVIEWS.find((r) => r.id === reviewId) || REVIEWS[0];
  return { ...review, id: reviewId, likes: review.likes + 1 };
}

export async function dislikeReview(_userId: number, reviewId: number): Promise<Review> {
  await delay(60);
  const review = REVIEWS.find((r) => r.id === reviewId) || REVIEWS[0];
  return { ...review, id: reviewId, dislikes: review.dislikes + 1 };
}

export async function deleteReview(_userId: number, _reviewId: number): Promise<void> {
  await delay(60);
}

export async function updateReview(
  _userId: number,
  reviewId: number,
  data: { content?: string; rating?: number }
): Promise<Review> {
  await delay(60);
  const review = REVIEWS.find((r) => r.id === reviewId) || REVIEWS[0];
  return { ...review, ...data };
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
): Promise<MoviePageResponse & { content: UserBasic[] }> {
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
