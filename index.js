const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

const LinkDB = mysql.createPool({
    host: "localhost",
    user: "StoreGuy",
    password: "password",
    database: "storedb",
    multipleStatements: true,
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/API/users", (req, res) => {
    const uQuery = "select * from usuario";
    LinkDB.query(uQuery, (err, result) => {
        if (err) res.send(err);
        console.log(result);
        res.send(result);
    });
})

app.get("/API/users/login", async (req, res) => {
    const Email = req.query.Email;
    const Password = req.query.Password;
    console.log(Email, Password);

    const Salt = await new Promise(resolve => {
        const saltQuery = "select Salt from usuario where Email = ?"
        LinkDB.query(saltQuery, Email, async (err, result) => {
            resolve(result[0].Salt)
        })
    })

    const SaltedPassword = Salt + Password;
    console.log(SaltedPassword)

    const logQuery = `select Nombre, ApePri, ApeSec, Rut, FechaNacimiento, Telefono, Email from usuario where Email = ? and Contraseña = sha2('${SaltedPassword}', 256)`;
    LinkDB.query(logQuery, Email, (err, result) => {
        if (err) res.send(err);
        console.log(result);
        res.send(result);
    });
})

app.post("/API/users/register", (req, res) => {
    const Nombre = req.body.Nombre;
    const ApePri = req.body.ApePri;
    const ApeSec = req.body.ApeSec;
    const Rut = req.body.Rut;
    const FechaNacimiento = req.body.FechaNacimiento;
    const Telefono = req.body.Telefono;
    const Email = req.body.Email;
    const Contrasena = req.body.Password;

    console.log(Nombre, ApePri, ApeSec, Rut, FechaNacimiento, Telefono, Email, Contrasena);

    const SaltGenerator = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    const Salt = SaltGenerator(20);
    console.log(Salt);
    const SaltedPassword = Salt + Contrasena;
    console.log(SaltedPassword);

    const regQuery = `insert into usuario values (?,?,?,?,?,?,?,?,sha2('${SaltedPassword}', 256))`;
    console.log(regQuery)
    LinkDB.query(regQuery, [Nombre, ApePri, ApeSec, Rut, FechaNacimiento, Telefono, Email, Salt], (err, result) => {
        if (err) res.send(err);
        console.log(result);
        res.send(result);
    });
});

app.get("/API/users/addresses", (req, res) => {
    const Rut = req.query.Rut;
    console.log(Rut);

    const logQuery = "select * from addresses where User = ?";
    LinkDB.query(logQuery, Rut, (err, result) => {
        if (err) res.send(err);
        console.log(result);
        res.send(result);
    });
})

app.listen(3100, () => {
    console.log("Listening on port 3100")
})