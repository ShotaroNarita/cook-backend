import express, { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

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