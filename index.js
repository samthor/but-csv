
const C_COMMA = 44;
const C_NEWLINE = 10;
const C_QUOTE = 34;

/**
 * Parse a whole CSV.
 *
 * @param {string} source
 * @return {string[][]}
 */
export const parse = (source) => {
  return [...iter(source)];
}

/**
 * Iterate through a CSV. Returns all fields as string. Each row can be of varied length.
 *
 * @param {string} source
 * @return {Generator<string[], void, void>}
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
  let substringIToTemp = () => source.slice(i, temp);  // slice is smaller than substring

  /** @type {number} */
  let nextIndexTemp;
  let nextIndex = (/** @type {string} */ c) =>
      (nextIndexTemp = source.indexOf(c, i)) < 0 ? length : nextIndexTemp;

  for (;;) {
    // we consume at most one col per outer loop
    if (sourceCharCodeAt() == C_NEWLINE) {
      // yielding row and resetting is smaller but about 10% slower
      yield row.splice(0);
      ++i;
    }

    if (!(i < length)) {
      break;
    }

    if (i > newline) {
      newline = nextIndex('\n');
    }

    if (sourceCharCodeAt() == C_QUOTE) {
      s = '';
      // consume many parts of quoted string
      for (; ;(temp != C_QUOTE) && --i, s += '"') {
        ++i;
        temp = nextIndex('"');
        s += substringIToTemp();

        i = temp + 1;
        temp = sourceCharCodeAt();
        if (!(temp != C_COMMA && temp != C_NEWLINE && i < length)) {
          break;  // end of string or end of input
        }

        // the for loop's "increment expression" is this, which saves a byte:
        // if (temp != C_QUOTE) {
        //   --i;  // allow missing double quote _anyway_
        // }
        // s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
      temp = (temp = nextIndex(',')) > newline ? newline : temp;

      // the above line is this, which saves a byte:
      /*
      temp = nextIndex(',');
      if (newline < temp) {
        temp = newline;
      }
      */

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


let needsQuoteRegexp = /[\"\n,]/;
let globalQuote = /"/g;


/**
 * @param {string} raw
 */
let r = (raw) => {
  // we hide string conversion inside this arg
  if (!needsQuoteRegexp.test(raw += '')) {
    return raw;
  }
  return `"${raw.replace(globalQuote, '""')}"`;
};


/**
 * Builds a CSV from raw data. Every value is stringified before render.
 *
 * @param {any[][]} raw
 */
export const build = (raw) => {
  // we could stringify array with ''+arr, but it's 50% slower than .join()
  // .join() without args is always with ','
  return raw.map((row) => row.map(r).join()).join('\n');
}
