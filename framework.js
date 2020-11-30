import { first, kebabCase } from "./_.js";

export const Component = (componentFn, style, template) => {
  const tag = kebabCase(componentFn);
  if (customElements.get(tag)) {
    throw new Error(`A component with the tag: ${tag}, was already defined.`);
  }

  customElements.define(
    tag,
    class extends HTMLElement {
      eventHandlers = new Map();
      bindTargets = new Set();

      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        // Persist some details of the component
        this.name = componentFn.name;

        // Create a state and hook up the state updator
        // to the component lifecycle
        const [getState, updateState] = createState();
        this.getState = getState;
        this.component = componentFn(updateState);

        this.renderStyle();
        this.render();
      }

      connectedCallback() {
        console.log("Custom square element added to page.");
        this.component.onMount(parseAttributes(this));
      }

      disconnectedCallback() {
        console.log("Custom square element removed from page.");
        this.component.onUnmount();
      }

      adoptedCallback() {
        console.log("Custom square element moved to new page.");
      }

      attributeChangedCallback(name, oldValue) {
        console.log("Custom square element attributes changed.");
        const newProps = parseAttributes(this);
        this.component.onProps(newProps, {
          ...newProps,
          ...parseAttribute({ name, value: oldValue }),
        });
      }

      render() {
        const compliledTemplate = compile(template);
        this.shadowRoot.appendChild(compliledTemplate);
        this.identifyBindings();
      }

      renderStyle() {
        const styleTag = document.createElement("style");
        styleTag.textContent = style;
        this.shadowRoot.appendChild(styleTag);
        this.shadowStyleRoot = this.shadowRoot.children[0];
      }

      identifyBindings() {
        const nodes = new Array();
        nodes.push(this.shadowRoot);

        while (nodes.length) {
          const top = nodes.pop();

          if (top.nodeType === this.ELEMENT_NODE) {
            // Array.from(top.attributes).forEach(({ name, value }) => {
            //   if (name.startsWith)
            // });

            if (top.childNodes) {
              nodes = nodes.concat(Array.from(top.childNodes));
            }
          } else if (top.nodeType === this.TEXT_NODE) {
            top.textContent = compileText(top.textContent, this.getState());
          }
        }
      }
    }
  );
};

const parseAttributes = (element) =>
  Array.from(element.attributes).reduce(
    (props, attr) => ({
      ...props,
      ...parseAttribute(attr, element),
    }),
    {}
  );

const parseAttribute = (attr, element) => {
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

const compile = (template) => {
  const templateNode = document.createElement("template");
  templateNode.innerHTML = template;
  return templateNode.content.cloneNode(true);
};

const createState = () => {
  let state;

  const currentState = () => state;

  const stateUpdater = (newStateOrCallback) => {
    if (typeof newStateOrCallback === "function") {
      const newState = newStateOrCallback(state);
      if (newState === state) {
        return;
      }
      state = { ...state, ...newState };
    } else {
      state = { ...state, ...newStateOrCallback };
    }

    return state;
  };

  return [currentState, stateUpdater];
};

const hasInterpolation = (element) => {
  if (element.nodeType !== this.textContent) return false;

  const regex = /\{\{.*?\}\}/gim;
  return regex.test(element.textContent);
};

const compileText = (str, data) => {
  if (!hasInterpolation) return false;

  let resultArray = [];

  for (let pos = 0, length = str.length - 1; pos < length; pos++) {
    let currentChar = str[pos];
    let nextChar = str[pos + 1];

    if (currentChar == undefined) {
      break;
    }

    // If we don't find an interpolation, keep parsing
    if (!(currentChar === "{" && nextChar === "{")) {
      resultArray.push(currentChar);
      continue;
    }

    let propertyBuffer = [];
    // start the property buffer in the inner region of the braces
    pos += 2;

    // keep moving right and push the characters into the
    // property buffer
    do {
      currentChar = str[pos];
      nextChar = str[pos + 1];

      // If you find a damaged interpolation
      // set the position to the nextChar and merge the property buffer
      // into the results array
      if (
        // you find a recurrsive interpolation
        (currentChar === "{" && nextChar === "{") ||
        // you find a non matching pairs of closing braces
        ((currentChar === "}" || nextChar === "}") && currentChar !== nextChar)
      ) {
        // flush the property buffer into result array as
        // the string cannot be interpolated
        resultArray = resultArray.concat(propertyBuffer);
        // include the damaged characters
        resultArray.push(currentChar);
        resultArray.push(nextChar);
        // move the pointer to outside the identified region
        // to continue outer loop
        pos += 2;
        break;
      }

      // yay we found a closing matching braces
      if (currentChar === "}" && nextChar === "}") {
        // merge the interpolated result into the compiled string
        const property = propertyBuffer.join("");
        resultArray = resultArray.concat(`${data[property]}`.split(""));

        // move the pointer to outside the identified region
        // to continue outer loop
        pos += 2;
        break;
      }

      // move the cursor forward
      propertyBuffer.push(currentChar);
      pos++;
    } while (currentChar !== "}" && nextChar !== "}");
  }

  return resultArray.join("");
};
