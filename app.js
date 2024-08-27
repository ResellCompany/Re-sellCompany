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
const item = require('./routes/item');
const cart = require('./routes/cart');
// Nunjucks 템플릿 엔진 설정
nunjucks.configure('views', {
    express: app,
});

app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'css')));

// CORS 설정
app.use(cors());

// 세션 설정
app.use(session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: 86400000 }) // 24시간
}));

// Passport 초기화 및 세션 설정
app.use(passport.initialize());
app.use(passport.session());

// Passport 설정: 사용자 직렬화 및 역직렬화
passport.serializeUser(function (req, user, done) {
    console.log('serializeUser:', user);
    done(null, user);
});

passport.deserializeUser(function (req, user, done) {
    console.log('Login User:', user.name, user.id);
    done(null, user);
});

// 로컬 로그인 전략 설정
passport.use(new LocalStrategy({
    usernameField: "id",
    passwordField: "pwd",
}, function (userid, password, done) {
    console.log('Attempting login with ID:', userid);

    const conn = db_connect.getConnection();
    conn.query(db_sql.cust_select_one, [userid], (err, row) => {
        if (err) return done(err);

        if (!row[0] || row[0]['pwd'] !== password) {
            return done(null, false, { message: "Login Fail" });
        }

        const user = { id: userid, name: row[0]['name'], acc: row[0]['acc'] };
        return done(null, user);
    });
}));

// 로그인 라우터 설정
app.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/loginerror",
}));

app.get('/loginerror', (req, res) => {
    goto.go(req, res, { centerpage: 'loginerror' });
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// 메인 페이지 라우터
app.get('/', (req, res) => {
    const conn = db_connect.getConnection();
    conn.query(db_sql.products_select, (e, result) => {
        if (e) {
            console.log('Select Error:', e);
            return res.status(500).send("Internal Server Error");
        }
        goto.go(req, res, { products: result });
    });
});

// 기타 페이지 라우터
app.get('/login', (req, res) => goto.go(req, res, { centerpage: 'login' }));
app.get('/register', (req, res) => goto.go(req, res, { centerpage: 'register' }));
app.get('/about', (req, res) => goto.go(req, res, { centerpage: 'about' }));

// 회원가입 처리 라우터
app.post('/registerimpl', (req, res) => {
    // 요청으로부터 필요한 데이터를 추출
    let id = req.body.id;
    let pwd = req.body.pwd;
    let name = req.body.name;
    let acc = req.body.acc;

    // 입력받은 데이터 확인을 위한 로그 출력
    console.log(`${id} ${pwd} ${name} ${acc}`);

    // 데이터베이스 연결
    const conn = db_connect.getConnection();
    let values = [id, pwd, name, acc];

    // 쿼리 실행
    conn.query(db_sql.cust_insert, values, (e, result, fields) => {
        try {
            if (e) {
                console.log('Insert Error');
                throw e; // 에러 발생 시 예외를 던져 catch 블록으로 이동
            } else {
                console.log('Insert OK!');
                // 회원가입 성공 페이지로 이동
                return goto.go(req, res, { centerpage: 'registerok' });
            }
        } catch (e) {
            // 에러 발생 시 실패 페이지로 이동
            console.log(e);
            return goto.go(req, res, { centerpage: 'registerfail' });
        } finally {
            // 데이터베이스 연결 닫기
            db_connect.close(conn);
        }
    });
});

// 아이템 관련 라우터
app.use('/item', item);
app.use('/cart', cart);
app.use('/products', item);


//관리자 모드 
const admin = require('./routes/admin');
app.use('/admin', admin)
// 박주민_회원정보변경 (cust)
const cust = require('./routes/cust');
app.use('/cust', cust);
// 서버 실행
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
