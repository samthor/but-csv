
const dec = new TextDecoder();


const C_COMMA = 44;
const C_NEWLINE = 10;
const C_QUOTE = 34;

/**
 * @param {Uint8Array} source
 * @return {string[][]}
 */
export function parse(source) {
  /** @type {string[][]} */
  const all = [];

  parseCallback(source, (x) => all.push(x));

  return all;
}


/**
 * @param {Uint8Array} source
 * @param {(x: string[]) => void} announce
 */
export function parseCallback(source, announce) {
  let i = 0;

  /** @type {string[]} */
  const row = [];

  outer: for (; ;) {
    if (i >= source.length) {
      announce(row);
      break;
    }

    const start = source[i];
    switch (start) {
      case C_NEWLINE: {
        const copy = row.splice(0, row.length);
        announce(copy);
        ++i;
        continue outer;
      }

      case C_QUOTE: {
        let s = '';

        for (; ;) {
          // consume quoted string
          const next = source.indexOf(C_QUOTE, i + 1);
          if (next === -1) {
            // emit to end
            const s = dec.decode(source.subarray(i + 1));
            i = source.length;
            row.push(s);
            continue outer;
          }
          const part = dec.decode(source.subarray(i + 1, next));
          s += part;

          i = next + 1;
          if (i >= source.length) {
            break;
          }
          const check = source[i];
          if (check === C_COMMA || check === C_NEWLINE) {
            break;
          } else if (check !== C_QUOTE) {
            --i;  // don't prevent missing double quote
          }
          s += '"';
        }

        row.push(s);
        break;
      }

      default: {
        // guess that it's probably , next (not quoted)
        let comma = source.indexOf(C_COMMA, i);
        if (comma === -1) {
          comma = source.length;
        }
        let to = comma;

        let newline = source.subarray(i, comma).indexOf(C_NEWLINE);
        if (newline === -1) {
          // ignore, ok
        } else {
          to = newline + i;
        }

        const value = dec.decode(source.subarray(i, to));
        row.push(value);

        i = to;
        break;
      }
    }

    // look for ,
    if (source[i] === C_COMMA) {
      ++i;
    }
  }

}
