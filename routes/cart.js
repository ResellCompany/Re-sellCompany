const express = require('express');
const router = express.Router();
const nunjucks = require('nunjucks'); // HTML 파싱
const bodyParser = require('body-parser');
// My util
var goto = require('../util/goto');

// Database 연동
var db_connect = require('../db/db_connect');
var db_sql = require('../db/db_sql');

router
    .get('/', (req, res) => {
        goto.go(req, res, { 'centerpage': '/cart' });
    });

module.exports = router;