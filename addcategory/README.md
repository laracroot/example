Untuk menambahkan fitur yang memungkinkan pengguna menambah kategori baru melalui modal form, Anda dapat mengikuti langkah-langkah berikut. Kami akan menambahkan tombol "Tambah Category", membuat modal yang berisi form input untuk menambahkan kategori baru, dan menggunakan JavaScript untuk mengirim data ke backend menggunakan metode POST.

### 1. **HTML: Tambahkan Tombol dan Modal**

Tambahkan tombol "Tambah Category" dan modal yang akan muncul ketika tombol tersebut diklik.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categories with Pagination, Search, and Add Feature</title>
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
                </tr>
            </thead>
            <tbody>
                <!-- Data kategori akan dimasukkan di sini oleh JavaScript -->
            </tbody>
        </table>
        <div id="pagination" class="pagination-container"></div>
    </div>

    <!-- Modal untuk Tambah Category -->
    <div id="category-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Tambah Category Baru</h2>
            <form id="add-category-form">
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

### 2. **CSS: Tambahkan Gaya untuk Modal**

Tambahkan gaya untuk modal di `styles.css` agar modal tampil dengan baik.

```css
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

.container {
    width: 80%;
    margin: 50px auto;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
    color: #333;
}

#search-input {
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

.pagination-container {
    text-align: center;
}

.pagination-container button {
    display: inline-block;
    padding: 8px 16px;
    margin: 0 4px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-container button:hover {
    background-color: #0056b3;
}

.pagination-container button:disabled {
    background-color: #0056b3;
    cursor: not-allowed;
}

#add-category-btn {
    margin-bottom: 20px;
    padding: 10px 20px;
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

#add-category-btn:hover {
    background-color: #218838;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 50%;
    border-radius: 8px;
}

.close-btn {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close-btn:hover,
.close-btn:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
```

### 3. **JavaScript: Tambahkan Logika untuk Modal dan Form Submission**

Tambahkan logika untuk membuka modal, menutup modal, dan mengirim data form ke backend.

**`js/main.js`:**

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
        `;

        tableBody.appendChild(row);
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

// Buka modal ketika tombol diklik
addCategoryBtn.onclick = () => {
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

// Form submission logic
const form = document.getElementById('add-category-form');
form.onsubmit = async function(event) {
    event.preventDefault(); // Mencegah reload halaman

    const formData = new FormData(form);

    const response = await fetch('https://bukupedia.alwaysdata.net/api/categories', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.get('name'),
            is_publish: formData.get('is_publish')
        })
    });

    if (response.ok) {
        form.reset();
        modal.style.display = 'none';
        loadCategories(); // Refresh kategori setelah menambah data
    } else {
        console.error('Failed to add category');
    }
};

// Fetch and display

 the first page of categories on load
loadCategories();
```

### 4. **Backend: Pastikan `CategoryController` Mendukung Penambahan Kategori**

Pastikan `CategoryController` memiliki metode `store` yang menghandle POST request untuk menambah kategori baru.

```php
public function store(Request $request)
{
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'is_publish' => 'required|boolean',
    ]);

    $category = Category::create($validatedData);

    return response()->json($category, 201);
}
```

### Kesimpulan

Dengan langkah-langkah ini, Anda telah menambahkan fitur untuk menambah kategori baru melalui modal form di frontend. Ketika pengguna mengklik tombol "Tambah Category", sebuah modal akan muncul, dan setelah pengguna mengisi form dan menekan submit, data akan dikirim ke backend menggunakan AJAX. Setelah kategori baru ditambahkan, daftar kategori akan di-refresh untuk menampilkan data yang baru saja ditambahkan.