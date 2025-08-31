document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadItems();
    }
    if (window.location.pathname.includes('add-item.html')) {
        const editItemId = localStorage.getItem('editItemId');
        if (editItemId) {
            loadItemForEdit(editItemId);
        }
    }
});

async function submitItem() {
    const itemName = document.getElementById('item-name').value;
    const itemCategory = document.getElementById('item-category').value;
    const itemQuantity = document.getElementById('item-quantity').value;
    const itemPrice = document.getElementById('item-price').value;
    const editItemId = localStorage.getItem('editItemId');

    if (!itemName || !itemCategory || !itemQuantity || !itemPrice) {
        document.getElementById('item-message').textContent = 'Please fill in all required fields.';
        document.getElementById('item-message').style.color = 'red';
        return;
    }

    const itemData = {
        name: itemName,
        category: itemCategory,
        quantity: parseInt(itemQuantity),
        price: parseFloat(itemPrice),
    };

    try {
        const url = editItemId ? `http://localhost:3000/items/${editItemId}` : 'http://localhost:3000/items';
        const method = editItemId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
        });

        if (response.ok) {
            document.getElementById('item-message').textContent = editItemId ? 'Item updated successfully!' : 'Item added successfully!';
            document.getElementById('item-message').style.color = 'green';
            document.getElementById('item-name').value = '';
            document.getElementById('item-category').value = 'Linens';
            document.getElementById('item-quantity').value = '';
            document.getElementById('item-price').value = '';
            if (editItemId) {
                localStorage.removeItem('editItemId');
            }
        } else {
            document.getElementById('item-message').textContent = `Error ${editItemId ? 'updating' : 'adding'} item.`;
            document.getElementById('item-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('item-message').textContent = 'Error connecting to server.';
        document.getElementById('item-message').style.color = 'red';
    }
}

async function loadItems() {
    try {
        const response = await fetch('http://localhost:3000/items');
        const items = await response.json();
        const tableBody = document.getElementById('inventory-table-body');
        tableBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <button class="action-button edit-button" onclick="editItem(${item.id})">Edit</button>
                    <button class="action-button delete-button" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadItemForEdit(id) {
    try {
        const response = await fetch(`http://localhost:3000/items/${id}`);
        const item = await response.json();
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-price').value = item.price;
        document.querySelector('.item-form h2').textContent = 'Edit Item';
        document.querySelector('.submit-button').textContent = 'Update Item';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editItem(id) {
    localStorage.setItem('editItemId', id);
    window.location.href = 'add-item.html';
}

async function deleteItem(id) {
    try {
        const response = await fetch(`http://localhost:3000/items/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            loadItems();
        } else {
            console.error('Error deleting item');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}