getJasmineRequireObj().StackTraceParser = function(j$) {
  function StackTraceParser() {
    this.parse = function(rawTrace) {
      var lines = rawTrace
        .split('\n')
        .filter(function(line) { return line !== ''; });

      // Some platforms include the error message in the stack trace. Remove it.
      if (lines[0].match(/^Error/)) {
        lines = lines.slice(1);
      }
      return tryParseFrames(lines) || null;
    };
  }

  var framePatterns = [
    // PhantomJS on Linux, Node, Chrome, IE, Edge
    // e.g. "   at QueueRunner.run (http://localhost:8888/__jasmine__/jasmine.js:4320:20)"
    // Note that the "function name" can include a surprisingly large set of
    // characters, including angle brackets and square brackets.
    { re: /^\s*at ([^\)]+) \(([^\)]+)\)$/, fnIx: 1, fileLineColIx: 2 },

    // NodeJS alternate form, often mixed in with the Chrome style
    // e.g. "  at /some/path:4320:20
    { re: /\s*at (.+)$/, fileLineColIx: 1 },

    // PhantomJS on OS X, Safari, Firefox
    // e.g. "run@http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    // or "http://localhost:8888/__jasmine__/jasmine.js:4320:27"
    { re: /^(([^@\s]+)@)?([^\s]+)$/, fnIx: 2, fileLineColIx: 3 }
  ];

  // regexes should capture the function name (if any) as group 1
  // and the file, line, and column as group 2.
  function tryParseFrames(lines) {
    var converted = lines.map(function(line) {
      return first(framePatterns, function(pattern) {
        var overallMatch = line.match(pattern.re),
          fileLineColMatch;
        if (!overallMatch) { return null; }

        fileLineColMatch = overallMatch[pattern.fileLineColIx].match(
          /^(.*):(\d+):\d+$/);
        if (!fileLineColMatch) { return null; }

        return {
          file: fileLineColMatch[1],
          line: parseInt(fileLineColMatch[2], 10),
          func: overallMatch[pattern.fnIx]
        };
      });
    });

    return converted.indexOf(undefined) === -1 ? converted : null;
  }

  function first(items, fn) {
    var i, result;

    for (i = 0; i < items.length; i++) {
      result = fn(items[i]);

      if (result) {
        return result;
      }
    }
  }
  
  return StackTraceParser;
};