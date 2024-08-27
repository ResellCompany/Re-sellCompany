const express = require('express');
const router = express.Router();
const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');
const goto = require('../util/goto');

// 모든 제품 목록 조회
router.get('/', (req, res) => {
    let conn = db_connect.getConnection();

    conn.query(db_sql.products_select, (err, result) => {
        try {
            if (err) {
                console.log('Select Error');
                throw err;
            } else {
                console.log(result);
                goto.go(req, res, { 'centerpage': 'cart/select', 'items': result });
            }
        } catch (e) {
            console.log(e);
            res.status(500).send('Server Error');
        } finally {
            db_connect.close(conn);
        }
    });
});

// 사용자의 장바구니 조회
router.get('/cart', (req, res) => {
    let userid = req.query.userid || req.session.userid || req.user.id;
    let conn = db_connect.getConnection();

    conn.query(db_sql.cart_select_user, [userid], (err, result) => {
        try {
            if (err) {
                console.log('Select Error');
                throw err;
            } else {
                console.log(result);
                goto.go(req, res, { 'centerpage': 'cart/cart', 'items': result });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Server Error');
        } finally {
            db_connect.close(conn);
        }
    });
});

// 장바구니에 항목 추가
router.post('/addcart', (req, res) => {
    let userid = req.body.userid;
    let itemid = req.body.itemid;
    let conn = db_connect.getConnection();

    conn.query(db_sql.products_select_one, [itemid], (err, result) => {
        try {
            if (err) {
                console.log('Select Error');
                throw err;
            } else {
                let item = result[0];
                let values = [userid, itemid, item.name, item.price, 1, item.price];

                conn.query(db_sql.cart_insert, values, (err) => {
                    try {
                        if (err) {
                            console.log('Insert Error');
                            throw err;
                        } else {
                            console.log('Added to Cart');
                            res.redirect('/cart/cart?userid=' + userid);
                        }
                    } catch (e) {
                        console.log(e);
                        res.status(500).send('Server Error');
                    } finally {
                        db_connect.close(conn);
                    }
                });
            }
        } catch (e) {
            console.log(e);
            res.status(500).send('Server Error');
        } finally {
            db_connect.close(conn);
        }
    });
});

// 제품 상세 조회
router.get('/detail', (req, res) => {
    let id = req.query.id;
    let conn = db_connect.getConnection();

    conn.query(db_sql.products_select_one, [id], (err, result) => {
        try {
            if (err) {
                console.log('Select Error');
                throw err;
            } else {
                console.log(result);
                goto.go(req, res, { 'centerpage': 'cart/detail', 'item': result[0] });
            }
        } catch (e) {
            console.log(e);
            res.status(500).send('Server Error');
        } finally {
            db_connect.close(conn);
        }
    });
});

module.exports = router;
