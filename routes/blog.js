const express = require("express");
const upload = require("../config/multerImg");
const db = require("../config/db");
const router = express.Router();


//insert blog content along with blog image -| OR |- update the inserted data
router.post("/uploadBlog", upload("blog").single("blogImg"), (req, res) => {
    let sql = "";
    const filename = req.file.filename;
    const userData = JSON.parse(req.body.userData);
    const isForUpdate = userData.blogId ? true : false;

    if(!isForUpdate) {
        sql = `Insert into master_blogs (title, sub_heading, author, category, blog_image, content) 
        values ('${userData?.blogTitle}', '${userData?.blogSubHead}', ${userData?.userId}, ${userData?.category}, 
        '${filename}', '${userData?.blogBody}')`;
    } else {
        sql = `update master_blogs set title='${userData?.blogTitle}', sub_heading='${userData?.blogSubHead}', 
        category='${userData?.category}', blog_image='${userData?.filename}', content='${userData?.blogBody}' 
        where blog_id = '${userData?.blogId}'`;
    }

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else  res.status(201).json({ error: false, msg: `successfully ${isForUpdate?'inserted':'updated'}` });
    });
});

//edit blog data but withoud updating image file
router.post("/updateBlogDetails", (req, res) => {
    const userData = req.body;
    sql = `update master_blogs set title='${userData?.blogTitle}', sub_heading='${userData?.blogSubHead}', 
    category='${userData?.category}', content='${userData?.blogBody}' where blog_id = '${userData?.blogId}'`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else  res.status(201).json({ error: false, msg: "successfully updated" });
    });
});


//get all blog category
router.get("/getAllCats", (req, res) => {
    const sql = "select * from master_category where active=1";
    
    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "OK", result: rows });
    });
});

//get all blogs irrespective of user
router.get("/getAllBlogs", (req, res) => {
    const sql = `select blog_id, title, author, category, blog_image, transaction_date, sub_heading,
    (select concat(first_name, ' ', last_name) from master_users where user_id=blogTable.author) as username,
    (select category from master_category where catId=blogTable.category) as catName
    from master_blogs as blogTable where active=1 order by transaction_date;`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "OK", result: rows });
    });
});

//get all user's blogs content relevent to a specific user
router.get("/getAllUserBlogs", (req, res) => {
    const userId = req.query.userId;
    const sql = `select blog_id, title, blog_image, content, sub_heading, category,
    (select concat(first_name, ' ', last_name) from master_users where user_id=blogTable.author) as username,
    (select category from master_category where catId=blogTable.category) as categoryName,
    transaction_date, active from master_blogs as blogTable where author=${userId}`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "OK", result: rows });
    });
});

//get single blog of any user
router.get("/getSingleBlog", (req, res) => {
    const { blogId } = req.query;
    const sql = `select blog_id, title, blog_image, content, category, sub_heading,
    (select concat(first_name, ' ', last_name) from master_users where user_id=blogTable.author) as username,
    (select category from master_category where catId=blogTable.category) as categoryName,
    transaction_date, active from master_blogs as blogTable where blog_id=${blogId} 
    and active=1`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "OK", result: rows });
    });
});

//get all blogs related to particular category Id
router.get("/getCategoryBlogs", (req, res) => {
    const { catId } = req.query;
    const sql = `select blog_id, title, blog_image, content, category, sub_heading,
    (select concat(first_name, ' ', last_name) from master_users where user_id=blogTable.author) as username,
    (select category from master_category where catId=blogTable.category) as categoryName,
    transaction_date, active from master_blogs as blogTable where category=${catId} limit 20`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({error: false, msg: "OK", result: rows});
    });
});


//disable a particular blog
router.patch("/disableToggleBlog", (req, res) => {
    const {boolFlag, blogId} = req.body;
    const sql = `Update master_blogs set active = ${boolFlag} where blog_id = ${blogId}`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "successfully updated" });
    });
});

//delete a particular blog
router.delete("/delSingleBlog", (req, res) => {
    const {blogId} = req.query;
    const sql = `delete from master_blogs where blog_id = ${blogId}`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "successfully deleted" });        
    });
});


//editor image uploader
router.post("/editorImageUploader", upload("editor").single("upload"), (req, res) => {
    const filePath = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    res.status(200).json({url: filePath});
});


//search blogs related query 
router.get("/searchBlogs", (req, res) => {
    const { query } = req.query;
    const sql = `select blog_id, title, blog_image, content, category, sub_heading,
    (select concat(first_name, ' ', last_name) from master_users where user_id=blogTable.author) as username,
    (select category from master_category where catId=blogTable.category) as categoryName,
    transaction_date, active from master_blogs as blogTable where sub_heading like '%${query}%' 
    and active=1`;

    db.query(sql, (err, rows) => {
        if(err) res.status(500).json({ error: true, msg: err.message });
        else res.status(200).json({ error: false, msg: "OK", result: rows });        
    });
});

module.exports = router;
