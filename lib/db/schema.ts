import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { is, Relation, relations, Relations } from "drizzle-orm";
import { time } from "console";
import { Children } from "react";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // basic file and folder info
  name: text("name").notNull(),
  path: text("path").notNull(), //"/home/user/dir/file.txt"
  size: integer("size").notNull(),
  type: text("type").notNull(), //"folder"

  // storage info
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  // Ownership info
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"), //null if root folder

  // file/folder flags: Shared, Favorite, etc.
  isFolder: boolean("is_folder").notNull().default(false),
  isShared: boolean("is_shared").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one, many }) => ({
  // Every file can have only one parent folder
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  // Every folder can have many children
  Children: many(files),
}));

//Type Definitions

export const File = typeof files.$inferSelect; //Exports the type of the file table that we wrote above + get data from the database
export const NewFile = typeof files.$inferInsert; //Fields with default values are not required + insert data into the database
