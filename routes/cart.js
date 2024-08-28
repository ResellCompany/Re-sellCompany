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
    const userId = req.query.userid || req.session.userid || (req.user ? req.user.id : null); // Ensure user ID is retrieved correctly

    if (!userId) {
        return res.status(403).send('로그인이 필요합니다.');
    }

    const conn = db_connect.getConnection();

    // Updated SQL query to join cart and products tables, and ensure user ID is correct
    const sql = `
        SELECT c.product_id as id, p.name, p.price, p.image_url, p.on_sale, p.sale_price, p.original_price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?;
    `;

    // Execute the query with the userId
    conn.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Select Error:', err);
            res.status(500).send('Server Error');
        } else {
            // Check if req.user exists, if not create a user object with id
            const user = req.user || { id: userId };

            // Pass the result and user data to the cart page for rendering
            goto.go(req, res, {
                centerpage: 'cart/cart',
                items: result,
                user: user // Pass user data
            });
        }
        db_connect.close(conn);
    });
});
// 장바구니 항목 반납(삭제)
router.post('/return', (req, res) => {
    const userId = req.body.user_id;
    const productId = req.body.product_id;
    console.log("------------",userId)
    console.log("------------",productId)
    if (!userId || !productId) {
        return res.status(400).json({ success: false, message: 'Invalid request' }); // JSON response
    }

    const conn = db_connect.getConnection();

    // SQL query to delete item from cart
    const sql = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';

    conn.query(sql, [userId, productId], (err, result) => {
        if (err) {
            console.error('Delete Error:', err);
            res.status(500).json({ success: false, message: 'Server Error' }); // JSON response
        } else {
            console.log('Item returned (deleted) from Cart');
            // Redirect to the original screen (change '/items' to your desired route)
            res.redirect(`/cart/cart?userid=${userId}`); // Replace '/items' with the route you want to redirect to
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
    console.log("---------------", loginid);
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
            // 성공 시 리다이렉트할 URL을 응답으로 전송
            res.json({ redirect: '/cart/cart?userid=' + userId });
        }
        db_connect.close(conn);
    });
});



module.exports = router;
