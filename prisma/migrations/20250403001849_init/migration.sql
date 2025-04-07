-- CreateTable
CREATE TABLE "item_categories" (
    "category_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "items" (
    "item_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories" ("category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "units" (
    "unit_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "unit_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "inventory" (
    "item_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" REAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    CONSTRAINT "inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipes" (
    "recipe_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "recipe_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_id" INTEGER NOT NULL,

    PRIMARY KEY ("recipe_id", "item_id"),
    CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("item_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "step_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipe_id" INTEGER NOT NULL,
    "step_text" TEXT NOT NULL,
    CONSTRAINT "recipe_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
