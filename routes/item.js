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



// 상품 등록 페이지 렌더링
router.get('/register', (req, res) => {
    goto.go(req, res, { 'centerpage': 'item/register' });
});

// 상품 등록 처리
router.post('/register', upload.single('image'), (req, res) => {
    const { name, price, on_sale, original_price } = req.body;
    const imagePath = req.file ? `/img/${req.file.filename}` : ''; // 업로드된 이미지 경로
    const finalOriginalPrice = original_price ? original_price : null;
    const salePrice = on_sale === 'true' ? finalOriginalPrice : null;
    const userId = req.user ? req.user.id : null; // 로그인한 사용자의 ID

    if (!userId) {
        return res.status(403).send("로그인이 필요합니다."); // 사용자 ID가 없으면 에러 처리
    }

    const conn = db_connect.getConnection();

    // 사용자 ID를 포함하여 상품을 데이터베이스에 저장
    conn.query(db_sql.products_insert, [name, price, imagePath, on_sale === 'true', finalOriginalPrice, salePrice, userId], function (e, result) {
        try {
            if (e) {
                console.log('Insert Error:', e);
                throw e;
            } else {
                res.redirect('/');
            }
        } catch (e) {
            console.log(e);
            res.status(500).send("Internal Server Error");
        } finally {
            db_connect.close(conn);
        }
    });

    
});



module.exports = router;
