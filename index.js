
const d = new TextDecoder();
const dec = d.decode.bind(d);

const e = new TextEncoder();

const C_COMMA = 44;
const C_NEWLINE = 10;
const C_QUOTE = 34;

/**
 * @param {Uint8Array|string} source
 * @return {string[][]}
 */
export const parse = (source) => {
  return [...iter(source)];
}

/**
 * @param {Uint8Array|string} source
 */
export function *iter(source) {
  if (typeof source === 'string') {
    source = e.encode(source);
  }

  let i = 0;

  /** @type {string[]} */
  const row = [];

  for (; ;) {
    if (i >= source.length) {
      yield row;
      break;
    }

    // we consume at most one col per outer loop
    let s = '';

    const start = source[i];
    switch (start) {
      case C_NEWLINE: {
        const copy = row.splice(0, row.length);
        yield copy;
        ++i;
        continue;
      }

      case C_QUOTE: {
        // consume many parts of quoted string
        for (; ;) {
          let next = source.indexOf(C_QUOTE, i + 1);
          if (next === -1) {
            next = source.length;
          }

          const part = dec(source.subarray(i + 1, next));
          s += part;

          i = next + 1;
          if (i >= source.length) {
            break;  // end of input
          }
          const check = source[i];
          if (check === C_COMMA || check === C_NEWLINE) {
            break;  // end of string
          } else if (check !== C_QUOTE) {
            --i;  // allow missing double quote _anyway_
          }
          s += '"';
        }

        break;
      }

      default: {
        // this is a "normal" value, ends with a comma or newline
        // look for comma first (educated guess)
        let to = source.indexOf(C_COMMA, i);
        if (to === -1) {
          to = source.length;
        }

        let newline = source.subarray(i, to).indexOf(C_NEWLINE);
        if (newline === -1) {
          // ignore, ok
        } else {
          to = newline + i;
        }

        s = dec(source.subarray(i, to));
        i = to;
        break;
      }
    }

    row.push(s);

    // look for ,
    if (source[i] === C_COMMA) {
      ++i;
    }
  }

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
