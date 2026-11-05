import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

// Drizzle v1 passes the schema through `defineRelations`. No relations are declared yet.
export const relations = defineRelations(schema);
