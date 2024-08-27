module.exports = {
    products_select:'SELECT * FROM products',
    products_insert: 'INSERT INTO products (name, price, image_url, on_sale, original_price, sale_price) VALUES (?, ?, ?, ?, ?, ?)',
    product_select_one: 'SELECT * FROM products WHERE id = ?',
    
    
    cart_select: 'SELECT * FROM cart',
    cart_select_one: 'SELECT id, product_id, product_name, product_price, quantity, total_price, date_format(regdate, "%Y년%m월%d일 %H:%i:%s") as regdate FROM cart WHERE userid = ?',
    cart_insert: 'INSERT INTO cart (product_id, product_name, product_price, quantity, total_price, regdate) VALUES (?, ?, ?, ?, ?, SYSDATE())',
    cart_delete: 'DELETE FROM cart WHERE id = ?',


    cust_select_not_admin : `SELECT * FROM cust WHERE id != 'admin'`,
    cust_select: 'SELECT * FROM cust',
    cust_select_one: 'SELECT * FROM cust WHERE id = ?',
    cust_insert: 'INSERT INTO cust VALUES (?,?,?,?)',
    cust_update: 'UPDATE cust SET pwd=?, name=?, acc=? WHERE id=?',
    cust_delete: 'DELETE FROM cust WHERE id = ?',
};
