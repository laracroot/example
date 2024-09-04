// js/api.js

export async function fetchCategories(page = 1) {
    const response = await fetch(`/categories?page=${page}`);
    const data = await response.json();
    return data;
}
