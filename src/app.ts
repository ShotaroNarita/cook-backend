import express, { Request, Response } from 'express';

import { createRecipe, searchRecipes, updateRecipe, deleteRecipe, getRecipeById } from './recipe';

import { createInstruction, deleteInstruction, getInstructionById, getInstructionsByRecipeId, updateInstruction } from "./instruction"

// Expressアプリケーションの初期化
const app = express();
const port = process.env.PORT || 3000;

// JSONボディパーサーを有効化
app.use(express.json());

// Staticファイルの提供
app.use(express.static('./static'));

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
    res.sendFile(__dirname + '/ui/recipes.html');
});

app.get('/ui/recipes/:recipe_id', (req: Request, res: Response) => { 
    res.sendFile(__dirname + '/ui/instruction.html');
})

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

app.get("/recipes/:recipe_id", async (req: Request, res: Response) => {
    const { recipe_id } = req.params;
    const recipe = await getRecipeById(recipe_id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
    } else {
        res.json(recipe);
    }
});

app.put("/recipes/:recipe_id", async (req: Request, res: Response) => {
    const { recipe_id } = req.params;
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    const recipe = await getRecipeById(recipe_id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
    }
    await updateRecipe(recipe_id, title);
    res.status(200).json({ message: 'Recipe updated successfully' });
});

app.delete("/recipes/:recipe_id", async (req: Request, res: Response) => {
    const { recipe_id } = req.params;
    const recipe = await getRecipeById(recipe_id);
    if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
    }
    await deleteRecipe(recipe_id);
    res.status(200).json({ message: 'Recipe deleted successfully' });
});

app.get("/recipes/:recipe_id/instructions", async (req: Request, res: Response) => {
    const { recipe_id } = req.params;
    const instructions = await getInstructionsByRecipeId(recipe_id);
    res.json(instructions);
});

app.post("/recipes/:recipe_id/instructions", async (req: Request, res: Response) => {
    const { recipe_id } = req.params;
    const { description, stepNumber } = req.body;
    if (!description) {
        res.status(400).json({ error: 'Description is required' });
        return;
    }

    if (!stepNumber) {
        res.status(400).json({ error: 'Step number is required' });
        return;
    }

    await createInstruction(recipe_id, stepNumber, description);
    res.status(201).json({ message: 'Instruction created successfully' });
});

app.put("/recipes/:recipe_id/instructions/:instruction_id", async (req: Request, res: Response) => {
    const { recipe_id, instruction_id } = req.params;
    const { description, stepNumber } = req.body;
    if (!description) {
        res.status(400).json({ error: 'Description is required' });
        return;
    }
    if (!stepNumber) {
        res.status(400).json({ error: 'Step number is required' });
        return;
    }
    const instruction = await getInstructionById(recipe_id, instruction_id);
    if (!instruction) {
        res.status(404).json({ error: 'Instruction not found' });
        return;
    }
    await updateInstruction(recipe_id, instruction_id, stepNumber, description);
    res.status(200).json({ message: 'Instruction updated successfully' });
});

app.delete("/recipes/:recipe_id/instructions/:instruction_id", async (req: Request, res: Response) => {
    const { recipe_id, instruction_id } = req.params;
    const instruction = await getInstructionById(recipe_id, instruction_id);
    if (!instruction) {
        res.status(404).json({ error: 'Instruction not found' });
        return;
    }
    await deleteInstruction(recipe_id, instruction_id);
    res.status(200).json({ message: 'Instruction deleted successfully' });
});

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

export default app;