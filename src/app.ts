import express, { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

import { createRecipe, searchRecipes, updateRecipe, deleteRecipe, getRecipeById } from './recipe';

// Prismaクライアントの初期化
const prisma = new PrismaClient();


// Expressアプリケーションの初期化
const app = express();
const port = process.env.PORT || 3000;

// JSONボディパーサーを有効化
app.use(express.json());

// Staticファイルの提供
app.use(express.static('./static'));

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello, TypeScript + Express!' });
});

app.post("/recipes", async (req: Request, res: Response) => {
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    await createRecipe(title);
    res.status(201).json({ message: 'Recipe created successfully' });
});

app.get("/recipes", async (req: Request, res: Response) => {
    const recipes = await searchRecipes();
    console.log("aaa");
    console.log(recipes);
    res.json(recipes);
});

app.get("/recipes/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
    } else {
        res.json(recipe);
    }
});

app.put("/recipes/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    const recipe = await getRecipeById(id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
    }
    await updateRecipe(id, title);
    res.status(200).json({ message: 'Recipe updated successfully' });
});

app.delete("/recipes/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
    }
    await deleteRecipe(id);
    res.status(200).json({ message: 'Recipe deleted successfully' });
});

app.post('/itemcategories', async (req: Request, res: Response) => {
    const { name } = req.body;

    try {
        const category = await prisma.itemCategory.create({
            data: {
                name,
            },
        });
        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/itemcategories/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const category = await prisma.itemCategory.findUnique({
            where: { id: Number(id) },
        });

        if (!category) {
            res.status(404).json({ error: 'Category not found' });
        } else {
            res.json(category);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


app.get('/itemcategories', async (req: Request, res: Response) => {
    try {
        const categories = await prisma.itemCategory.findMany();
        res.json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.get('/debug')

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

export default app;