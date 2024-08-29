const express = require('express');
const router = express.Router();
const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');
const goto = require('../util/goto');
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img'); // 이미지를 저장할 경로
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름을 현재 시간 + 확장자로 설정
    }
});

const upload = multer({ storage: storage });

router

    // 홈 페이지에서 모든 아이템 표시
    .get('/', (req, res) => {
        const conn = db_connect.getConnection();
        conn.query(db_sql.products_select, (err, result) => {
            if (err) {
                console.error('Select Error:', err);
                return res.status(500).send('Internal Server Error');
            } else {
                goto.go(req, res, { 'centerpage': 'item/item1', 'items': result });
            }
        });
        db_connect.close(conn);
    })

    // 인기 아이템 페이지
    .get('/popular', (req, res) => {
        const conn = db_connect.getConnection();
        conn.query(db_sql.products_select_popular, (err, result) => {
            if (err) {
                console.error('Select Error:', err);
                return res.status(500).send('Internal Server Error');
            } else {
                goto.go(req, res, { 'centerpage': 'item/popular', 'items': result });
            }
        });
        db_connect.close(conn);
    })

    // 세일 아이템 페이지
    .get('/sales', (req, res) => {
        const conn = db_connect.getConnection();
        conn.query(db_sql.products_select_sales, (err, result) => {
            if (err) {
                console.error('Select Error:', err);
                return res.status(500).send('Internal Server Error');
            } else {
                goto.go(req, res, { 'centerpage': 'item/sales', 'items': result });
            }
        });
        db_connect.close(conn);
    })

    // 상품 등록 페이지 렌더링
    .get('/register', (req, res) => {
        goto.go(req, res, { 'centerpage': 'item/register' });
    })

    // 상품 등록 처리
    .post('/register', upload.single('image'), (req, res) => {
        const { name, price, on_sale, original_price, latitude, longitude } = req.body;
        const imagePath = req.file ? `/img/${req.file.filename}` : '';
        const finalOriginalPrice = original_price ? original_price : null;
        const salePrice = on_sale === 'true' ? price : null;
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(403).send("로그인이 필요합니다.");
        }

        const conn = db_connect.getConnection();
        conn.query(db_sql.cust_select_one, [userId], (err, result) => {
            if (err) {
                console.error('Select Error:', err);
                db_connect.close(conn);
                return res.status(500).send("Internal Server Error");
            }
    
            const acc = result[0].acc; // custResult로부터 acc 값 가져오기
    
            // 제품 삽입 쿼리
            conn.query(db_sql.products_insert, [name, price, imagePath, on_sale === 'true', finalOriginalPrice, salePrice, latitude, longitude, userId, acc], (err, result) => {
                if (err) {
                    console.error('Insert Error:', err);
                    db_connect.close(conn);
                    return res.status(500).send("Internal Server Error");
                } else {
                    res.redirect('/');
                }
            });
        });
    })

    // 상품 상세 페이지
    .get('/detail', (req, res) => {
        let id = req.query.id;
        const conn = db_connect.getConnection();

        conn.query(db_sql.products_select_one, id, function (err, result) {
            try {
                if (err) {
                    throw err;
                } else {
                    goto.go(req, res, { 'centerpage': 'item/detail', 'item': result[0] });
                }
            } catch (e) {
                console.error(e);
            } finally {
                db_connect.close(conn);
            }
        });
    })

    // 상품 정보 업데이트
    .post('/updateimpl', (req, res) => {
        let id = req.body.id;
        let name = req.body.name;
        let price = req.body.price;
        let sale_price = req.body.sale_price;
        let original_price = req.body.original_price;
        let image_url = req.body.image_url;
        let on_sale = req.body.on_sale === 'on' ? 1 : 0;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;
        let user_id = req.body.user_id;

        let values = [name, price, sale_price, original_price, image_url, on_sale, latitude, longitude, user_id, id];

        let sql = 'UPDATE products SET name = ?, price = ?, sale_price = ?, original_price = ?, image_url = ?, on_sale = ?, latitude = ?, longitude = ?, user_id = ? WHERE id = ?';

        const conn = db_connect.getConnection();

        conn.query(sql, values, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    res.redirect('/detail?id=' + id);
                }
            } catch (err) {
                goto.go(req, res, { 'centerpage': 'item/detailfail' });
            } finally {
                db_connect.close(conn);
            }
        });
    })

    // 상품 삭제
    .get('/deleteimpl', (req, res) => {
        let id = req.query.id;
        let values = [id];

        let sql = 'DELETE FROM products WHERE id = ?';

        const conn = db_connect.getConnection();

        conn.query(sql, values, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    res.redirect('/');
                }
            } catch (err) {
                goto.go(req, res, { 'centerpage': 'item/detailfail' });
            } finally {
                db_connect.close(conn);
            }
        });
    });

module.exports = router;
