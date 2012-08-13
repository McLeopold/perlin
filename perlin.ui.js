$(function () {
  var perlin = new Perlin();
  var canvas = $('#myCanvas');
  var code = $('#code');
  var name = $('#name');
  var mp = $('#mp');
  var viewer = new Viewer(canvas[0], code[0], perlin, mp);
  var save = new Stash('perlin');
  var file_list = $('#file_list');
  var rev_list = $('#rev_list');
  var current_file;
  var current_rev;
  save.load();
  load_file_list();
  load_file('basic');
  canvas.mousemove(handleMousemove);
  $('#execute').click(function () {
    save_show();
    viewer.doPixelLoop();
  });
  $('#in').click(function () {
    save_show();
    viewer.view_in()
  });
  $('#out').click(function () {
    save_show();
    viewer.view_out();
  });
  $('#up').click(function () {
    save_show();
    viewer.view_up();
  });
  $('#down').click(function () {
    save_show();
    viewer.view_down();
  });
  $('#left').click(function () {
    save_show();
    viewer.view_left();
  });
  $('#right').click(function () {
    save_show();
    viewer.view_right();
  });
  $('#reset').click(function () {
    save_show();
    viewer.view_reset();
  });
  $('#erase').click(function () {
    save_show();
    viewer.clear();
  });
  $('#test').click(function () {
    var start = new Date().getTime();
    var x, y;
    for (x = 0; x < 200; ++x) {
      for (y = 0; y < 200; ++y) {
        perlin.noise(x, y, 0);
      }
    }
    var end = new Date().getTime();
    console.log("Time: " + (end - start));
  });
  $('#save').click(function () {
    save_show();
  });
  $('#del_file').click(delete_file);
  $('#del_rev').click(delete_rev);

  file_list.change(function () {
    save_file();
    load_file(file_list.val());
  });
  rev_list.change(function (evt) {
    var n = file_list.val()
      , rev = rev_list.val()
    ;
    save_file();
    load_rev(n, rev);
  });
  function save_show() {
    if (save_file()) {
      var n = name.val()
        , rev = save.get_revs(n).length - 1
      ;
      current_file = save.get(name.val());
      current_rev = current_file;
      if (file_list.val() !== n) {
        file_list.val(n);
      }
      if (rev_list.val() !== rev) {
        rev_list.val(rev);
      }
    }
  }
  function save_file() {
    if (current_file === current_rev) {
      var update = !(name.val() in save.files);
      if (save.save(name.val(), code.val())) {
        if (update) {
          console.log('new file "' + name.val() + '"');
          load_file_list();
        } else {
          load_rev_list(name.val());
          current_file = save.get(name.val());
        }
        return true;
      }
    } else {
      console.log('not on current');
    }
  }
  function delete_file() {
    
  }
  function delete_rev() {
    var n = file_list.val()
      , rev = rev_list.val()
    ;
    if (save.del_rev(n, rev)) {
      load_file(n);
    }
  }
  function load_file(n) {
    var file = save.get(n);
    if (file) {
      current_file = file;
      current_rev = file;
      name.val(n);
      code.val(current_file.data);
      $('#date').html(current_file.date.shortdatetime());
      if (file_list.val() !== n) {
        file_list.val(n);
      }
      load_rev_list(n);
      var rev = save.get_revs(n).length - 1;
      if (rev_list.val() !== rev) {
        rev_list.val(rev);
      }
    }
  }
  function load_rev(n, rev) {
    var file = save.get_rev(n, rev);
    if (file) {
      current_rev = file;
      name.val(n);
      code.val(file.data);
      $('#date').html(file.date.shortdatetime());
      if (file_list.val() !== n) {
        file_list.val(n);
      }
      if (rev_list.val() !== rev) {
        rev_list.val(rev);
      }
    }
  }  
  function load_file_list () {
    file_list.empty();
    $.each(save.files, function (key, value) {
      file_list.append(
        $('<option></option>')
          .attr("value", key)
          .text(key)
      );
    });
  }
  function load_rev_list(n) {
    rev_list.empty();
    $.each(save.get_revs(n), function (key, value) {
      rev_list.prepend(
        $('<option></option>')
          .attr("value", key)
          .text(value.date.shortdatetime())
      );
    });
  }
  function handleMousemove (ev) {
    var x, y;

    // Get the mouse position relative to the canvas element.
    if (ev.layerX || ev.layerX == 0) { // Firefox
      x = ev.layerX;
      y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      x = ev.offsetX;
      y = ev.offsetY;
    }
    document.getElementById("myCanvas").title = x + ", " + y;   
  }
  function open_png() {
    window.open(canvas[0].toDataURL('image/png'))    
  }
});
