module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },

  getMenu: (req, res) => {
    res.render("menu.ejs", { user: req.user });
  },
};
