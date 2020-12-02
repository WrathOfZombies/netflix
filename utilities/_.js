// Why? Cause lodash is great!

export const kebabCase = (componentFn) => {
  let name = componentFn.name;
  if (!name) {
    throw new Error("Cannot use unnamed functions as components");
  }

  const result = name
    .split("")
    .reduce((chars, char) => {
      if (_isKebabBreakpoint(char, last(chars))) {
        chars.push("-");
      }
      chars.push(char.toLowerCase());
      return chars;
    }, [])
    .join("");

  return result;
};

export const first = (arr) => {
  if (arr == null) return undefined;
  if (arr instanceof Set || arr instanceof Map) {
    return Array.from(arr.values())[0];
  }
  return arr[0];
};

export const last = (arr) => {
  if (arr == null) return undefined;
  return arr[arr.length - 1];
};

export const isUpper = (char) =>
  char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90;

const _isKebabBreakpoint = (char, previousChar) => {
  if (previousChar == null) {
    return false;
  }
  if (!char || char === " ") {
    return true;
  }
  return isUpper(char);
};

export const removeChildren = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  parent.innerHTML = "";
};

export function* range(start, end) {
  let ctr = start;
  while (ctr < end) yield ctr;
  return end;
}

export const memo = (fn, comparator = shallowCompare) => {
  let previousArgs;
  let previousResult;

  return (...args) => {
    if (comparator(previousArgs, args)) {
      return previousResult;
    }
    previousArgs = args;
    previousResult = fn.apply(fn, previousArgs);
    return previousResult;
  };
};

export function is(left, right) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
  if (left === right) {
    // If `left === right`, then differentiate `-0` and `0` via division.
    return left !== 0 || 1 / left === 1 / right;
  } else {
    // If `left !== right`, then return false unless both `left` and `right` are `NaN`.
    // `NaN` can be detected via `self !== self`.
    // eslint-disable-next-line no-self-compare
    return left !== left && right !== right;
  }
}

/**
 * Performs equality of two objects by running through their immmediate keys.
 * The contents of the object for each key are compared under strict equality check.
 * @param source The source object
 * @param target The target object
 * @returns {boolean} Returns true if the objects are equal
 */
export const shallowCompare = (source, target) => {
  // Check if the objects are equal, if so then return
  if (is(source, target)) {
    return true;
  }
  // Given that the `is` comparision has failed, if either of the
  // inputs are null/undefined we have to assume they are different
  if (source == null || target == null) {
    return false;
  }
  // If the items are arrays then shallowCompare them with a different algo
  if (Array.isArray(source) && Array.isArray(target)) {
    return areArraysEqual(source, target);
  }
  // Assume they are objects and shallowCompare them
  return areObjectsEqual(source, target);
};

/**
 * Compares two arrays and returns true if they are same
 * @param source source array
 * @param target target array
 */
const areArraysEqual = (source, target) => {
  if (source.length !== target.length) {
    return false;
  }
  const length = source.length;
  for (let key = length - 1; key >= 0; key--) {
    if (!is(source[key], target[key])) {
      return false;
    }
  }
  return true;
};

/**
 * Compares two objects and returns true if they are same
 * @param source source object
 * @param target target object
 */
const areObjectsEqual = (source, target) => {
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);
  if (sourceKeys.length !== targetKeys.length) {
    return false;
  }
  for (const key of sourceKeys) {
    if (!is(source[key], target[key])) {
      return false;
    }
  }
  return true;
};
