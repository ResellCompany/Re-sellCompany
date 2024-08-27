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

    // .get('/', (req, res) => {
    //     goto.go(req, res, { 'centerpage':  'item/center' });
    // })

    // 상품 리스트 페이지 렌더링
    .get('/', (req, res) => {
        const conn = db_connect.getConnection();
        conn.query(db_sql.products_select, (err, result) => {
            if (err) {
                console.error('Select Error:', err);
                return res.status(500).send('Internal Server Error');
            } else {
                console.log('Query Result:', result);
                goto.go(req, res, { 'centerpage': 'item/item1', 'items': result });
            }
        });
        db_connect.close(conn);
    })

    // 상품 등록 페이지 렌더링
    .get('/register', (req, res) => {
        goto.go(req, res, { 'centerpage': 'item/register' });
    })

    .post('/register', upload.single('image'), (req, res) => {
        const { name, price, on_sale, original_price, latitude, longitude } = req.body; // 위도와 경도를 req.body에서 추출
        const imagePath = req.file ? `/img/${req.file.filename}` : ''; // 업로드된 이미지 경로
        const finalOriginalPrice = original_price ? original_price : null;
        const salePrice = on_sale === 'true' ? finalOriginalPrice : null;
        const userId = req.user ? req.user.id : null; // 로그인한 사용자의 ID
    
        if (!userId) {
            return res.status(403).send("로그인이 필요합니다."); // 사용자 ID가 없으면 에러 처리
        }
    
        const conn = db_connect.getConnection();
        conn.query(db_sql.products_insert_all, [name, price, imagePath, on_sale === 'true', finalOriginalPrice, salePrice, latitude, longitude, userId], (err, result) => {
            if (err) {
                console.error('Insert Error:', err);
                return res.status(500).send("Internal Server Error");
            } else {
                res.redirect('/');
            }
        });
        db_connect.close(conn);
    })
    .get('/detail', (req, res) => {
        let id = req.query.id;
        console.log(id);
        conn = db_connect.getConnection();

        conn.query(db_sql.products_select_one, id, function (err, result, fields) {
            try {
                if (err) {
                    console.log('Select Error  폼 태그가 비어있음 !');
                    throw err;
                } else {
                    console.log(result);
                    goto.go(req, res, { 'centerpage': 'item/detail', 'item': result[0] });
                }
            } catch (e) {
                console.log(e);
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
        let on_sale = req.body.on_sale === 'on' ? 1 : 0; // Checkbox 처리
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;
        let user_id = req.body.user_id;

        let values = [name, price, sale_price, original_price, image_url, on_sale, latitude, longitude, user_id, id];

        let sql = 'UPDATE products SET name = ?, price = ?, sale_price = ?, original_price = ?, image_url = ?, on_sale = ?, latitude = ?, longitude = ?, user_id = ? WHERE id = ?';

        let conn = db_connect.getConnection();

        conn.query(sql, values, (err, result) => {
            try {
                if (err) {
                    console.log('update Error');
                    throw err;
                } else {
                    console.log('update OK!');
                    res.redirect('/products/detail?id=' + id); // 수정된 URL로 리디렉션
                }
            } catch (err) {
                goto.go(req, res, { 'centerpage': 'products/detailfail' }); // 실패 페이지
                console.log(err);
            } finally {
                db_connect.close(conn);
            }
        });
    })

    // 상품 삭제
    .get('/deleteimpl', (req, res) => {
        let id = req.query.id; // GET 요청에서는 req.query 사용
        let values = [id];

        let sql = 'DELETE FROM products WHERE id = ?';

        let conn = db_connect.getConnection();

        conn.query(sql, values, (err, result) => {
            try {
                if (err) {
                    console.log('delete Error');
                    throw err;
                } else {
                    console.log('delete OK!');
                    res.redirect('/products/'); // 수정된 URL로 리디렉션
                }
            } catch (err) {
                goto.go(req, res, { 'centerpage': 'products/detailfail' }); // 실패 페이지
                console.log(err);
            } finally {
                db_connect.close(conn);
            }
        });
    });
    



module.exports = router;
