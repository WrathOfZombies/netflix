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
