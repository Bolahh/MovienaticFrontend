/** Tipos compartidos por la capa de datos y las páginas. */

export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  description?: string;
  releaseYear?: number;
  posterURL?: string | null;
  averageRating?: number | null;
  numberOfRatings?: number | null;
  genres?: Genre[];
};

/** Lista de películas tal como la devuelve la API pública. */
export type MovieList = {
  id: number;
  name: string;
  description?: string | null;
  userId: number;
  username?: string | null;
  photoURL?: string | null;
  user?: {
    id: number;
    username: string;
    photoURL?: string | null;
  };
  movies?: Movie[];
  movieCount?: number;
  previewPosters?: string[];
  likeCount?: number;
};

export type UserBasic = {
  id: number;
  username: string;
  photoURL?: string | null;
};
