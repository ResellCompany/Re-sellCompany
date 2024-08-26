const express = require('express');
const router = express.Router();
const nunjucks = require('nunjucks'); // HTML 파싱
const bodyParser = require('body-parser');
// My util
var goto = require('../util/goto');

// Database 연동
var db_connect = require('../db/db_connect');
var db_sql = require('../db/db_sql');

// /block
router
    .get('/', (req, res) => {
        goto.go(req, res, { 'centerpage': 'cust/center' });
    })
    .get('/cust1', (req, res) => {
        conn = db_connect.getConnection();
        //'SELECT * FROM cust',
        conn.query(db_sql.cust_select, function (err, result, fields) {
            try {
                if (err) {
                    console.log('Select Error');
                    throw err; // 'e'에서 'err'로 수정
                } else {
                    console.log(result);
                    goto.go(req, res, { 'centerpage': 'cust/cust1', 'custs': result });
                }
            } catch (e) {
                console.log(e);
            } finally {
                db_connect.close(conn);
            }
        });
    })
    .get('/cust2', (req, res) => {
        goto.go(req, res, { 'centerpage': 'cust/cust2' });
    })
    .get('/cust3', (req, res) => {
        goto.go(req, res, { 'centerpage': 'cust/cust3' });
    })
    .get('/detail', (req, res) => {
        let id = req.query.id;
        console.log(id);
        conn = db_connect.getConnection();

        conn.query(db_sql.cust_select_one, id, function (err, result, fields) {
            try {
                if (err) {
                    console.log('Select Error  폼 태그가 비어있음 !');
                    throw err;
                } else {
                    console.log(result);
                    goto.go(req, res, { 'centerpage': 'cust/detail', 'cust': result[0] });
                }
            } catch (e) {
                console.log(e);
            } finally {
                db_connect.close(conn);
            }
        });
    })
    .post('/updateimpl', (req, res) => {
        let id = req.body.id;
        let pwd = req.body.pwd;
        let name = req.body.name;
        let acc = req.body.acc;
        let values = [pwd, name, acc, id];

        conn = db_connect.getConnection();

        conn.query(db_sql.cust_update, values, function (e, result, fields) {
            try {
                if (e) {
                    console.log('update Error');
                    throw e;
                } else {
                    console.log('update OK!');
                    res.redirect('/cust/detail?id=' + id); // 리디렉션 수정

                }
            } catch (e) {

                goto.go(req, res, { 'centerpage': 'cust/detailfail' }); // 'index'와 'cust/detailfail' 수정
                console.log(e);
            } finally {
                db_connect.close(conn);
            }
        });
    })
    .get('/deleteimpl', (req, res) => {
        let id = req.query.id; // GET 요청에서는 req.query 사용
        let values = [id];
    
        conn = db_connect.getConnection();
    
        conn.query(db_sql.cust_delete, values, function (e, result, fields) {
            try {
                if (e) {
                    console.log('delete Error');
                    throw e;
                } else {
                    console.log('result');
                    res.redirect('/cust/cust1'); // 리디렉션 수정
                }
            } catch (e) {
                goto.go(req, res, { 'centerpage': 'cust/detailfail' }); // 'index'와 'cust/detailfail' 수정
                console.log(e);
            } finally {
                db_connect.close(conn);
            }
        });
    });
    

module.exports = router;
