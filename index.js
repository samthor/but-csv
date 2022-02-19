
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
  // sets temp to target and gets source.slice(i, temp)
  let substringIToTemp = (/** @type {number} */ target) => source.slice(i, temp = target);  // slice is smaller than substring

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

    if (sourceCharCodeAt() == C_QUOTE) {
      s = '';
      // consume many parts of quoted string
      // @ts-ignore you *can* add booleans to numbers
      for (; ;i -= temp != C_QUOTE, s += '"') {
        ++i;
        s += substringIToTemp(nextIndex('"'));

        // @ts-ignore temp is set in the above call
        i = temp + 1;
        temp = sourceCharCodeAt();
        if (!(temp != C_COMMA && temp != C_NEWLINE && i < length)) {
          break;  // end of string or end of input
        }

        // the for loop's "increment expression" is this, which saves a byte:
        // // @ts-ignore you *can* add booleans to numbers
        // i -= temp != C_QUOTE;
        // // the above line is this, which saves two bytes:
        // // if (temp != C_QUOTE) {
        // //   --i;  // allow missing double quote _anyway_
        // // }
        // s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
      s = substringIToTemp((temp = nextIndex(',')) > (newline = i > newline ? nextIndex('\n') : newline) ? newline : temp);

      // the above line is this, which saves some bytes:
      /*
      if (i > newline) {
        newline = nextIndex('\n');
      }
      temp = nextIndex(',');
      if (newline < temp) {
        temp = newline;
      }
      s = source.slice(i, temp);
      */
      i = temp;
    }

    row.push(s);

    // look for ,
    // @ts-ignore you *can* add booleans to numbers
    i += sourceCharCodeAt() == C_COMMA;

    // the above line is this, which saves 2 bytes:
    // if (sourceCharCodeAt() == C_COMMA) {
    //   ++i;
    // }
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
