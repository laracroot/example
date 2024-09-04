// js/main.js
import {onInput} from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';
import { fetchCategories } from './api.js';

onInput('search-input',handleSearch);

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
                <button class="delete-btn" data-id="${category.id}">Hapus</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Tambahkan event listener untuk tombol Edit
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEditClick);
    });

    // Tambahkan event listener untuk tombol Hapus
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteClick);
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
    const searchQuery = event.value;
    loadCategories(1, searchQuery); // Mulai pencarian dari halaman 1
}

// Modal logic
const modal = document.getElementById('category-modal');
const addCategoryBtn = document.getElementById('add-category-btn');
const closeModalBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('
