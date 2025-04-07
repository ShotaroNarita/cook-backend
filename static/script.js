function addCategory(){
    const categoryName = document.getElementById('category-name').value;
    fetch('./itemcategories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('create-category').addEventListener('click', addCategory);