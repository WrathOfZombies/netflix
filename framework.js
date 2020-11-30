import { kebabCase } from "./_.js";

export const Component = (componentFn, style, template) => {
  const tag = kebabCase(componentFn);
  if (customElements.get(tag)) {
    throw new Error(`A component with the tag: ${tag}, was already defined.`);
  }

  customElements.define(
    tag,
    class extends HTMLElement {
      eventHandlers = new WeakMap();
      bindTargets = new WeakMap();

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
        this.component.onMount(parseAttributes(this.attributes));
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
        this.component.onProps(parseAttributes(this.attributes), {
          ...parseAttributes(this.attributes),
          ...parseAttribute({ name, value: oldValue }),
        });
      }

      render() {
        const compliledTemplate = compile(template);
        this.shadowRoot.appendChild(compliledTemplate);
      }

      renderStyle() {
        const styleTag = document.createElement("style");
        styleTag.textContent = style;
        this.shadowRoot.appendChild(styleTag);
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
  };

  return [currentState, stateUpdater];
};
