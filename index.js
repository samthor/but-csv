
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
  let newline = -1;

  /**
   * @param {number} arg
   * @return {number}
   */
  const convertToLength = (arg) => arg === -1 ? source.length : arg;

  /** @type {string[]} */
  const row = [];

  while (i < source.length) {
    // we consume at most one col per outer loop
    let s = '';

    if (i > newline) {
      newline = convertToLength(source.indexOf('\n', i));
    }

    const start = source.charCodeAt(i);
    if (start === C_NEWLINE) {
      yield row.splice(0, row.length);
      ++i;
      continue;

    } else if (start === C_QUOTE) {
      // consume many parts of quoted string
      for (; ;) {
        const next = convertToLength(source.indexOf('"', i + 1));
        s += source.substring(i + 1, next);

        i = next + 1;
        if (i >= source.length) {
          break;  // end of input
        }
        const check = source.charCodeAt(i);
        if (check === C_COMMA || check === C_NEWLINE) {
          break;  // end of string
        } else if (check !== C_QUOTE) {
          --i;  // allow missing double quote _anyway_
        }
        s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
      let to = convertToLength(source.indexOf(',', i));
      if (newline < to) {
        to = newline;
      }

      s = source.substring(i, to);
      i = to;
    }

    row.push(s);

    // look for ,
    if (source.charCodeAt(i) === C_COMMA) {
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
  return '"' + raw.replace(globalQuote, '""') + '"';
};


/**
 * @param {string[][]} raw
 */
export const build = (raw) => {
  return raw.map((row) => row.map(r).join(',')).join('\n');
}
