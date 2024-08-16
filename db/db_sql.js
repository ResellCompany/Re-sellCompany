module.exports = {
    products_select:'SELECT * FROM products',
    products_insert: `INSERT INTO products (name, price, image_url, on_sale, original_price, sale_price) VALUES (?, ?, ?, ?, ?, ?)`,
};
