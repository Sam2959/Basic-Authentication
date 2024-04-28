import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds = 10;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "#",
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
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hash]
          );
          console.log(result);
          res.render("secrets.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginpassword = req.body.password;
  try {
    const checkEmail = await db.query("select * from users where email=$1", [
      email,
    ]);
    if (checkEmail.rows.length > 0) {
      const result = await db.query(
        "select password from users where email=$1",
        [email]
      );
      const storedHashedPassword = result.rows[0].password;
      console.log(result.rows);
      bcrypt.compare(loginpassword, storedHashedPassword, (err, result) => {
        console.log(result);
        if (err) {
          console.log(err);
        } else if (result) {
          res.render("secrets.ejs");
        } else {
          res.send("Incorrect Password");
        }
      });
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
