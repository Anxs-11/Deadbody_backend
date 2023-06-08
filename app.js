// global imports
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var dotenv = require("dotenv");
// load env variables
dotenv.config();
// configure server for logging.
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use(bodyParser.json());
app.set("view engine", "ejs");

// accept all requests
app.all("*", async (req, res, func) => {
  const regex = /[/]api[/]/g;
  console.log(`Incoming request from ${req.ip} to ${req.url}`);
  if (regex.test(req.url)) {
    try {
      const url = req.url;
      var path = "";
      for (var i = 0; i < url.length && url[i] !== "?"; i++) {
        path += url[i];
      }
      console.log(`Loading .${path}`);
      var api = require(`.${path}`);
      try {
        console.log(`Executing .${path}`);
        await api.execute(req, res);
        console.log(`Unloading .${path}`);
        delete require.cache[require.resolve(`.${path}`)];
      } catch (err) {
        console.log(`Unloading .${path}`);
        delete require.cache[require.resolve(`.${path}`)];
        console.log(`Error: ${err.message}`);
        res.status(200).json({
          success: false,
          message: err.message,
        });
      }
    } catch (err) {
      console.log(`Failed to load .${req.url} ! \n error: ${err.message}`);
      console.log(`Unloading .${path}`);
      delete require.cache[require.resolve(`.${path}`)];
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Page not found ! ",
    });
  }
});

// run server.
const port = process.env.API_PORT || 5002;
app.listen(port, (req, res) => {
  console.log(`Server Running at port: ${port}`);
});

// to prevent server from crashing.
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
});
