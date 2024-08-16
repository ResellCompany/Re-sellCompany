require('dotenv').config();
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const path = require('path');

//db연결 코드
var db_connect = require('./db/db_connect');
var db_sql = require('./db/db_sql');


//로그인 처리를 위한 라이브러리
const session = require('express-session');
// session 저장소 지정(메모리)
const MemoryStore = require("memorystore")(session);
// Passport lib 
const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
// My util
var goto = require('./util/goto');

// CORS 지정
const cors = require("cors");
nunjucks.configure('views', {
    express: app,
});

app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Serve static files from the 'css' directory
app.use('/css', express.static(path.join(__dirname, 'css')));

// Route to serve the main.html file
app.get('/', (req, res) => {
    conn = db_connect.getConnection();

    conn.query(db_sql.products_select, function (e, result, fields) {
        try {
            if (e) {
                console.log('Select Error');
                throw e;
            } else {
                console.log(result);
                // 가져온 데이터를 Nunjucks 템플릿에 전달
                res.render('main.html', { products: result });
            }
        } catch (e) {
            console.log(e);
            // 필요에 따라 에러 처리
        } finally {
            db_connect.close(conn);
        }
    });
});


const item = require('./routes/item');
app.use('/item', item);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
