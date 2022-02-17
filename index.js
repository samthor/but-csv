
const C_COMMA = 44;
const C_NEWLINE = 10;
const C_QUOTE = 34;

/**
 * @param {string} source
 * @return {string[][]}
 */
export const parse = (source) => {
  return [...iter(source)];
}

/**
 * @param {string} source
 */
export function *iter(source) {
  let i = 0;
  const c = () => source.charCodeAt(i);

  let newline = -1;

  let length = source.length;

  /** @type {string[]} */
  let row = [];

  /** @type {string} */
  let s;
  /** @type {number} */
  let char;
  /** @type {number} */
  let index;

  for (;;) {
    // we consume at most one col per outer loop
    if (c() == C_NEWLINE) {
      yield row;
      row = [];
      ++i;
    }

    if (i >= length) {
      break;
    }

    if (i > newline) {
      newline = source.indexOf('\n', i);
      if (newline < 0) {
        newline = length;
      }
    }

    char = c();
    if (char == C_QUOTE) {
      s = '';
      // consume many parts of quoted string
      for (; ;) {
        index = source.indexOf('"', i + 1);
        if (index < 0) {
          index = length;
        }
        s += source.substring(i + 1, index);

        i = index + 1;
        if (i >= length) {
          break;  // end of input
        }
        char = c();
        if (char == C_COMMA || char == C_NEWLINE) {
          break;  // end of string
        } else if (char != C_QUOTE) {
          --i;  // allow missing double quote _anyway_
        }
        s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
      index = source.indexOf(',', i);
      if (index < 0 || newline < index) {
        index = newline;
      }

      s = source.substring(i, index);
      i = index;
    }

    row.push(s);

    // look for ,
    if (c() == C_COMMA) {
      ++i;
    }
  }

  yield row;
}


const needsQuoteRegexp = /[\"\n,]/;
const globalQuote = /"/g;


/**
 * @param {string} raw
 */
const r = (raw) => {
  if (!needsQuoteRegexp.test(raw)) {
    return raw;
  }
  return `"${raw.replace(globalQuote, '""')}"`;
};


/**
 * @param {string[][]} raw
 */
export const build = (raw) => {
  return raw.map((row) => row.map(r).join(',')).join('\n');
}
