function read(source) {
  var position = 0;
  
  //_________________________________________________________________________//
  // Source reading (getc, ungetc, peek and removeWhitespace)
  //_________________________________________________________________________//
  
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
  
  function removeWhitespace() {
    while (source[position] === ' ') {
      position += 1;
    }
  }
  
  
  
  //_________________________________________________________________________//
  // Character tests (isNumeric, isDelimiter, isInitial)
  //_________________________________________________________________________//
  
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
  
  
  
  //_________________________________________________________________________//
  // Read functions
  //_________________________________________________________________________//
    
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
    removeWhitespace();
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
        return { 'type': 'symbol', 'data': readSymbol() };
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



//___________________________________________________________________________//
// Environments
//___________________________________________________________________________//

var globalEnvironment = { 'hello':"world", 'bye':"everybody" };

function lookupSymbolValue(sym) {
  return globalEnvironment[sym];
}



//___________________________________________________________________________//
// Eval
//___________________________________________________________________________//



function scheme_eval(expr) {
  var type = typeof expr;
  if (type === 'object') { type = expr.type }
  
  if (type === "number" || type === "boolean" || type === "string") {
    return expr;
  }
  else if (type === "symbol") {
    var v = lookupSymbolValue(expr.data);
    return v;
  }
  else {
    return "Eval - Not implemented"
  }
}



//___________________________________________________________________________//
// Print
//___________________________________________________________________________//



function print(expr) {
  var type = typeof expr;
  if (type === 'object') { type = expr.type }
  
  if (type === "number" || type === "boolean" || type === "string" || type === "symbol") {
    return expr;
  }
  else {
    return "Eval - Not implemented"
  }
}





//___________________________________________________________________________//
// Tests
//___________________________________________________________________________//

// Test read
(function () {
  function st(test, expected) {
    var ret_val = read(test),
        ret_type = ret_val.type;
    if (ret_type === "symbol") {
      ret_val = ret_val.data;
    }
    if (ret_val !== expected) {
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


//Test eval
(function () {
  function st(test, expected) {
    var ret_val = scheme_eval(read(test)),
        ret_type = ret_val.type;
     if (ret_type === "symbol") {
       ret_val = ret_val.data;
     }
    if (ret_val !== expected) {
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
  st("hello", "world");
  st("bye", "everybody");
  
  // Strings
  st('"I am string"', "I am string");
  
})();


//___________________________________________________________________________//
// REPL
//___________________________________________________________________________//

// A simple and very limited repl
$(document).ready(function () {
  $("#run").click(function () {
    var source = $("#entry").val(),
        output = print(scheme_eval(read(source))),
        output_text = "> "+source+"\n"+output
    $("#output").val(output_text);
    $("#entry").val("");
  });
});
