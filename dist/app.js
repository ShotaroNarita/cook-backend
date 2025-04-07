"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
// Prismaクライアントの初期化
const prisma = new client_1.PrismaClient();
// Expressアプリケーションの初期化
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// JSONボディパーサーを有効化
app.use(express_1.default.json());
// Staticファイルの提供
app.use(express_1.default.static('./static'));
// ルートエンドポイント
app.get('/', (req, res) => {
    res.json({ message: 'Hello, TypeScript + Express!' });
});
app.post('/itemcategories', async (req, res) => {
    const { name } = req.body;
    try {
        const category = await prisma.itemCategory.create({
            data: {
                name,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/itemcategories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.itemCategory.findUnique({
            where: { id: Number(id) },
        });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
        }
        else {
            res.json(category);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/itemcategories', async (req, res) => {
    try {
        const categories = await prisma.itemCategory.findMany();
        res.json({ categories });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// app.get('/debug')
// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
exports.default = app;
