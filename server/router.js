const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // Account/Auth routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/getUsername', mid.requiresLogin, controllers.Account.getUsername);

  // Collection routes
  app.get('/maker', mid.requiresLogin, controllers.Collection.makerPage);
  app.post('/createCollection', mid.requiresLogin, controllers.Collection.createCollection);
  app.get('/getCollections', mid.requiresLogin, controllers.Collection.getCollections);
  app.delete('/deleteCollection', mid.requiresLogin, controllers.Collection.deleteCollection);
  app.put('/editCollection', mid.requiresLogin, controllers.Collection.editCollection); // ✏️ NEW

  // Song routes
  app.post('/createSong', mid.requiresLogin, controllers.Song.createSong);
  app.get('/getSongs', mid.requiresLogin, controllers.Song.getSongsForCollection);
  app.delete('/deleteSong', mid.requiresLogin, controllers.Song.deleteSong);
  app.put('/editSong', mid.requiresLogin, controllers.Song.editSong);

  // Default route
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
