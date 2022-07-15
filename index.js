
const C_COMMA = 44;
const C_NEWLINE = 10;
const C_QUOTE = 34;

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

  let sourceCharCodeAt = _ => source.charCodeAt(i);
  // appends source.slice(i, new_i) to s and sets i = new_i
  let appendSliceAndSetI = (/** @type {number} */ new_i) => s += source.slice(i, i = new_i);  // slice is smaller than substring

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

    s = '';
    if (sourceCharCodeAt() == C_QUOTE) {
      // consume many parts of quoted string
      for (; ;) {
        ++i;
        appendSliceAndSetI(nextIndex('"'));
        if (!(++i < length && (temp = sourceCharCodeAt()) != C_COMMA && temp != C_NEWLINE)) {
          break;  // end of string or end of input
        }

        // @ts-ignore you *can* subtract booleans from numbers
        i -= temp != C_QUOTE;
        // the above line is this, which saves two bytes:
        // if (temp != C_QUOTE) {
        //   --i;  // allow missing double quote _anyway_
        // }
        s += '"';
      }

    } else {
      // this is a "normal" value, ends with a comma or newline
      // look for comma first (educated guess)
     appendSliceAndSetI((temp = nextIndex(',')) > (newline = i > newline ? nextIndex('\n') : newline) ? newline : temp);

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
      i = temp;
      */
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


/**
 * Parse a whole CSV.
 *
 * @param {string} source
 * @return {string[][]}
 */
const parse = (source) => {
  return [...iter(source)];
}


let needsQuoteRegexp = /["\n,]/;
let globalQuote = /"/g;


/**
 * @param {any} raw
 */
let r = (raw) => {
  // we hide string conversion inside this arg: on the `return`, raw is already stringified
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
const build = (raw) => {
  // we could stringify array with ''+arr, but it's 50% slower than .join()
  // .join() without args is always with ','
  return raw.map((row) => row.map(r).join()).join('\n');
}


export { build, parse };
