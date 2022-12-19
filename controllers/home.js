module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },

  getMenu: async (req, res) => {
    res.render("menu.ejs");
  },
};
