// /admin 라우터 호출 동작 코드 파일
const express = require('express');
const app = express();
const router = express.Router();
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

var db_connect = require('../db/db_connect');
var db_sql = require('../db/db_sql');

var goto = require('../util/goto');

router
    .get('/', (req, res) => {
        const conn = db_connect.getConnection();
        conn.query(db_sql.cart_select, (err, result) => {
            if (err) {
                console.log('Select Error:', err);
            } else {
                goto.go(req, res, { 'centerpage': 'admin/center', 'carts': result });
            }
            db_connect.close(conn);
        });
    })
    .post('/delete/:id', (req, res) => {
        const cartId = req.params.id;
        const conn = db_connect.getConnection();
        conn.query(db_sql.cart_delete, [cartId], (err, result) => {
            if (err) {
                console.log('Delete Error:', err);
            } else {
                res.redirect('/admin');
            }
            db_connect.close(conn);
        });
    })

    .post('/delete/:id', (req, res) => {
        const cartId = req.params.id;
        const conn = db_connect.getConnection();
        conn.query(db_sql.cart_delete, [cartId], (err, result) => {
            if (err) {
                console.log('Delete Error:', err);
            } else {
                res.redirect('/admin');
            }
            db_connect.close(conn);
        });
    })
    .post('/delete2/:id', (req, res) => {
        const itemId = req.params.id;
        const conn = db_connect.getConnection();
        conn.query(db_sql.item_delete, [itemId], (err, result) => {
            if (err) {
                console.log('Delete Error:', err);
            } else {
                res.redirect('/item/item1');
            }
            db_connect.close(conn);
        });
    });

module.exports = router;
