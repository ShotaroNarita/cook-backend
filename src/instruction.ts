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

interface Instruction extends Base {
    stepNumber: number;
    description: string;
}

/**
 * 調理手順を作成する
 * @param recipeId 関連するレシピのID
 * @param stepNumber 手順の番号
 * @param description 手順の説明
 * @returns 作成した手順のID
 */
async function createInstruction(recipeId: string, stepNumber: number, description: string): Promise<string> {
    const id = crypto.randomUUID();
    const instruction: Instruction = {
        kind: `instruction@${recipeId}`,
        id,
        stepNumber,
        description
    };

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: instruction
        }));
        return id;
    } catch (error) {
        console.error('Error creating instruction:', error);
        throw error;
    }
}

/**
 * 調理手順を更新する
 * @param recipeId 関連するレシピのID
 * @param instructionId 更新する手順のID
 * @param stepNumber 手順の番号
 * @param description 新しい手順の説明
 */
async function updateInstruction(recipeId: string, instructionId: string, stepNumber: number, description: string): Promise<void> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: `instruction@${recipeId}`,
            id: instructionId,
        },
        UpdateExpression: 'set stepNumber = :stepNumber, description = :description',
        ExpressionAttributeValues: {
            ':stepNumber': stepNumber,
            ':description': description,
        },
    };

    try {
        await docClient.send(new UpdateCommand(params));
    } catch (error) {
        console.error('Error updating instruction:', error);
        throw error;
    }
}

/**
 * 調理手順を削除する
 * @param recipeId 関連するレシピのID
 * @param instructionId 削除する手順のID
 */
async function deleteInstruction(recipeId: string, instructionId: string): Promise<void> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: `instruction@${recipeId}`,
            id: instructionId,
        },
    };

    try {
        await docClient.send(new DeleteCommand(params));
    } catch (error) {
        console.error('Error deleting instruction:', error);
        throw error;
    }
}

/**
 * レシピに関連するすべての調理手順を取得する
 * @param recipeId 関連するレシピのID
 * @returns 調理手順の配列
 */
async function getInstructionsByRecipeId(recipeId: string): Promise<Instruction[]> {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'kind = :kind',
        ExpressionAttributeValues: {
            ':kind': `instruction@${recipeId}`,
        },
    };

    try {
        const data = await docClient.send(new QueryCommand(params));
        return (data.Items || []) as Instruction[];
    } catch (error) {
        console.error('Error fetching instructions:', error);
        throw error;
    }
}

/**
 * 特定のレシピの特定の調理手順を取得する
 * @param recipeId 関連するレシピのID
 * @param instructionId 取得する手順のID
 * @returns 調理手順オブジェクトまたはnull
 */
async function getInstructionById(recipeId: string, instructionId: string): Promise<Instruction | null> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            kind: `instruction@${recipeId}`,
            id: instructionId,
        },
    };

    try {
        const data = await docClient.send(new GetCommand(params));
        return data.Item as Instruction || null;
    } catch (error) {
        console.error('Error getting instruction:', error);
        throw error;
    }
}

export {
    createInstruction,
    updateInstruction,
    deleteInstruction,
    getInstructionsByRecipeId,
    getInstructionById
};