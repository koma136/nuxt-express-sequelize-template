const express = require("express");
const consola = require("consola");
const { Nuxt, Builder } = require("nuxt");
const app = express();
const config_ = require("../config/config");
const bodyParser = require("body-parser");
const api = require("./api");
const db = require("./models");

app.set("port", config_.port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", api);

// Import and Set Nuxt.js options
let config = require("../nuxt.config.js");
config.dev = !(process.env.NODE_ENV === "production");

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server

  db.sequelize
    .sync()
    .then(() => {
      app.listen(config.port, () => {
        require("./feeds/user_role").run();
        consola.ready({
          message: `Server listening on port : ${config_.port}`,
          badge: true
        });
      });
    })
    .catch(e => {
      throw new Error(e);
    });
}
start();
