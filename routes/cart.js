const express = require('express');
const router = express.Router();
const goto = require('../util/goto');

const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');

// 물건 목록 페이지 렌더링
router.get('/', (req, res) => {
    goto.go(req, res, { 'centerpage': 'cart/cart_detail' });
});

// 물건 상세 정보 페이지 렌더링
router.get('/details/:id', (req, res) => {
    const productId = req.params.id;
    const loginid = req.query.loginid;// URL에서 loginid 가져오기
    const conn = db_connect.getConnection();
    console.log("---------------",loginid);
    conn.query(db_sql.product_select_one, [productId], (err, rows) => {
        if (err) {
            console.error('Select Error:', err);
            res.status(500).send('Internal Server Error');
            db_connect.close(conn); // 에러 발생 시 커넥션 닫기
            return;
        }

        if (rows.length > 0) {
            const product = rows[0];
            // loginid를 통해 고객 정보를 가져옴
            conn.query(db_sql.cust_select_one, [loginid], (err, result) => {
                if (err) {
                    console.error('Select Error:', err);
                    res.status(500).send('Internal Server Error');
                    db_connect.close(conn); // 에러 발생 시 커넥션 닫기
                    return;
                }

                if (result.length > 0) {
                    const custinfo = result[0];
                    console.log(custinfo);
                    goto.go(req, res, {
                        centerpage: 'cart/cart_detail',
                        product: product,
                        custinfo: custinfo
                    });
                } else {
                    res.status(404).send('Customer not found');
                }

                db_connect.close(conn); // 커넥션 닫기
            });
        } else {
            res.status(404).send('Product not found');
            db_connect.close(conn); // 커넥션 닫기
        }
    });
});

module.exports = router;
