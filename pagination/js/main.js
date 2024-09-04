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
