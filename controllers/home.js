module.exports = {
  getIndex: (req, res) => {
    console.log(req.params)
    res.render("index.ejs", { 
      user: req.user,
      page: "index",
    });
  },

};
