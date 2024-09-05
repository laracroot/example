Untuk menambahkan tombol "Edit" di setiap baris tabel dan membuka modal yang memungkinkan Anda mengedit data di baris tersebut, ikuti langkah-langkah berikut:

### 1. **Update HTML untuk Menambahkan Kolom Edit**

Tambahkan kolom baru untuk tombol "Edit" di tabel HTML Anda.

#### **Updated HTML (index.html):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categories with Pagination, Search, Add, and Edit Feature</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Categories</h1>
        
        <!-- Tombol Tambah Category -->
        <button id="add-category-btn">Tambah Category</button>

        <!-- Input pencarian -->
        <input type="text" id="search-input" placeholder="Search categories..." oninput="handleSearch(event)" />

        <!-- Tabel Kategori -->
        <table id="categories-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Is Published</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th> <!-- Tambahkan kolom untuk aksi -->
                </tr>
            </thead>
            <tbody>
                <!-- Data kategori akan dimasukkan di sini oleh JavaScript -->
            </tbody>
        </table>
        <div id="pagination" class="pagination-container"></div>
    </div>

    <!-- Modal untuk Tambah/Edit Category -->
    <div id="category-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2 id="modal-title">Tambah Category Baru</h2>
            <form id="category-form">
                <input type="hidden" id="category-id" name="category-id">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required><br>

                <label for="is_publish">Is Publish:</label>
                <select id="is_publish" name="is_publish" required>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select><br>

                <button type="submit">Submit</button>
            </form>
        </div>
    </div>

    <script type="module" src="js/main.js"></script>
</body>
</html>
```

### 2. **Update JavaScript untuk Mengelola Edit dan Tambah**

Tambahkan logika untuk mengedit kategori yang sudah ada ketika tombol "Edit" diklik.

#### **Updated `main.js`:**

```javascript
// js/main.js

import { fetchCategories } from './api.js';

let currentPage = 1;
let currentSearch = ''; // Variabel untuk menyimpan kata kunci pencarian

function renderCategories(categories) {
    const tableBody = document.querySelector('#categories-table tbody');
    tableBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi

    categories.forEach(category => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.is_publish ? 'Yes' : 'No'}</td>
            <td>${new Date(category.created_at).toLocaleString()}</td>
            <td>${new Date(category.updated_at).toLocaleString()}</td>
            <td>
                <button class="edit-btn" data-id="${category.id}" data-name="${category.name}" data-is_publish="${category.is_publish}">Edit</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Tambahkan event listener untuk tombol Edit
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });
}

function renderPagination(data) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (data.prev_page_url) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => loadCategories(data.current_page - 1, currentSearch);
        paginationDiv.appendChild(prevButton);
    }

    for (let i = 1; i <= data.last_page; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === data.current_page) {
            pageButton.disabled = true;
        } else {
            pageButton.onclick = () => loadCategories(i, currentSearch);
        }
        paginationDiv.appendChild(pageButton);
    }

    if (data.next_page_url) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => loadCategories(data.current_page + 1, currentSearch);
        paginationDiv.appendChild(nextButton);
    }
}

async function loadCategories(page = 1, search = '') {
    currentSearch = search; // Update pencarian saat ini
    const data = await fetchCategories(page, search);
    renderCategories(data.data); // Menampilkan kategori di tabel
    renderPagination(data); // Mengatur pagination
}

// Fungsi untuk menangani input pencarian
function handleSearch(event) {
    const searchQuery = event.target.value;
    loadCategories(1, searchQuery); // Mulai pencarian dari halaman 1
}

// Modal logic
const modal = document.getElementById('category-modal');
const addCategoryBtn = document.getElementById('add-category-btn');
const closeModalBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('category-form');

// Buka modal ketika tombol diklik
addCategoryBtn.onclick = () => {
    modalTitle.textContent = 'Tambah Category Baru';
    form.reset();
    form.removeAttribute('data-editing-id');
    modal.style.display = 'block';
};

// Tutup modal ketika tombol close diklik
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
};

// Tutup modal ketika klik di luar konten modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Handle Edit Button Click
function handleEditClick(event) {
    const button = event.target;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const isPublish = button.getAttribute('data-is_publish');

    modalTitle.textContent = 'Edit Category';
    document.getElementById('category-id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('is_publish').value = isPublish;

    form.setAttribute('data-editing-id', id); // Tandai bahwa kita sedang mengedit
    modal.style.display = 'block';
}

// Form submission logic
form.onsubmit = async function(event) {
    event.preventDefault(); // Mencegah reload halaman

    const formData = new FormData(form);
    const id = formData.get('category-id');
    const name = formData.get('name');
    const is_publish = formData.get('is_publish');

    let url = 'https://bukupedia.alwaysdata.net/api/categories';
    let method = 'POST';

    if (form.hasAttribute('data-editing-id')) {
        url += `/${id}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, is_publish })
    });

    if (response.ok) {
        form.reset();
        modal.style.display = 'none';
        loadCategories(); // Refresh kategori setelah menambah/mengedit data
    } else {
        console.error('Failed to add/edit category');
    }
};

// Fetch and display the first page of categories on load
loadCategories();
```

### 3. **Backend: Update CategoryController untuk Mendukung Update**

Pastikan `CategoryController` Anda memiliki metode `update` untuk menangani permintaan PUT untuk memperbarui kategori yang ada.

```php
public function update(Request $request, $id)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'is_publish' => 'required|boolean',
    ]);

    $category = Category::findOrFail($id);
    $category->update($validatedData);

    return response()->json($category, 200);
}
```

### Kesimpulan

Dengan pembaruan ini, Anda sekarang memiliki tombol "Edit" di setiap baris tabel yang membuka modal untuk mengedit data kategori. Modal akan menampilkan data kategori yang ada, dan pengguna dapat memperbarui informasi tersebut. Setelah disubmit, data akan dikirim ke backend melalui metode PUT, dan tabel akan diperbarui untuk mencerminkan perubahan.