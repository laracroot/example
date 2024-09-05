Untuk menampilkan data kategori dalam bentuk tabel di frontend dengan kolom untuk `id`, `name`, `is_publish`, `created_at`, dan `updated_at`, Anda dapat mengikuti langkah-langkah berikut.

### 1. **Backend: CategoryController**

Pastikan metode `index` di `CategoryController` mengembalikan semua data yang diperlukan dalam format JSON. Berikut adalah kode yang sudah disesuaikan:

```php
public function index(Request $request)
{
    // Tentukan jumlah item per halaman (misalnya 10)
    $perPage = 10;

    // Ambil kategori dengan pagination
    $categories = Category::paginate($perPage);

    // Kembalikan data ke frontend dalam format JSON, termasuk informasi pagination
    return response()->json([
        'data' => $categories->items(),
        'current_page' => $categories->currentPage(),
        'last_page' => $categories->lastPage(),
        'per_page' => $categories->perPage(),
        'total' => $categories->total(),
        'prev_page_url' => $categories->previousPageUrl(),
        'next_page_url' => $categories->nextPageUrl(),
    ]);
}
```

### 2. **Frontend: HTML dan JavaScript**

Berikut adalah bagaimana Anda dapat menampilkan data tersebut dalam bentuk tabel di frontend dengan vanilla JavaScript.

#### a. **HTML (index.html)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categories with Pagination</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Categories</h1>
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

    <script type="module" src="js/main.js"></script>
</body>
</html>
```

#### b. **JavaScript (main.js dan api.js)**

**`js/api.js`:**

```javascript
// js/api.js

export async function fetchCategories(page = 1) {
    const response = await fetch(`https://bukupedia.alwaysdata.net/api/categories?page=${page}`);
    const data = await response.json();
    return data;
}
```

**`js/main.js`:**

```javascript
// js/main.js

import { fetchCategories } from './api.js';

let currentPage = 1;

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
        prevButton.onclick = () => loadCategories(data.current_page - 1);
        paginationDiv.appendChild(prevButton);
    }

    for (let i = 1; i <= data.last_page; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === data.current_page) {
            pageButton.disabled = true;
        } else {
            pageButton.onclick = () => loadCategories(i);
        }
        paginationDiv.appendChild(pageButton);
    }

    if (data.next_page_url) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => loadCategories(data.current_page + 1);
        paginationDiv.appendChild(nextButton);
    }
}

async function loadCategories(page = 1) {
    const data = await fetchCategories(page);
    renderCategories(data.data); // Menampilkan kategori di tabel
    renderPagination(data); // Mengatur pagination
}

// Fetch and display the first page of categories on load
loadCategories();
```

### 3. **CSS (styles.css)**

Anda bisa menambahkan gaya untuk tabel dan pagination agar terlihat lebih menarik.

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
```

### Kesimpulan

Dengan pendekatan ini, frontend Anda akan menampilkan data kategori dalam bentuk tabel lengkap dengan pagination. Setiap kategori akan memiliki ID, nama, status publikasi, dan tanggal pembuatan serta pembaruan. Tabel ini juga akan disertai dengan navigasi pagination yang memungkinkan pengguna untuk beralih di antara halaman-halaman data.