/**
 * Injectable Drizzle data-access helpers for game records and their relations.
 */
import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

export interface GameFilters {
    categoryIds?: number[];
    publisherId?: number;
}

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Return all games ordered alphabetically by title.
 *
 * @param db - Database connection used to query the games table.
 * @returns All games sorted by title ascending.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    return getGames(db);
}

/**
 * Return games matching the supplied category and publisher filters.
 *
 * @param db - Database connection used to query the games table.
 * @param filters - Optional category and publisher filters.
 * @returns Matching games ordered by title.
 */
export async function getGames(
    db: Database,
    filters: GameFilters = {},
): Promise<Game[]> {
    const query = baseGamesQuery(db);
    const conditions = [];

    if (filters.categoryIds && filters.categoryIds.length > 0) {
        conditions.push(inArray(games.categoryId, filters.categoryIds));
    }

    if (filters.publisherId !== undefined) {
        conditions.push(eq(games.publisherId, filters.publisherId));
    }

    const rows = await query
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(games.title));

    return rows.map(mapGame);
}

/**
 * Return all game ids ordered by their game titles.
 *
 * @param db - Database connection used to query the games table.
 * @returns Game ids sorted by the corresponding title ascending.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * Return one game by id when it exists.
 *
 * @param db - Database connection used to query the games table.
 * @param id - Numeric identifier of the requested game.
 * @returns The matching game, or null when no game has the supplied id.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}
