/**
 * Datos mock de Movienatic.
 * Permiten usar la aplicación completa sin backend.
 */

export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  posterURL?: string | null;
  averageRating?: number | null;
  numberOfRatings?: number | null;
  genres?: Genre[];
};

export type CastingItem = {
  actor: string;
  characterName: string;
  position: number;
};

export type MovieDetail = Movie & {
  casting?: CastingItem[];
};

export type Review = {
  id: number;
  content: string;
  rating: number;
  likes: number;
  dislikes: number;
  timestamp: string;
  user?: {
    id: number;
    username: string;
    photoURL?: string | null;
  };
};

export type MovieList = {
  id: number;
  name: string;
  description?: string | null;
  userId: number;
  user?: {
    id: number;
    username: string;
    photoURL?: string | null;
  };
  movies?: Movie[];
  likeCount?: number;
};

export type UserBasic = {
  id: number;
  username: string;
  photoURL?: string | null;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  photoURL?: string | null;
};

// ---------------------------------------------------------------------------
// Géneros (19 géneros de la BBDD)
// ---------------------------------------------------------------------------

export const GENRES: Genre[] = [
  { id: 1, name: 'Acción' },
  { id: 2, name: 'Aventura' },
  { id: 3, name: 'Animación' },
  { id: 4, name: 'Comedia' },
  { id: 5, name: 'Crimen' },
  { id: 6, name: 'Documental' },
  { id: 7, name: 'Drama' },
  { id: 8, name: 'Familia' },
  { id: 9, name: 'Fantasía' },
  { id: 10, name: 'Historia' },
  { id: 11, name: 'Terror' },
  { id: 12, name: 'Música' },
  { id: 13, name: 'Misterio' },
  { id: 14, name: 'Romance' },
  { id: 15, name: 'Ciencia ficción' },
  { id: 16, name: 'Película de TV' },
  { id: 17, name: 'Suspense' },
  { id: 18, name: 'Bélica' },
  { id: 19, name: 'Western' },
];

const poster = (id: number) =>
  `https://picsum.photos/seed/movienatic-${id}/400/600`;

const genre = (id: number): Genre => GENRES.find((g) => g.id === id)!;

// ---------------------------------------------------------------------------
// Películas
// ---------------------------------------------------------------------------

export const MOVIES: Movie[] = [
  // --- Estrenos 2026 (hero) ---
  {
    id: 1,
    title: 'Eclipse Solar',
    description:
      'En un futuro donde el sol está a punto de apagarse, un grupo de astronautas debe embarcarse en una misión desesperada para reavivarlo y salvar a la humanidad de la extinción total.',
    releaseYear: 2026,
    averageRating: 4.8,
    numberOfRatings: 1250,
    posterURL: poster(1),
    genres: [genre(15), genre(2)],
  },
  {
    id: 2,
    title: 'Río Oscuro',
    description:
      'Dos extraños se encuentran en un pequeño pueblo junto a un río misterioso que guarda secretos del pasado que ninguno de ellos está listo para enfrentar.',
    releaseYear: 2026,
    averageRating: 4.5,
    numberOfRatings: 890,
    posterURL: poster(2),
    genres: [genre(7), genre(13)],
  },
  {
    id: 3,
    title: 'Último Viaje',
    description:
      'Una expedición científica al Ártico descubre algo que nunca debió ser encontrado, desencadenando una carrera por la supervivencia en el hielo eterno.',
    releaseYear: 2026,
    averageRating: 4.7,
    numberOfRatings: 1100,
    posterURL: poster(3),
    genres: [genre(2), genre(17)],
  },
  {
    id: 4,
    title: 'Código Quantum',
    description:
      'Un brillante programador descubre un algoritmo que puede predecir el futuro, pero los gobiernos quieren controlarlo a cualquier costo.',
    releaseYear: 2026,
    averageRating: 4.3,
    numberOfRatings: 750,
    posterURL: poster(4),
    genres: [genre(15), genre(17)],
  },
  {
    id: 5,
    title: 'Vértigo Infinito',
    description:
      'Una piloto comercial despierta en un vuelo sin destino conocido, sin memoria de cómo llegó allí y con pasajeros que dicen no existir.',
    releaseYear: 2026,
    averageRating: 4.6,
    numberOfRatings: 980,
    posterURL: poster(5),
    genres: [genre(17), genre(13)],
  },
  {
    id: 6,
    title: 'Raíces del Tiempo',
    description:
      'Tres generaciones de una misma familia se reúnen en su hogar ancestral, revelando secretos enterrados durante décadas.',
    releaseYear: 2026,
    averageRating: 4.4,
    numberOfRatings: 620,
    posterURL: poster(6),
    genres: [genre(7)],
  },

  // --- Mejor valoradas ---
  {
    id: 101,
    title: 'El Origen del Sonido',
    description:
      'Una sinfonía que despierta recuerdos olvidados en una ciudad que ha dejado de escuchar.',
    releaseYear: 2025,
    averageRating: 4.9,
    numberOfRatings: 2100,
    posterURL: poster(101),
    genres: [genre(7), genre(12)],
  },
  {
    id: 102,
    title: 'Mundos Paralelos',
    description:
      'Dos universos idénticos pero opuestos conectan por un instante, cambiando el destino de ambas realidades.',
    releaseYear: 2024,
    averageRating: 4.9,
    numberOfRatings: 1950,
    posterURL: poster(102),
    genres: [genre(15)],
  },
  {
    id: 103,
    title: 'El Último Susurro',
    description:
      'Una bibliotecaria descubre cartas anónimas que predicen muertes antes de que ocurran.',
    releaseYear: 2023,
    averageRating: 4.8,
    numberOfRatings: 1600,
    posterURL: poster(103),
    genres: [genre(13), genre(17)],
  },
  {
    id: 104,
    title: 'Corazón de Acero',
    description:
      'Un exagente secreto debe regresar de su retiro para salvar a su familia de una organización criminal.',
    releaseYear: 2022,
    averageRating: 4.8,
    numberOfRatings: 1800,
    posterURL: poster(104),
    genres: [genre(1), genre(17)],
  },
  {
    id: 105,
    title: 'La Ruta del Norte',
    description:
      'Un viaje épico a través de paisajes inexplorados en busca de una ciudad perdida.',
    releaseYear: 2021,
    averageRating: 4.7,
    numberOfRatings: 1450,
    posterURL: poster(105),
    genres: [genre(2), genre(10)],
  },

  // --- Acción ---
  {
    id: 201,
    title: 'Extrema Velocidad',
    description:
      'Carreras ilegales en las calles de Neo-Tokio donde el perdedor pierde más que la apuesta.',
    releaseYear: 2025,
    averageRating: 4.2,
    numberOfRatings: 980,
    posterURL: poster(201),
    genres: [genre(1)],
  },
  {
    id: 202,
    title: 'Impacto Final',
    description:
      'Un equipo de rescate tiene 90 minutos para evitar un desastre nuclear.',
    releaseYear: 2024,
    averageRating: 4.1,
    numberOfRatings: 850,
    posterURL: poster(202),
    genres: [genre(1), genre(17)],
  },
  {
    id: 203,
    title: 'Operación Sombra',
    description:
      'Espías rivales deben cooperar para evitar una guerra mundial.',
    releaseYear: 2026,
    averageRating: 4.4,
    numberOfRatings: 1100,
    posterURL: poster(203),
    genres: [genre(1), genre(17)],
  },
  {
    id: 204,
    title: 'Caza Implacable',
    description:
      'Un exsoldado es perseguido por su propio gobierno tras descubrir un secreto.',
    releaseYear: 2023,
    averageRating: 4.3,
    numberOfRatings: 920,
    posterURL: poster(204),
    genres: [genre(1)],
  },

  // --- Terror ---
  {
    id: 301,
    title: 'La Sombra en el Pasillo',
    description:
      'Algo acecha en los pasillos de un antiguo internado abandonado.',
    releaseYear: 2025,
    averageRating: 4.5,
    numberOfRatings: 1050,
    posterURL: poster(301),
    genres: [genre(11), genre(13)],
  },
  {
    id: 302,
    title: 'Susurros en la Oscuridad',
    description:
      'Una familia se muda a una casa donde las paredes susurran secretos del pasado.',
    releaseYear: 2024,
    averageRating: 4.3,
    numberOfRatings: 880,
    posterURL: poster(302),
    genres: [genre(11)],
  },
  {
    id: 303,
    title: 'El Refugio Maldito',
    description:
      'Un grupo de amigos busca refugio en una cabaña durante una tormenta, pero algo ya está dentro.',
    releaseYear: 2026,
    averageRating: 4.6,
    numberOfRatings: 1150,
    posterURL: poster(303),
    genres: [genre(11), genre(17)],
  },
  {
    id: 304,
    title: 'Noche de Pesadilla',
    description:
      'Una pesadilla recurrente se vuelve realidad cuando los durmientes no pueden despertar.',
    releaseYear: 2023,
    averageRating: 4.4,
    numberOfRatings: 970,
    posterURL: poster(304),
    genres: [genre(11), genre(9)],
  },

  // --- Comedia ---
  {
    id: 401,
    title: 'Una Boda Loca',
    description:
      'Todo sale mal el día de la boda más esperada del año.',
    releaseYear: 2025,
    averageRating: 4.1,
    numberOfRatings: 750,
    posterURL: poster(401),
    genres: [genre(4), genre(14)],
  },
  {
    id: 402,
    title: 'El Trabajo Perfecto',
    description:
      'Dos ladrones amateur intentan robar la joyería más segura de la ciudad.',
    releaseYear: 2024,
    averageRating: 4.0,
    numberOfRatings: 680,
    posterURL: poster(402),
    genres: [genre(4), genre(5)],
  },
  {
    id: 403,
    title: 'Dos Locos en Apuros',
    description:
      'Dos mejores amigos se meten en problemas que superan su capacidad de arreglar.',
    releaseYear: 2026,
    averageRating: 4.2,
    numberOfRatings: 820,
    posterURL: poster(403),
    genres: [genre(4)],
  },
  {
    id: 404,
    title: 'Cita a Ciegas',
    description:
      'Una aplicación de citas empareja a dos personas que son completamente opuestas.',
    releaseYear: 2023,
    averageRating: 3.9,
    numberOfRatings: 610,
    posterURL: poster(404),
    genres: [genre(4), genre(14)],
  },
];

// ---------------------------------------------------------------------------
// Casting y reseñas
// ---------------------------------------------------------------------------

export const CASTING: CastingItem[] = [
  { actor: 'Ana Torres', characterName: 'Elena', position: 1 },
  { actor: 'Marcos Vidal', characterName: 'Daniel', position: 2 },
  { actor: 'Lucía Ferrer', characterName: 'Comandante Ríos', position: 3 },
  { actor: 'Javier Núñez', characterName: 'Dr. Salas', position: 4 },
];

export const REVIEWS: Review[] = [
  {
    id: 1,
    content: 'Una película espectacular, de principio a fin. La fotografía es brutal.',
    rating: 5,
    likes: 42,
    dislikes: 2,
    timestamp: '2026-10-02T18:30:00Z',
    user: { id: 1, username: 'cinemalover', photoURL: null },
  },
  {
    id: 2,
    content: 'Muy entretenida, aunque el final me dejó con ganas de más.',
    rating: 4,
    likes: 21,
    dislikes: 3,
    timestamp: '2026-09-21T12:10:00Z',
    user: { id: 2, username: 'horrorfan', photoURL: null },
  },
  {
    id: 3,
    content: 'La banda sonora merece un premio. Recomendadísima.',
    rating: 5,
    likes: 17,
    dislikes: 1,
    timestamp: '2026-08-14T20:05:00Z',
    user: { id: 3, username: 'scifiking', photoURL: null },
  },
];

// ---------------------------------------------------------------------------
// Listas de películas (página Social)
// ---------------------------------------------------------------------------

export const MOVIE_LISTS: MovieList[] = [
  {
    id: 1,
    name: 'Clásicos de los 80s',
    description: 'Las mejores películas de los años 80',
    userId: 1,
    user: { id: 1, username: 'cinemalover', photoURL: null },
    likeCount: 142,
    movies: MOVIES.filter((m) => [104, 105, 202].includes(m.id)),
  },
  {
    id: 2,
    name: 'Maratón de Terror',
    description: 'Películas para no dormir',
    userId: 2,
    user: { id: 2, username: 'horrorfan', photoURL: null },
    likeCount: 98,
    movies: MOVIES.filter((m) => [301, 302, 303, 304].includes(m.id)),
  },
  {
    id: 3,
    name: 'Sagas de Ciencia Ficción',
    description: 'Universos lejanos y futuros imposibles',
    userId: 3,
    user: { id: 3, username: 'scifiking', photoURL: null },
    likeCount: 87,
    movies: MOVIES.filter((m) => [1, 4, 102].includes(m.id)),
  },
  {
    id: 4,
    name: 'Noche de risas',
    description: 'Comedias para levantar el ánimo',
    userId: 4,
    user: { id: 4, username: 'moviefan', photoURL: null },
    likeCount: 64,
    movies: MOVIES.filter((m) => [401, 402, 403, 404].includes(m.id)),
  },
];

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

export const USERS: UserBasic[] = [
  { id: 1, username: 'cinemalover', photoURL: null },
  { id: 2, username: 'horrorfan', photoURL: null },
  { id: 3, username: 'scifiking', photoURL: null },
  { id: 4, username: 'moviefan', photoURL: null },
  { id: 5, username: 'seriesadict', photoURL: null },
];
