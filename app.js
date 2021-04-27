const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var app = express();
//socket stuff
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });



io.on("connection", socket => {
  console.log('a user connected');
  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      this.usernameAlreadySelected = false;
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


io.on('connection', (socket) => {
  console.log('a user connected');
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 3000;

server.listen(port, () => { console.log(`Server is listening on ${port}`) });

module.exports = app;
