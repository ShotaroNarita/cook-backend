import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    GetCommand
} from '@aws-sdk/lib-dynamodb';

// 定数定義
const REGION = 'ap-northeast-1';
const TABLE_NAME = 'miomon-cook';

// DBクライアント初期化
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// インターフェース定義
import { Base } from './base';

interface Recipe extends Base {
    title: string;
}

/**
 * レシピを作成する
 * @param title レシピのタイトル
 * @returns 作成したレシピのID
 */
async function createRecipe(title: string): Promise<string> {
    const id = crypto.randomUUID();
    const recipe: Recipe = {
        kind: 'recipe',
        id,
        title,
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: recipe
        }));
        return id;
    } catch (error) {
        console.error('Error creating recipe:', error);
        throw error;
    }
}

/**
 * レシピを更新する
 * @param id 更新するレシピのID
 * @param title 新しいレシピのタイトル
 */
async function updateRecipe(id: string, title: string): Promise<void> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: 'recipe',
            id,
        },
        UpdateExpression: 'set title = :title',
        ExpressionAttributeValues: {
            ':title': title,
        },
    };

    try {
        await docClient.send(new UpdateCommand(params));
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
}

/**
 * レシピを削除する
 * @param id 削除するレシピのID
 */
async function deleteRecipe(id: string): Promise<void> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: 'recipe',
            id,
        },
    };

    try {
        await docClient.send(new DeleteCommand(params));
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
}

/**
 * すべてのレシピを検索する
 * @returns レシピの配列
 */
async function searchRecipes(): Promise<Recipe[]> {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'kind = :kind',
        ExpressionAttributeValues: {
            ':kind': 'recipe',
        },
    };

    try {
        const data = await docClient.send(new QueryCommand(params));
        return (data.Items || []) as Recipe[];
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}

/**
 * 特定のレシピの詳細を取得する
 * @param id 取得するレシピのID
 * @returns レシピオブジェクトまたはnull
 */
async function getRecipeById(id: string): Promise<Recipe | null> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: 'recipe',
            id,
        },
    };

    try {
        const data = await docClient.send(new GetCommand(params));
        return data.Item as Recipe || null;
    } catch (error) {
        console.error('Error getting recipe:', error);
        throw error;
    }
}

export {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    getRecipeById
};