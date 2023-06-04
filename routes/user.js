const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const router = express.Router();
const SALT_ROUNDS = 10;

//user registration
router.post("/register", (req ,res) => {
    const {first_name, last_name, email, country, password} = req.body;

    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if(err) res.status(500).json({error: true, msg: err.message});
        else {
            const sql = `insert into master_users (first_name, last_name, email, country, password) 
            values('${first_name}', '${last_name}', '${email}', '${country}', '${hash}')`;

            db.query(sql, (err, rows) => {
                if(err) {
                    if(err.message.includes("Duplicate entry")) {
                        res.status(200).json({
                            code: 409,
                            error: true,
                            msg: "Email is already exist"
                        });
                    }
                }
                else {
                    res.status(200).json({
                        code: 200,
                        error: false,
                        msg: "OK"
                    });
                }
            });
        }
    });
});


//user login
router.post("/login", (req, res) => {
    const {username, password} = req.body;
    
    const sql = `select * from master_users where email='${username}' and active = 1`;
    
    db.query(sql, (err, row) => {
        if(err) res.status(500).json({error: true, msg: err.message});
        else {
            if(row.length == 0) {
                res.status(200).json({
                    code: 404,
                    error: true,
                    msg: "Either email is wrong or does not exist"
                });
            } else {
                bcrypt.compare(password, row[0]["password"], (err, isSame) => {
                    if(err) res.status(500).json({error: true, msg: err.message});
                    else {
                        res.status(200).json({
                            code: isSame ? 200 : 401,
                            error: !isSame,
                            msg: isSame ? "OK" : "Password Mismatched",
                            results: isSame ? row : []
                        });
                    }
                });
            }
        }
    });
});

//reset user password
router.post("/editUserPass", (req, res) => {
    const {newPassword, oldPassword, userId} = req.body;
    const sql = `select * from master_users where user_id=${userId}`;

    db.query(sql, (err, rows) => {
        if(err) res.status(200).json({error: true, msg: err.message});
        bcrypt.compare(oldPassword, rows[0]["password"], async(err, isSame) => {
            if(err) res.status(200).json({error: true, msg: err.message});
            else {
                if(isSame) {
                    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
                    const sql2 = `update master_users set password='${hashedPassword}' where user_id=${userId}`;
                    
                    db.query(sql2, (err, rows) => {
                        if(err) res.status(500).json({ error: true, msg: err });
                        else res.status(200).json({ error: false, msg: "Password Updated Successfully!" });                    
                    });
                } else res.status(200).json({error: true, msg: "Old password is wrong"});
            }
        })
    });
});

//edit a particular user
router.patch("/editUser", (req, res) => {
    const {sqlString, userId} = req.body;
    const sql = `update master_users set ${sqlString} where user_id=${userId}`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "Successfully Updated!" });
    });
});


module.exports = router;
