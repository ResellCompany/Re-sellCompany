const express = require('express');
const router = express.Router();
const db_connect = require('../db/db_connect');
const db_sql = require('../db/db_sql');

// 찜하기 목록 조회
router.get('/wishlist', (req, res) => {
    let userid = req.query.userid || req.session.userid || req.user.id;
    let conn = db_connect.getConnection();

    conn.query(db_sql.wish_select_user, [userid], (err, result) => {
        if (err) {
            console.log('Select Error');
            return res.status(500).send('Server Error');
        }
        res.json(result);
        db_connect.close(conn);
    });
});

// 찜하기 추가
router.post('/add', (req, res) => {
    let userid = req.body.userid;
    let productid = req.body.productid;
    let conn = db_connect.getConnection();

    conn.query(db_sql.wish_insert, [userid, productid], (err) => {
        if (err) {
            console.log('Insert Error');
            return res.status(500).send('Server Error');
        }
        res.redirect('/wishlist?userid=' + userid);
        db_connect.close(conn);
    });
});

// 찜하기 삭제
router.post('/remove', (req, res) => {
    let userid = req.body.userid;
    let productid = req.body.productid;
    let conn = db_connect.getConnection();

    conn.query(db_sql.wish_delete, [userid, productid], (err) => {
        if (err) {
            console.log('Delete Error');
            return res.status(500).send('Server Error');
        }
        res.redirect('/wishlist?userid=' + userid);
        db_connect.close(conn);
    });
});

module.exports = router;
