const express = require('express');
const router = express.Router();
const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');
var goto = require('../util/goto');
// 상품 등록 페이지 렌더링
router.get('/register', (req, res) => {
    goto.go(req, res, { 'centerpage': 'item/register' });
});

// 상품 등록 처리
router.post('/register', (req, res) => {
    const { name, price, image_url, on_sale, original_price } = req.body;

    const finalOriginalPrice = original_price ? original_price : null;

    const salePrice = on_sale === 'true' ? finalOriginalPrice : null;

    const conn = db_connect.getConnection();

    conn.query(db_sql.products_insert, [name, price, image_url, on_sale === 'true', finalOriginalPrice, salePrice], function (e, result) {
        try {
            if (e) {
                console.log('Insert Error:', e);
                throw e;
            } else {
                res.redirect('/');
            }
        } catch (e) {
            console.log(e);
            // 필요에 따라 에러 처리
        } finally {
            db_connect.close(conn);
        }
    });
});


module.exports = router;
