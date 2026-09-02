import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { db } from "../../db/index.js";
import { urls } from "../../db/schema/urls.schema.js";
import { clickFlushBatches } from "../../db/schema/click-flush-batches.schema.js";
import { clickFlushItems } from "../../db/schema/batch-items.schema.js";

export type ClickFlushItem = {
    shortCode: string;
    clickCount: number;
};

export async function flushClickBatch(
    batchId: string,
    items: ClickFlushItem[],
) {
    if (items.length === 0) {
        return {
            status: "empty" as const,
        };
    }

    return db.transaction(async (tx) => {
        /*
         * Try to create the batch.
         *
         * If this returns nothing, the batch already exists.
         */
        const insertedBatch = await tx
            .insert(clickFlushBatches)
            .values({
                id: batchId,
            })
            .onConflictDoNothing()
            .returning({
                id: clickFlushBatches.id,
            });

        /*
         * Batch already exists.
         * If it was already processed, do nothing.
         */
        if (insertedBatch.length === 0) {
            const existingBatch = await tx
                .select({
                    processedAt: clickFlushBatches.processedAt,
                })
                .from(clickFlushBatches)
                .where(eq(clickFlushBatches.id, batchId))
                .limit(1);

            if (existingBatch[0]?.processedAt) {
                return {
                    status: "already_processed" as const,
                };
            }
        }

        /*
         * Store all URL click increments belonging
         * to this batch.
         */
        await tx
            .insert(clickFlushItems)
            .values(
                items.map((item) => ({
                    id: randomUUID(),
                    batchId,
                    shortCode: item.shortCode,
                    clickCount: item.clickCount,
                })),
            );

        /*
         * Apply all click increments to urls in one
         * PostgreSQL UPDATE statement.
         */
        const values = sql.join(
            items.map(
                (item) =>
                    sql`(${item.shortCode}, ${item.clickCount}::integer)`,
            ),
            sql`, `,
        );

        await tx.execute(sql`
            UPDATE "urls" AS u
            SET "click_count" = u."click_count" + v.click_count
            FROM (
                VALUES ${values}
            ) AS v(short_code, click_count)
            WHERE u."short_code" = v.short_code
        `);

        /*
         * Mark the entire batch as successfully processed.
         */
        await tx
            .update(clickFlushBatches)
            .set({
                processedAt: new Date(),
            })
            .where(eq(clickFlushBatches.id, batchId));

        return {
            status: "processed" as const,
            batchId,
            itemCount: items.length,
        };
    });
}