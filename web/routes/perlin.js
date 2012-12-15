var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('perlin', server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'perlin' database");
        db.collection('perlin', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'perlin' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving perlin: ' + id);
    db.collection('perlin', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};
 
exports.findAll = function(req, res) {
    db.collection('perlin', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};
 
exports.addPerlin = function(req, res) {
    var perlin = req.body;
    console.log('Adding perlin: ' + JSON.stringify(perlin));
    db.collection('perlin', function(err, collection) {
        collection.insert(perlin, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}
 
exports.updatePerlin = function(req, res) {
    var id = req.params.id;
    var perlin = req.body;
    console.log('Updating perlin: ' + id);
    console.log(JSON.stringify(perlin));
    db.collection('perlin', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, perlin, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating perlin: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(perlin);
            }
        });
    });
}
 
exports.deletePerlin = function(req, res) {
    var id = req.params.id;
    console.log('Deleting perlin: ' + id);
    db.collection('perlin', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
 
