require('dotenv').config();
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MemoryStore = require("memorystore")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const cors = require("cors");
const app = express();
const port = process.env.SERVER_PORT || 3000;

// 데이터베이스 연결 및 쿼리
const db_connect = require('./db/db_connect');
const db_sql = require('./db/db_sql');

// 유틸리티 및 라우터
const goto = require('./util/goto');
const itemRouter = require('./routes/item');
const cartRouter = require('./routes/cart');
const adminRouter = require('./routes/admin');
const custRouter = require('./routes/cust');

// Nunjucks 템플릿 엔진 설정
nunjucks.configure('views', {
    express: app,
    autoescape: true,  // XSS 공격 방지
});
app.set('view engine', 'html');

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(cors());

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: 86400000 }) // 24시간
}));

// Passport 초기화 및 세션 설정
app.use(passport.initialize());
app.use(passport.session());

// Passport 설정: 사용자 직렬화 및 역직렬화
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// 로컬 로그인 전략 설정
passport.use(new LocalStrategy({
    usernameField: "id",
    passwordField: "pwd",
}, (userid, password, done) => {
    const conn = db_connect.getConnection();
    conn.query(db_sql.cust_select_one, [userid], (err, row) => {
        db_connect.close(conn);
        if (err) return done(err);
        if (!row[0] || row[0]['pwd'] !== password) {
            return done(null, false, { message: "Login Fail" });
        }
        const user = { id: userid, name: row[0]['name'], acc: row[0]['acc'] };
        return done(null, user);
    });
}));

// 로그인 및 로그아웃 라우트
app.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/loginerror",
}));

app.get('/loginerror', (req, res) => goto.go(req, res, { centerpage: 'loginerror' }));
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 메인 페이지 라우트
app.get('/', (req, res) => {
    const conn = db_connect.getConnection();
    conn.query(db_sql.products_select, (e, result) => {
        db_connect.close(conn);
        if (e) {
            console.log('Select Error:', e);
            return res.status(500).send("Internal Server Error");
        }
        goto.go(req, res, { products: result });
    });
})
// Popular Items 라우터
app.get('/item/popular', (req, res) => {
    const conn = db_connect.getConnection();
    conn.query(db_sql.products_select_popular, (e, result) => {
        if (e) {
            console.log('Select Error:', e);
            return res.status(500).send("Internal Server Error");
        }
        goto.go(req, res, { products: result, centerpage: 'popular' });
    });
});

// Sales Items 라우터
app.get('/item/sales', (req, res) => {
    const conn = db_connect.getConnection();
    conn.query(db_sql.products_select_sales, (e, result) => {
        if (e) {
            console.log('Select Error:', e);
            return res.status(500).send("Internal Server Error");
        }
        goto.go(req, res, { products: result, centerpage: 'sales' });
    });
});


// 기타 페이지 라우트
app.get('/login', (req, res) => goto.go(req, res, { centerpage: 'login' }));
app.get('/register', (req, res) => goto.go(req, res, { centerpage: 'register' }));
app.get('/about', (req, res) => goto.go(req, res, { centerpage: 'about' }));

// 회원가입 처리 라우트
app.post('/registerimpl', (req, res) => {
    const { id, pwd, name, acc } = req.body;

    console.log(`Registering user: ${id}, ${name}, ${acc}`);

    const conn = db_connect.getConnection();
    const values = [id, pwd, name, acc];

    conn.query(db_sql.cust_insert, values, (e) => {
        db_connect.close(conn);
        if (e) {
            console.log('Insert Error:', e);
            return goto.go(req, res, { centerpage: 'registerfail' });
        } else {
            console.log('Insert OK!');
            return goto.go(req, res, { centerpage: 'registerok' });
        }
    });
});

// 라우터 설정
app.use('/item', itemRouter);
app.use('/cart', cartRouter);
app.use('/products', itemRouter);
app.use('/admin', adminRouter);
app.use('/cust', custRouter);

// 서버 실행
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
