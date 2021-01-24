const express = require("express");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const moment = require("moment");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const morgan = require("morgan");
const connectMongo = require("connect-mongo");
const mongoose = require("mongoose");

const { createAdminUser } = require("./libs/createUser");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

// Initializations
const app = express();
require("./config/passport");
createAdminUser();

// settings
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(handlebars),
    helpers: {
      "select":function(selected, options) {  return options.fn(this).replace(new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"');},
      "json":function(context) {return JSON.stringify(context);},
      "moment": require('helper-moment'),
      'compare': function (lvalue, operator, rvalue, options) {

        var operators, result;
        
        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
        
        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }
        
        operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '!==': function (l, r) { return l !== r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        };
        
        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        
        result = operators[operator](lvalue, rvalue);
        
        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    
    },
    "progress":  function (n, d) {return (100*n)/d }
      }
    })
  );
app.set("view engine", ".hbs"); 

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
const MongoStore = connectMongo(session);
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// routes
app.use(require("./routes/index.routes"));
app.use(require("./routes/users.routes"));
app.use(require("./routes/notes.routes"));
app.use(require("./routes/customers.routes"));
app.use(require("./routes/products.routes"));
app.use(require("./routes/queries.routes"));

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.render("404");
});

module.exports = app;