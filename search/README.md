Untuk menambahkan fitur pencarian kategori di frontend dan backend, Anda bisa mengikuti langkah-langkah berikut:

### 1. **Backend: Update CategoryController untuk Mendukung Pencarian**

Tambahkan logika pencarian di dalam metode `index` pada `CategoryController`. Anda bisa menggunakan query parameter seperti `?search=keyword` untuk melakukan pencarian.

```php
public function index(Request $request)
{
    $perPage = 10;

    // Ambil nilai pencarian dari query string
    $search = $request->input('search');

    // Query dasar untuk mendapatkan kategori
    $query = Category::query();

    // Jika ada nilai pencarian, tambahkan kondisi ke query
    if ($search) {
        $query->where('name', 'like', '%' . $search . '%')
              ->orWhere('id', 'like', '%' . $search . '%')
              ->orWhere('is_publish', 'like', '%' . $search . '%')
              ->orWhere('created_at', 'like', '%' . $search . '%')
              ->orWhere('updated_at', 'like', '%' . $search . '%');
    }

    // Dapatkan hasil query dengan pagination
    $categories = $query->paginate($perPage);

    // Kembalikan data ke frontend dalam format JSON
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

### 2. **Frontend: Update HTML dan JavaScript untuk Menambahkan Fitur Pencarian**

Tambahkan input pencarian di HTML dan modifikasi JavaScript untuk menangani pencarian.

#### a. **Update HTML (index.html)**

Tambahkan input pencarian di atas tabel kategori:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categories with Pagination and Search</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Categories</h1>
        
        <!-- Input pencarian -->
        <input type="text" id="search-input" placeholder="Search categories..." oninput="handleSearch(event)" />

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

#### b. **Update JavaScript (main.js dan api.js)**

Tambahkan logika untuk melakukan pencarian berdasarkan input dari pengguna.

**`js/api.js`:**

Tambahkan parameter `search` ke fungsi `fetchCategories` untuk menangani query pencarian.

```javascript
// js/api.js

export async function fetchCategories(page = 1, search = '') {
    const url = new URL(`https://bukupedia.alwaysdata.net/api/categories`);
    url.searchParams.append('page', page);
    if (search) {
        url.searchParams.append('search', search);
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
}
```

**`js/main.js`:**

Modifikasi `main.js` untuk menangani pencarian:

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

// Fetch and display the first page of categories on load
loadCategories();
```

### 3. **CSS (styles.css)**

Anda dapat menambahkan beberapa gaya untuk input pencarian agar lebih baik secara visual.

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
```

### Kesimpulan

Dengan modifikasi ini, Anda telah menambahkan fitur pencarian ke dalam aplikasi kategori Anda. Pengguna dapat memasukkan kata kunci di kotak pencarian, dan hasil pencarian akan ditampilkan dalam tabel, lengkap dengan pagination yang berfungsi berdasarkan hasil pencarian. Aplikasi ini sekarang mendukung interaksi yang lebih dinamis, memungkinkan pengguna untuk menemukan kategori dengan cepat dan mudah.