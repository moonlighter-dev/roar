module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs", { user: req.user });
  },

  // getMenu: (req, res) => {
  //   res.render("menu.ejs", { user: req.user });
  // },
};
