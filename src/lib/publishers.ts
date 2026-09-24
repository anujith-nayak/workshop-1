/**
 * Data access helpers for publisher records used by build-time Astro pages.
 * These queries read from the local SQLite database through Drizzle and keep
 * the database layer injectable for tests.
 */
import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { publishers } from '../../db/schema';
import type { Publisher } from '../types/game';

type PublisherSelectionRow = {
    id: number;
    name: string;
};

function mapPublisher(row: PublisherSelectionRow): Publisher {
    return {
        id: row.id,
        name: row.name,
    };
}

/**
 * Return all publishers ordered alphabetically by name.
 *
 * @param db - Database connection used to query the publishers table.
 * @returns A list of publishers sorted by name ascending.
 */
export async function getAllPublishers(db: Database): Promise<Publisher[]> {
    const rows = await db
        .select({ id: publishers.id, name: publishers.name })
        .from(publishers)
        .orderBy(asc(publishers.name));

    return rows.map(mapPublisher);
}
