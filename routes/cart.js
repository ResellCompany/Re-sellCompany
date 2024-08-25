const express = require('express');
const router = express.Router();
const goto = require('../util/goto');


var db_connect = require('../db/db_connect');
var db_sql = require('../db/db_sql');
// 물건 목록 페이지 렌더링
router.get('/', (req, res) => {
    goto.go(req, res, { 'centerpage': 'cart/cart' });
});

// 물건 상세 정보 페이지 렌더링
router.get('/details/:id', (req, res) => {
    const productId = req.params.id; // URL에서 물건 ID 가져오기
    const conn = db_connect.getConnection();

    conn.query(db_sql.product_select_one, [productId], (err, rows) => {
        try {
            if (err) {
                console.error('Select Error:', err);
                throw err;
            }

            if (rows.length > 0) {
                const product = rows[0];
                goto.go(req, res, {
                    centerpage: 'cart/cart',
                    product: product
                });
            } else {
                res.status(404).send('Product not found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        } finally {
            db_connect.close(conn);
        }
    });
});

module.exports = router;
