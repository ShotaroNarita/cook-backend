document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const recipeForm = document.getElementById('recipe-form');
    const recipeTitleInput = document.getElementById('recipe-title');
    const recipeList = document.getElementById('recipe-list');
    const loadingMessage = document.getElementById('loading-message');
    const noRecipesMessage = document.getElementById('no-recipes');
    const recipeDetail = document.getElementById('recipe-detail');
    const detailTitle = document.getElementById('detail-title');
    const editRecipeBtn = document.getElementById('edit-recipe');
    const deleteRecipeBtn = document.getElementById('delete-recipe');
    const viewInstructionsBtn = document.getElementById('view-instructions');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    // 状態管理変数
    let recipes = [];
    let currentRecipe = null;
    let isEditing = false;

    // 初期データ読み込み
    fetchRecipes();

    // イベントリスナー
    recipeForm.addEventListener('submit', handleRecipeFormSubmit);
    editRecipeBtn.addEventListener('click', handleEditRecipe);
    deleteRecipeBtn.addEventListener('click', confirmDeleteRecipe);
    viewInstructionsBtn.addEventListener('click', navigateToInstructions);
    cancelEditBtn.addEventListener('click', cancelEdit);
    confirmYesBtn.addEventListener('click', confirmDelete);
    confirmNoBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    // レシピ一覧を取得する関数
    async function fetchRecipes() {
        try {
            const response = await fetch('/recipes');
            
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            
            recipes = await response.json();
            
            loadingMessage.style.display = 'none';
            
            if (recipes.length === 0) {
                noRecipesMessage.style.display = 'block';
                recipeList.innerHTML = '';
            } else {
                noRecipesMessage.style.display = 'none';
                renderRecipeList();
            }
        } catch (error) {
            console.error('レシピの取得に失敗しました:', error);
            loadingMessage.textContent = 'データの読み込みに失敗しました。再読み込みしてください。';
        }
    }

    // レシピリストをレンダリングする関数
    function renderRecipeList() {
        recipeList.innerHTML = '';
        
        recipes.forEach(recipe => {
            const li = document.createElement('li');
            li.className = 'recipe-item';
            li.dataset.id = recipe.id;
            li.textContent = recipe.title;
            
            if (currentRecipe && currentRecipe.id === recipe.id) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => selectRecipe(recipe));
            
            recipeList.appendChild(li);
        });
    }

    // レシピを選択する関数
    function selectRecipe(recipe) {
        currentRecipe = recipe;
        
        // アクティブ状態のスタイルを更新
        const recipeItems = document.querySelectorAll('.recipe-item');
        recipeItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === recipe.id) {
                item.classList.add('active');
            }
        });
        
        // 詳細表示を更新
        detailTitle.textContent = recipe.title;
        recipeDetail.style.display = 'block';
    }

    // レシピフォームの送信ハンドラ
    async function handleRecipeFormSubmit(e) {
        e.preventDefault();
        
        const title = recipeTitleInput.value.trim();
        
        if (!title) {
            alert('レシピ名を入力してください。');
            return;
        }
        
        try {
            if (isEditing && currentRecipe) {
                // 既存レシピの更新
                await updateRecipe(currentRecipe.id, title);
            } else {
                // 新しいレシピの作成
                await createRecipe(title);
            }
            
            // フォームをリセット
            recipeTitleInput.value = '';
            cancelEdit();
            
            // レシピリストを再取得
            fetchRecipes();
        } catch (error) {
            console.error('レシピの保存に失敗しました:', error);
            alert('レシピの保存に失敗しました。もう一度お試しください。');
        }
    }

    // 新しいレシピを作成する関数
    async function createRecipe(title) {
        const response = await fetch('/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        
        return response.json();
    }

    // レシピを更新する関数
    async function updateRecipe(recipeId, title) {
        const response = await fetch(`/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        
        // 現在の選択レシピを更新
        if (currentRecipe && currentRecipe.id === recipeId) {
            currentRecipe.title = title;
            detailTitle.textContent = title;
        }
        
        return response.json();
    }

    // レシピを削除する関数
    async function deleteRecipe(recipeId) {
        const response = await fetch(`/recipes/${recipeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }
        
        // 表示更新
        if (currentRecipe && currentRecipe.id === recipeId) {
            currentRecipe = null;
            recipeDetail.style.display = 'none';
        }
        
        return response.json();
    }

    // 編集モードを開始する関数
    function handleEditRecipe() {
        if (!currentRecipe) return;
        
        isEditing = true;
        recipeTitleInput.value = currentRecipe.title;
        cancelEditBtn.style.display = 'inline-block';
        recipeForm.querySelector('button[type="submit"]').textContent = '更新';
        recipeTitleInput.focus();
    }

    // 編集をキャンセルする関数
    function cancelEdit() {
        isEditing = false;
        recipeTitleInput.value = '';
        cancelEditBtn.style.display = 'none';
        recipeForm.querySelector('button[type="submit"]').textContent = '保存';
    }

    // 削除確認モーダルを表示する関数
    function confirmDeleteRecipe() {
        if (!currentRecipe) return;
        
        confirmationMessage.textContent = `「${currentRecipe.title}」を削除してもよろしいですか？`;
        confirmationModal.style.display = 'flex';
    }

    // 削除を実行する関数
    async function confirmDelete() {
        if (!currentRecipe) return;
        
        try {
            await deleteRecipe(currentRecipe.id);
            confirmationModal.style.display = 'none';
            fetchRecipes();
        } catch (error) {
            console.error('レシピの削除に失敗しました:', error);
            alert('レシピの削除に失敗しました。もう一度お試しください。');
            confirmationModal.style.display = 'none';
        }
    }

    // 手順ページへ移動する関数
    function navigateToInstructions() {
        if (!currentRecipe) return;
        window.location.href = `/ui/recipes/${currentRecipe.id}`;
    }
});