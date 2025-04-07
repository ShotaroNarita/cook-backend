function createRecipeHandler(){
    const title = document.getElementById('recipe-title').value;
    fetch('./recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



document.getElementById('create-recipe').addEventListener('click', createRecipeHandler);

const init = () => {

}