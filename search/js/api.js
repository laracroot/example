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
