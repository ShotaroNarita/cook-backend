document.addEventListener('DOMContentLoaded', () => {
    // URLからレシピIDを取得
    const pathParts = window.location.pathname.split('/');
    const recipeId = pathParts[pathParts.length - 1];

    // DOM要素
    const recipeTitle = document.getElementById('recipe-title');
    const backToRecipesBtn = document.getElementById('back-to-recipes');
    const instructionForm = document.getElementById('instruction-form');
    const stepNumberInput = document.getElementById('step-number');
    const instructionDescriptionInput = document.getElementById('instruction-description');
    const instructionList = document.getElementById('instruction-list');
    const loadingMessage = document.getElementById('loading-message');
    const noInstructionsMessage = document.getElementById('no-instructions');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    // 状態管理変数
    let recipe = null;
    let instructions = [];
    let currentInstruction = null;
    let isEditing = false;

    // 初期データ読み込み
    fetchRecipe();
    fetchInstructions();

    // イベントリスナー
    backToRecipesBtn.addEventListener('click', () => {
        window.location.href = '/';
    });

    instructionForm.addEventListener('submit', handleInstructionFormSubmit);

    cancelEditBtn.addEventListener('click', cancelEdit);

    confirmYesBtn.addEventListener('click', confirmDelete);

    confirmNoBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    // レシピ情報を取得する関数
    async function fetchRecipe() {
        try {
            const response = await fetch(`/recipes/${recipeId}`);

            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }

            recipe = await response.json();
            recipeTitle.textContent = recipe.title;
            document.title = `${recipe.title} - 手順管理`;
        } catch (error) {
            console.error('レシピの取得に失敗しました:', error);
            recipeTitle.textContent = 'レシピの読み込みに失敗しました。';
        }
    }

    // 手順一覧を取得する関数
    async function fetchInstructions() {
        try {
            const response = await fetch(`/recipes/${recipeId}/instructions`);

            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }

            instructions = await response.json();

            loadingMessage.style.display = 'none';

            if (instructions.length === 0) {
                noInstructionsMessage.style.display = 'block';
                instructionList.innerHTML = '';
            } else {
                noInstructionsMessage.style.display = 'none';
                renderInstructionList();
            }
        } catch (error) {
            console.error('手順の取得に失敗しました:', error);
            loadingMessage.textContent = 'データの読み込みに失敗しました。再読み込みしてください。';
        }
    }

    // 手順リストをレンダリングする関数
    function renderInstructionList() {
        instructionList.innerHTML = '';

        // 手順番号でソート
        const sortedInstructions = [...instructions].sort((a, b) => a.stepNumber - b.stepNumber);

        sortedInstructions.forEach(instruction => {
            const li = document.createElement('li');
            li.className = 'instruction-item';
            li.dataset.id = instruction.id;

            li.innerHTML = `
                <div class="step-number">${instruction.stepNumber}</div>
                <div class="instruction-content">
                    <div class="instruction-description">${instruction.description}</div>
                    <div class="instruction-actions">
                        <button class="btn edit-instruction">編集</button>
                        <button class="btn btn-danger delete-instruction">削除</button>
                    </div>
                </div>
            `;

            // 編集ボタンのイベントリスナー
            li.querySelector('.edit-instruction').addEventListener('click', () => {
                startEdit(instruction);
            });

            // 削除ボタンのイベントリスナー
            li.querySelector('.delete-instruction').addEventListener('click', () => {
                confirmDeleteInstruction(instruction);
            });

            instructionList.appendChild(li);
        });

        // 次の手順番号を提案
        if (instructions.length > 0) {
            const maxStepNumber = Math.max(...instructions.map(i => i.stepNumber));
            stepNumberInput.value = maxStepNumber + 1;
        } else {
            stepNumberInput.value = 1;
        }
    }

    // 手順フォームの送信ハンドラ
    async function handleInstructionFormSubmit(e) {
        e.preventDefault();

        const stepNumber = parseInt(stepNumberInput.value);
        const description = instructionDescriptionInput.value.trim();

        if (!stepNumber || !description) {
            alert('すべての項目を入力してください。');
            return;
        }

        try {
            if (isEditing && currentInstruction) {
                // 既存手順の更新
                await updateInstruction(currentInstruction.id, stepNumber, description);
            } else {
                // 新しい手順の作成
                await createInstruction(stepNumber, description);
            }

            // フォームをリセット
            instructionDescriptionInput.value = '';
            // stepNumberInputは自動的に次の番号が提案されるので、リセットしない

            cancelEdit();

            // 手順リストを再取得
            fetchInstructions();
        } catch (error) {
            console.error('手順の保存に失敗しました:', error);
            alert('手順の保存に失敗しました。もう一度お試しください。');
        }
    }

    // 新しい手順を作成する関数
    async function createInstruction(stepNumber, description) {
        const response = await fetch(`/recipes/${recipeId}/instructions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stepNumber, description })
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    }

    // 手順を更新する関数
    async function updateInstruction(instructionId, stepNumber, description) {
        const response = await fetch(`/recipes/${recipeId}/instructions/${instructionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stepNumber, description })
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    }

    // 手順を削除する関数
    async function deleteInstruction(instructionId) {
        const response = await fetch(`/recipes/${recipeId}/instructions/${instructionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        return response.json();
    }

    // 編集モードを開始する関数
    function startEdit(instruction) {
        currentInstruction = instruction;
        isEditing = true;

        stepNumberInput.value = instruction.stepNumber;
        instructionDescriptionInput.value = instruction.description;

        cancelEditBtn.style.display = 'inline-block';
        instructionForm.querySelector('button[type="submit"]').textContent = '更新';

        // スクロールしてフォームを表示
        document.querySelector('.instruction-form').scrollIntoView({ behavior: 'smooth' });
        instructionDescriptionInput.focus();
    }

    // 編集をキャンセルする関数
    function cancelEdit() {
        currentInstruction = null;
        isEditing = false;

        instructionDescriptionInput.value = '';

        // 次の手順番号を提案
        if (instructions.length > 0) {
            const maxStepNumber = Math.max(...instructions.map(i => i.stepNumber));
            stepNumberInput.value = maxStepNumber + 1;
        } else {
            stepNumberInput.value = 1;
        }

        cancelEditBtn.style.display = 'none';
        instructionForm.querySelector('button[type="submit"]').textContent = '保存';
    }

    // 削除確認モーダルを表示する関数
    function confirmDeleteInstruction(instruction) {
        currentInstruction = instruction;

        confirmationMessage.textContent = `手順 ${instruction.stepNumber} を削除してもよろしいですか？`;
        confirmationModal.style.display = 'flex';
    }

    // 削除を実行する関数
    async function confirmDelete() {
        if (!currentInstruction) return;

        try {
            await deleteInstruction(currentInstruction.id);
            confirmationModal.style.display = 'none';
            fetchInstructions();
        } catch (error) {
            console.error('手順の削除に失敗しました:', error);
            alert('手順の削除に失敗しました。もう一度お試しください。');
            confirmationModal.style.display = 'none';
        }
    }
});