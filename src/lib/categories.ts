/**
 * Data access helpers for category records used by build-time Astro pages.
 */
import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { categories } from '../../db/schema';
import type { Category } from '../types/game';

/**
 * Return all categories ordered alphabetically by name.
 *
 * @param db - Database connection used to query the categories table.
 * @returns A list of categories sorted by name ascending.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    return db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));
}
