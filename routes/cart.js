const express = require('express');
const router = express.Router();
const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');
const goto = require('../util/goto');

// 모든 제품 목록 조회
router.get('/', (req, res) => {
    goto.go(req, res, { 'centerpage': 'cart/cart_detail' });
});

// 사용자의 장바구니 조회
router.get('/cart', (req, res) => {
    const userId = req.query.userid || req.session.userid || req.user.id;
    const conn = db_connect.getConnection();

    // 사용자의 장바구니 항목 조회
    conn.query(db_sql.cart_select_user, [userId], (err, result) => {
        if (err) {
            console.error('Select Error:', err);
            res.status(500).send('Server Error');
        } else {
            // 장바구니 항목이 있는 경우 페이지로 이동
            goto.go(req, res, { 'centerpage': 'cart/cart', 'items': result });
        }
        db_connect.close(conn);
    });
});


// 제품 상세 조회
// 물건 상세 정보 페이지 렌더링
router.get('/details/:id', (req, res) => {
    const productId = req.params.id;
    const loginid = req.query.loginid;// URL에서 loginid 가져오기
    const conn = db_connect.getConnection();
    console.log("---------------",loginid);
    conn.query(db_sql.products_select_one, [productId], (err, rows) => {
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

// 장바구니에 항목 추가
router.post('/addcart', (req, res) => {
    const userId = req.body.user_id;   // 빌린 사람의 ID
    const productId = req.body.product_id; // 제품 ID
    const conn = db_connect.getConnection();

    // cart 테이블에 데이터 삽입
    conn.query(db_sql.cart_insert, [userId, productId], (err, result) => {
        if (err) {
            console.error('Insert Error:', err);
            res.status(500).send('Server Error');
        } else {
            console.log('Added to Cart');
            // 장바구니 추가 성공 시 /cart/cart 페이지로 리다이렉트
            res.redirect('/cart/cart?userid=' + userId);
        }
        db_connect.close(conn);
    });
});



module.exports = router;
