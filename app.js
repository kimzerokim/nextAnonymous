/**
 * Created by YoungKim on 2014. 7. 17
 */


//express setting
var express = require('express'),
    http = require('http'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    compression = require('compression'),
    csrf = require('csurf');

//prepare for cluster
var cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

//route
var routes = require('./server_code/routes');

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    /////////////////////////
    ///// express app setting
    /////////////////////////

    var app = express(),
        server = http.createServer(app);

    app.set('port', process.env.PORT || 2000);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser('nextAnonymous'));
    app.use(session({
        secret: 'nextAnonymous',
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // one week
        },
        resave: true,
        saveUninitialized: true
    }));
    app.use(methodOverride());
    //app.use(compression());
    app.use(csrf());

    //for auth
    function userAuth(req, res, next) {
        //loginStatus on
        if (req.session.loginStatus && req.session.userId != null && req.session.userId != undefined) {
            return next();
        }

        //loginStatus off
        else {
            req.session.isAdmin = false;
            req.session.loginStatus = false;
            res.redirect('/user/login');
        }
    }

    //////////////////
    ///// start route
    //////////////////

    ////////////////
    //basic function
    ////////////////
    app.get('/', userAuth, routes.userFeed);
    app.get('/card', userAuth, routes.loadWholeCard);


    //////////////////
    //card sort option
    //////////////////
    app.get('/card/hitCard', userAuth, routes.sendHitCard);
    app.get('/card/hit', userAuth, routes.loadHitCard);
    app.get('/card/:card_id/setFavorite', userAuth, routes.setFavoriteCard);
    app.get('/card/favoriteCard', userAuth, routes.sendFavoriteCard);
    app.get('/card/favorite/:id', userAuth, routes.loadFavoriteCard);
    app.get('/card/userCard', userAuth, routes.sendUserCard);
    app.get('/card/user/:id', userAuth, routes.loadUserCard);

    ////////////////
    //user register
    ////////////////
    app.get('/user/register', routes.userRegisterPage);
    app.post('/user/register/add', routes.userRegisterAdd);
    //ajax로 구현하면 좋을 것.
    //app.get('/user/register/checkId', routes.userRegisterCheckId);
    //app.get('/user/register/checkMail', routes.userRegisterCheckMail);
    app.get('/user/register/complete/:authKey', routes.userRegisterComplete);


    ////////////////
    //user login
    ////////////////
    app.get('/user/login', function (req, res) {
        res.render('signin');
    });
    app.post('/user/login/complete', routes.userLoginComplete);
    app.get('/user/logout', routes.userLogoutComplete);


    ////////////////
    //user review
    ////////////////
    app.get('/user/review', routes.userReviewPage);
    app.post('/user/review/add', routes.userReviewAdd);


    ////////////////////
    //user close account
    ////////////////////
    app.get('/user/closeAccount', routes.userCloseAccountPage);
    app.post('/user/closeAccount/complete', routes.userCloseAccountComplete);


    ////////////////
    //writeCard
    ////////////////
    app.post('/card/add', routes.write);


    ////////////////
    //modifyCard
    ////////////////
    //app.post('/card/:card_id/like', routes.like);
    app.post('/card/:card_id/comment/add', routes.addComment);
    app.post('/card/:card_id/delete', routes.deleteCard);
    //app.get('/card/:card_id/report', routes.reportCard);


    //for error handle

    /// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('message', {
            message: '서버 에러 입니다.'
        });
    });


    //////////////////
    ///// start server
    //////////////////

    server.listen(app.get('port'), function () {
        console.log('\n///////////////////////////////////////////////\n' +
            '//// Express server listening on port ' + app.get('port') + ' ////' +
            '\n///////////////////////////////////////////////');
    });
}
