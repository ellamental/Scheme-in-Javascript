function scheme(source) {
  var position = 0;
  
  function getc() {
    var c = source[position];
    position += 1;
    return c;
  }
  
  function ungetc() {
    position -= 1;
  }
  
  function peek() {
    return source[position+1];
  }
  
  function remove_whitespace() {
    while (source[position] === ' ') {
      position += 1;
    }
  }
  
  function read() {
    remove_whitespace();
    c = getc();
    if (c) {
      return "Representation of a Scheme type";
    }
    else {
      return "Not implemented";
    }
  }
  
  return read();
}


// A simple and very limited repl
$(document).ready(function () {
  $("#run").click(function () {
    var source = $("#entry").val(),
        output = scheme(source),
        output_text = "> "+source+"\n"+output
    $("#output").val(output_text);
    $("#entry").val("");
  });
});
