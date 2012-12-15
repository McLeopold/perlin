
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Perlin' })
};

exports.share = function(req, res){
  console.log(req);
  res.send('woot!');
}