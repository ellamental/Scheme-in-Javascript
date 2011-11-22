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
    var numerics = ".0123456789";
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
    if (c === '-') {
      s = "-";
      c = getc();
    }
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
      if ( isNumeric(c) || (c === '-' && isNumeric(peek())) ) {
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

(function () {
  function st(test, expected) {
    if (scheme(test) !== expected) {
      console.log("test failed: "+test);
    }
  }
  
  // Numbers
  st("42", 42);
  st("  36", 36);
  st(" 24 ", 24);
  st(".53", .53);
  st("2.45", 2.45);
  st("-24", -24);
  st("-.42", -.42);

})();


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
