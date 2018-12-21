const express = require("express");
const port = 3000;

express()
  .use(express.static("public"))
  .get("/", (req, res) => res.sendFile("index.html", { root: __dirname }))
  .listen(port, () => console.log(`Example app listening on port ${port}!`));