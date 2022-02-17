
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
  let length = source.length;

  /** @type {string[]} */
  let row = [];

  /** @type {string} */
  let s;

  /** @type {number} */
  let temp;

  let sourceCharCodeAt = () => source.charCodeAt(i);
  let substringIToTemp = () => source.substring(i, temp);

  for (;;) {
    // we consume at most one col per outer loop
    if (sourceCharCodeAt() == C_NEWLINE) {
      yield row.splice(0, row.length);
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

    if (sourceCharCodeAt() == C_QUOTE) {
      s = '';
      // consume many parts of quoted string
      for (; ;) {
        ++i;
        temp = source.indexOf('"', i);
        if (temp < 0) {
          temp = length;
        }
        s += substringIToTemp();

        i = temp + 1;
        temp = sourceCharCodeAt();
        if (temp == C_COMMA || temp == C_NEWLINE || i >= length) {
          break;  // end of string or end of input
        } else if (temp != C_QUOTE) {
          --i;  // allow missing double quote _anyway_
        }
        s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
      temp = source.indexOf(',', i);
      if (temp < 0 || newline < temp) {
        temp = newline;
      }

      s = substringIToTemp();
      i = temp;
    }

    row.push(s);

    // look for ,
    if (sourceCharCodeAt() == C_COMMA) {
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
