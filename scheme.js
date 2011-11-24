//___________________________________________________________________________//
// Character tests (isNumeric, isDelimiter, isInitial)
//___________________________________________________________________________//

function Symbol(data) {
  this.data = data;
}

function Pair(car, cdr) {
  this.car = car;
  this.cdr = cdr;
}

function TheEmptyList() {}
var the_empty_list = new TheEmptyList();



//___________________________________________________________________________//
// read
//___________________________________________________________________________//

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
      return the_empty_list;
    }
    ungetc();
    car = readExpr();
    removeWhitespace();
    cdr = readPair();
    return new Pair(car, cdr);
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
        return new Symbol(readSymbol());
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

var globalEnvironment = { 'hello':"world", 'bye':"everybody" },
    specialForms = {};

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
  else if (expr instanceof Symbol) {
    var v = lookupSymbolValue(expr.data);
    return v;
  }
  else if (expr instanceof TheEmptyList) {
    return the_empty_list;
  }
  else if (expr instanceof Pair) {
    var s = (expr.car instanceof Symbol) ? expr.car.data : scheme_eval(expr.car);
    
    if (s in specialForms) {
      return specialForms[s](expr.cdr);
    }
    else {
      return "Special form not found";
    }
  }
  else {
    return "Eval - Not implemented";
  }
}



//___________________________________________________________________________//
// Special Forms
//___________________________________________________________________________//

specialForms['scheme-syntax'] = function (expr) {
  var s = (expr.car instanceof Symbol) ? expr.car.data : scheme_eval(expr.car);
  specialForms[s] = eval(expr.cdr.car);
  return null;
}

specialForms['define'] = function (expr) {
  var s = (expr.car instanceof Symbol) ? expr.car.data : scheme_eval(expr.car);
  setSymbolValue(s, scheme_eval(expr.cdr.car));
  return null;
}
/* // Defined in the scheme_eval test below
specialForms['if'] = function (expr) {
  var p = scheme_eval(expr.car);
  if (p) {
    return scheme_eval(expr.cdr.car);
  }
  else {
    return scheme_eval(expr.cdr.cdr.car);
  }
}
*/


//___________________________________________________________________________//
// Print
//___________________________________________________________________________//

function printPair(expr) {
  var s = "";
  while (!(expr instanceof TheEmptyList)) {
    s = s + print(expr.car) + ' ';
    expr = expr.cdr;
  }
  s = s + print(expr.car);
  return s;
}

function print(expr) {
  var type = typeof expr;
  if (expr === null) {
    type = null;
  }
  else if (type === 'object') {
    type = expr.type;
  }
  
  if (type === "number" || type === "boolean" || type === "string") {
    return expr;
  }
  else if (expr instanceof Symbol) {
    return expr.data;
  }
  else if (expr instanceof TheEmptyList) {
    return "()";
  }
  else if (expr instanceof Pair) {
    return "("+printPair(expr)+")";
  }
  else if (type === null) {
    return "";
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
    if (ret_val instanceof Symbol) {
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
  
  // Lists
  st("()", the_empty_list);
  
})();


//Test eval
(function () {
  "use strict";
  function st(test, expected) {
    var ret_val = scheme_eval(read(test)),
        ret_type = (ret_val === null) ? null : ret_val.type;
    if (ret_val instanceof Symbol) {
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
  
  // define
  st("(define a 5)", null);
  st("a", 5);
  
  // scheme-syntax (if p c a) -> returns null and defines if for the if tests below
  st(['(scheme-syntax if "function (expr) {',
      '  var p = scheme_eval(expr.car);',
      '  if (p) {',
      '    return scheme_eval(expr.cdr.car);',
      '  }',
      '  else {',
      '    return scheme_eval(expr.cdr.cdr.car);',
      '  }',
      '}")'].join(""), null);
  
  // if
  st("(if 1 1 2)", 1);
  st("(if #f 1 2)", 2);
  
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
