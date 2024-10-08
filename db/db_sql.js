// db_sql.js
module.exports = {
    // 상품 테이블
    products_select:'SELECT * FROM products',
    products_insert: 'INSERT INTO products (name, price, image_url, on_sale, original_price, sale_price) VALUES (?, ?, ?, ?, ?, ?)',
    products_delete: 'DELETE FROM products WHERE id = ?',
    
    products_insert: 'INSERT INTO products (name, price, image_url, on_sale, original_price, sale_price, latitude, longitude, user_id, acc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    products_select_one: 'SELECT * FROM products WHERE id = ?',
    products_delete: 'DELETE FROM products WHERE id = ?',
    products_select_popular: "SELECT * FROM products WHERE name LIKE '%인기%'",
    products_select_sales: 'SELECT * FROM products WHERE sale_price IS NOT NULL',

   // 찜하기 (장바구니) 테이블
   cart_select: 'SELECT * FROM cart',
   cart_select_user: 'SELECT * FROM cart WHERE user_id = ?',
   cart_insert: 'INSERT INTO cart (user_id, product_id) VALUES (?, ?)',
   cart_delete: 'DELETE FROM cart WHERE user_id = ? AND product_id = ?',

    // 찜하기 테이블
    wish_select_user: 'SELECT p.id, p.name, p.price, p.image_url FROM wish w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?',
    wish_insert: 'INSERT INTO wish (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id;',
    wish_delete: 'DELETE FROM wish WHERE user_id = ? AND product_id = ?',

    // 회원 테이블
    cust_select_not_admin: 'SELECT * FROM cust WHERE id != \'admin\'',
    cust_select: 'SELECT * FROM cust',
    cust_select_one: 'SELECT * FROM cust WHERE id = ?',
    cust_insert: 'INSERT INTO cust VALUES (?,?,?,?)',
    cust_update: 'UPDATE cust SET pwd=?, name=?, acc=? WHERE id=?',
    cust_delete: 'DELETE FROM cust WHERE id = ?',
};
