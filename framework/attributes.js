export const parseAttributes = (element) =>
  Array.from(element.attributes).reduce(
    (props, attr) => ({
      ...props,
      ...parseAttribute(attr, element),
    }),
    {}
  );

export const parseAttribute = (attr, element) => {
  if (!attr) {
    return {};
  }

  const { name: key, value } = attr;

  // If no attribute value was provided, then we'll assume that it's
  // to indicate boolean truthy
  if (!value) {
    return { [key]: true };
  }

  // extract the boolean parameters out
  if (value === "false" || value === "true") {
    return { [key]: value === "true" ? true : false };
  }

  // if the attribute is style then return the styleMap instead
  if (key === "style") {
    return { style: element.style };
  }

  // parse potential nunmbers
  const potentialNumericValue = parseFloat(value);
  if (!isNaN(potentialNumericValue)) {
    return { [key]: potentialNumericValue };
  }

  // upon all else, try to parse as json else,
  // else assume it as a string
  try {
    return { [key]: JSON.parse(value) };
  } catch (error) {
    return { [key]: value };
  }
};

export const serializeAttribute = (attr) => {
  if (!attr) {
    return {};
  }

  const { name: key, value } = attr;

  // If no attribute value was provided, then we'll assume that it's
  // to indicate boolean truthy
  if (value == null) {
    return `${key}`;
  }

  // extract the boolean parameters out
  if (value === false || value === true) {
    return `${key}="${value ? "true" : "false"}"`;
  }

  // if the attribute is style then assign the styleMap
  if (key === "style") {
    if (!(value instanceof CSSStyleDeclaration)) {
      throw new Error("Style needs to be a CSSStyleDeclaration");
    }
    return `style="${value.cssText}"`;
  }

  if (Array.isArray(value)) {
    return `${key}="${JSON.stringify(value)}"`;
  }

  // parse potential nunmbers
  const potentialNumericValue = parseFloat(value);
  if (!isNaN(potentialNumericValue)) {
    return `${key}="${potentialNumericValue}"`;
  }

  if (typeof value === "string") {
    return `${key}="${value}"`;
  }

  // upon all else, try to serialize as json
  try {
    return `${key}="${JSON.stringify(value)}`;
  } catch (error) {
    throw new Error("Failed serialization");
  }
};
