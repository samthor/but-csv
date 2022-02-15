
const S_COMMA = ',';
const C_COMMA = 44;
const C_NEWLINE = 10;
const S_NEWLINE = '\n';
const S_QUOTE = '"';
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

  /** @type {string[]} */
  const row = [];

  while (i < source.length) {
    // we consume at most one col per outer loop
    let s = '';

    const start = source.charCodeAt(i);
    if (start === C_NEWLINE) {
      const copy = row.splice(0, row.length);
      yield copy;
      ++i;
      continue;

    } else if (start === C_QUOTE) {
      // consume many parts of quoted string
      for (; ;) {
        let next = source.indexOf(S_QUOTE, i + 1);
        if (next === -1) {
          next = source.length;
        }

        const part = source.substring(i + 1, next);
        s += part;

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
      let to = source.indexOf(S_COMMA, i);
      if (to === -1) {
        to = source.length;
      }

      // make sure there wasn't a newline here (this is mildly faster than getting the substring)
      let newline = source.indexOf(S_NEWLINE, i);
      if (newline === -1 || newline > to) {
        // ignore
      } else {
        to = newline;
      }

      // TODO: this also works
      // for (let j = i; j < to; ++j) {
      //   if (source.charCodeAt(j) === C_NEWLINE) {
      //     to = j;
      //     break;
      //   }
      // }

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
