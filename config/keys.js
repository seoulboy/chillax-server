module.exports = {
  mongoURI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-jrmsh.mongodb.net/pjj?retryWrites=true&w=majority`,
};

/* 
TODO:
- get mongo URI after creating a database
- set up 
*/