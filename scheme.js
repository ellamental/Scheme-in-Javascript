function read(source) {
  "use strict";
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
    var symbols = "-+*/><=?!&";
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
    ungetc();
    return Number(s);
  }
  
  function readCharacter() {
    var c = getc();
    if (c === 'n') {
      if (source.substring(position, position+7) === 'ewline') {
        position += 7;
        return '\n';
      } else if (isDelimiter(peek())) {
        return 'n';
      } else {
        return "Error character does not match.";
      }
    }
    else if (c === 's') {
      if (source.substring(position, position+4) === 'pace') {
        position += 4;
        return ' ';
      } else if (isDelimiter(peek())) {
        return 's';
      } else {
        return "Error character does not match.";
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
    ungetc();
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
  
  
  
  //_________________________________________________________________________//
  // readExpr and readPair
  //_________________________________________________________________________//
  
  function readPair() {
    removeWhitespace();
    var c = getc(),
        car, cdr;
    if (c === ')') {
      return { 'type': "the_empty_list" };
    }
    ungetc();
    car = readExpr();
    removeWhitespace();
    cdr = readPair();
    return { 'type': "pair", 'car': car, 'cdr': cdr };
  }
  
  
  function readExpr() {
    removeWhitespace();
    var c = getc();
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
      // Read Pair
      else if ( c === '(' ) {
        return readPair();
      }
      // Not Implemented
      else {
        return "Reader - Not implemented";
      }
    }
    else {
      return "Not implemented";
    }
  }
  
  return readExpr();
}



//___________________________________________________________________________//
// Environments
//___________________________________________________________________________//

var globalEnvironment = { 'hello':"world", 'bye':"everybody" };

function lookupSymbolValue(sym) {
  return globalEnvironment[sym];
}

function setSymbolValue(sym, val) {
  globalEnvironment[sym] = val;
}



//___________________________________________________________________________//
// Eval
//___________________________________________________________________________//

function scheme_eval(expr) {
  var type = typeof expr;
  if (type === 'object') { type = expr.type; }
  
  if (type === "number" || type === "boolean" || type === "string") {
    return expr;
  }
  else if (type === "symbol") {
    var v = lookupSymbolValue(expr.data);
    return v;
  }
  else if (type === "the_empty_list") {
    return { 'type': "the_empty_list" };
  }
  else if (type === "pair") {
    var s = (expr.car.type === "symbol") ? expr.car.data : scheme_eval(expr.car);
    if (s === "define") {
      var sym = expr.cdr.car.data,
          val = scheme_eval(expr.cdr.cdr.car);
      setSymbolValue(sym, val);
      return "value set!";
    }
    else {
      return "symbol not found";
    }
  }
  else {
    return "Eval - Not implemented";
  }
}



//___________________________________________________________________________//
// Print
//___________________________________________________________________________//

function printPair(expr) {
  var s = "";
  while (expr.cdr.type !== "the_empty_list") {
    s = s + print(expr.car) + ' ';
    expr = expr.cdr;
  }
  s = s + print(expr.car);
  return s;
}

function print(expr) {
  var type = typeof expr;
  if (type === 'object') { type = expr.type; }
  
  if (type === "number" || type === "boolean" || type === "string") {
    return expr;
  }
  else if (type === "symbol") {
    return expr.data;
  }
  else if (type === "the_empty_list") {
    return "()";
  }
  else if (type === "pair") {
    return "("+printPair(expr)+")";
  }
  else {
    return "Eval - Not implemented";
  }
}



//___________________________________________________________________________//
// Tests
//___________________________________________________________________________//

// Test read
(function () {
  "use strict";
  function st(test, expected) {
    var ret_val = read(test),
        ret_type = ret_val.type;
    if (ret_type === "symbol") {
      ret_val = ret_val.data;
    }
    else if (ret_type === "the_empty_list") {
      ret_val = ret_val.type;
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
  
  // Lists
  st("()", "the_empty_list");
  
})();


//Test eval
(function () {
  "use strict";
  function st(test, expected) {
    var ret_val = scheme_eval(read(test)),
        ret_type = ret_val.type;
     if (ret_type === "symbol") {
       ret_val = ret_val.data;
     }
    else if (ret_type === "the_empty_list") {
      ret_val = ret_val.type;
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
  "use strict";
  $("#run").click(function () {
    var source = $("#entry").val(),
        output = print(scheme_eval(read(source))),
        output_text = "> "+source+"\n"+output;
    $("#output").val(output_text);
    $("#entry").val("");
  });
});
