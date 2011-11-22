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
    }
    return true;
  }
  
  function isDelimiter(c) {
    var delims = ' ()";\n';
    if (delims.indexOf(c) >= 0 || c === undefined) {
      return true;
    }
    return false;
  }
  
  function isInitial(c) {
    var symbols = "-+*/><=?!&"
    if (/^[a-zA-Z]$/.test(c) || (symbols.indexOf(c) >= 0)) {
      return true;
    }
    return false;
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
  
  function readCharacter() {
    var c = getc();
    if (c === 'n') {
      if (source.substring(position, position+7) === 'ewline') {
        return '\n';
      } else if (isDelimiter(peek())) {
        return 'n';
      } else {
        return "Error character does not match."
      }
    }
    else if (c === 's') {
      if (source.substring(position, position+4) === 'pace') {
        return ' ';
      } else if (isDelimiter(peek())) {
        return 's';
      } else {
        return "Error character does not match."
      }
    }
    else {
      return c;
    }
  }
  
  function readSymbol() {
    var s = "",
        c = getc();
    while (!isDelimiter(c)) {
      s = s + c;
      c = getc();
    }
    return s;
  }
  
  function readString() {
    var s = "",
        c = getc();
    while (c !== '"') {
      s = s + c;
      c = getc();
    }
    return s;
  }
  
  function read() {
    remove_whitespace();
    c = getc();
    if (c) {
      // Numbers
      if ( isNumeric(c) || (c === '-' && isNumeric(peek())) ) {
        ungetc();
        return readNumber();
      }
      // Booleans and Characters
      else if ( c === '#' ) {
        c = getc();
        if ( c === 't') {
          return true;
        }
        else if ( c === 'f' ) {
          return false;
        }
        else if ( c === '\\' ) {
          return readCharacter();
        }
        else {
          return "Error: boolean value must be either #t or #f; not #"+c;
        }
      }
      // Symbols
      else if ( isInitial(c) ) {
        ungetc();
        return readSymbol();
      }
      // Strings
      else if ( c === '"' ) {
        return readString();
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
  
  // Booleans
  st("#t", true);
  st("#f", false);
  st("#c", "Error: boolean value must be either #t or #f; not #c");

  // Characters
  st("#\\c", 'c');
  st("#\\newline", "\n");
  st("#\\space", " ");
  
  // Symbols
  st("hello", "hello");
  
  // Strings
  st('"I am string"', "I am string");
  
  
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
