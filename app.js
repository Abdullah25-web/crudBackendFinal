const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const auth = require("./routes/authRoutes");
const cors = require("cors");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const todosRouter = require("./routes/todos");
const bodyParser = require("body-parser");
const CookieParser = require("cookie-parser");
const config = require("config");
const app = express();
const port = 8000;
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
// app.use(cors());
app.use(
  cors({
    origin: [config.get("url")],
    credentials: true,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(CookieParser());

// Enable CORS for all routes
app.use(cors({ credentials: true, origin: config.get("url") }));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/", auth);
app.use("/", todosRouter);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});
mongoose
  .connect(config.get("db"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to Mongo Database"))
  .catch((error) => console.log(error.message));

const server = app.listen(port, () =>
  console.log(`Server started listening on port: ${port}`)
);

const io = require("socket.io")(server, {
  pingTimeout: 6000,
  cors: {
    origin: config.get("url"),
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    console.log("userData:", userData);

    io.emit("dataUpdated", {
      message: "Data has been updated!",
      data: userData,
    });

    socket.emit("connected");
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

module.exports = app;
