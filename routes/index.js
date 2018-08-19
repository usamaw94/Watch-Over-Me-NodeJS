const express = require('express');
const router = express.Router();

router.get("/", function(req, res){
    res.render("index", { title: 'Express', data : 'some text' });
})

module.exports = router;