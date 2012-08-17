// save.js

Date.prototype.shortdate = function(){
  return this.getMonth()
         + "-" +  this.getDate()
         + "-" +  this.getFullYear();
}

Date.prototype.shorttime = function(){
  return this.getHours()
         + ":" +  this.getMinutes()
         + ":" +  this.getSeconds();
}

Date.prototype.shortdatetime = function () {
  return this.shortdate() + ' ' + this.shorttime();
}

var Stash = function (key) {
  this.key = key;
  this.files = {};
}

Stash.prototype.save = function (name, data) {
  try {
  	var entry = {'date': new Date(), 'data': data }
      , saved = false
    ;
  	if (name in this.files) {
      if (this.files[name][this.files[name].length - 1].data !== data) {
  	    this.files[name].push(entry);
        saved = true;
        console.log('saved "' + name + '"" (' + data.length + 'b) at ' + entry.date.shortdatetime());
      } else {
        console.log('no change to ' + name);
      }
  	} else {
  	  this.files[name] = [entry];
      saved = true;
  	}
  	localStorage.setItem(this.key, JSON.stringify(this.files));
    return saved;
  } catch (e) {
  	localStorage.setItem(this.key, JSON.stringify({}));
  }
}

Stash.prototype.del_rev = function (name, rev) {
  var file = this.files[name]
    , deleted = false
  ;
  if (file) {
    if (rev < 0) {
      rev = file.length - rev;
    }
    if (file.length > 1 && rev >= 0 && rev < file.length) {
      file.splice(rev, 1);
      deleted = true;
    }
  }
  localStorage.setItem(this.key, JSON.stringify(this.files));
  return deleted;
}

Stash.prototype.load = function () {
  this.files = JSON.parse(localStorage.getItem(this.key));
  if (this.files === null || typeof this.files !== 'object') {
  	this.files = { basic: [ { date: new Date("2012-08-14T00:00:00.000Z"),
                              data: "r = g = b = (noise(x / 100, y / 100, 0) + 1) * 128;" }
                          ]
                 };
  } else {
    // process dates
    for (var name in this.files) {
      var entry = this.files[name];
      for (i = 0, ilen = entry.length; i < ilen; ++i) {
        entry[i].date = new Date(entry[i].date);
      }
    }
  }
}

Stash.prototype.get = function (name) {
  var file = this.files[name];
  if (file) {
  	return file[file.length - 1];
  } else {
  	return file;
  }
}

Stash.prototype.get_rev = function (name, rev) {
  var file = this.files[name];
  if (file) {
    if (rev < 0) {
      rev = file.length - rev;
    }
    return file[rev];
  } else {
    return file;
  }
}

Stash.prototype.get_revs = function (name) {
  return this.files[name];
}