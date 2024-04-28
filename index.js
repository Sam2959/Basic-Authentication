import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "sam29",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkEmail = await db.query("select * from users where email=$1", [
      email,
    ]);
    if (checkEmail.rows.length > 0) {
      res.send("Email. already exists. Try loggin in...");
    } else {
      await db.query("insert into users(email,password)values($1,$2)", [
        email,
        password,
      ]);
      res.render("secrets.ejs");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkEmail = await db.query("select * from users where email=$1", [
      email,
    ]);
    if (checkEmail.rows.length > 0) {
      const result = await db.query("select email,password from users");
      if (
        email === result.rows[0].email &&
        password === result.rows[0].password
      ) {
        res.render("secrets.ejs");
      }
    } else {
      res.send("User not found, Please register..");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
