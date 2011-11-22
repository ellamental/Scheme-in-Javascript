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
  
  function isNumeric(c) {
    var numerics = "-.0123456789";
    if (numerics.indexOf(c) < 0) {
      return false;
    } else {
      return true;
    }
  }
  
  function isDelimiter(c) {
    var delims = ' ()";\n';
    if (delims.indexOf(c) >= 0 || c === undefined) {
      return true;
    } else {
      return false;
    }
  }
  
  function readNumber() {
    var s = "",
        c = getc();
    while (!isDelimiter(c) && isNumeric(c)) {
      s = s + c;
      c = getc();
    }
    return Number(s);
  }
  
  function read() {
    remove_whitespace();
    c = getc();
    if (c) {
      if (isNumeric(c)) {
        ungetc();
        return readNumber();
      }
      else {
        return "Reader - Not implemented";
      }
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
