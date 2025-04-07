import express, { Request, Response } from 'express';

import { createRecipe, searchRecipes, updateRecipe, deleteRecipe, getRecipeById } from './recipe';

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

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

export default app;