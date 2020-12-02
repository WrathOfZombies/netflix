import { kebabCase, memo } from "../utilities/_.js";
import {
  parseAttributes,
  parseAttribute,
  serializeAttribute,
  parseEventAttribte,
} from "./attributes.js";

/**
 * Wraps a provided component constructor into a custom element. Uses
 * the constuctor name to create a tag for it and returns a function that
 * allows consumers to render the component where needed.
 * @param {class} constructor The component constructor
 * @param {array} props The set of props that need to be observed and passed
 * @param {string} styles The set of styles that need to be rendered
 * @returns A function that accepts valid props and renders the component
 */
export const Component = (constructor, props = [], styles = "") => {
  const tag = kebabCase(constructor);
  if (customElements.get(tag)) {
    throw new Error(`A component with the tag: ${tag}, was already defined.`);
  }

  customElements.define(
    tag,
    // I <3 JS
    class extends HTMLElement {
      // A list of dipose functions to unregister event handlers
      eventTargets = Array();

      constructor() {
        super();
        // Setup the shadowDom
        this.attachShadow({ mode: "open" });
        this.name = tag;
        this.unmounted = true;

        // Create a state and hook up the state updator
        // to the component lifecycle. Then create the component
        this.component = Reflect.construct(constructor, [
          ...createState(() => {
            if (this.unmounted) return;
            this.render();
          }),
          this.notifier,
          this.shadowRoot,
        ]);
      }

      /**
       * Notifies the customElementRegistry on the props that need to
       * be checked for changes
       */
      static get observedAttributes() {
        return props;
      }

      /**
       * Required when a component wants to notify it's parent of some custom event
       * @param {*} eventName The custom eventname
       * @param {*} data The event data that needs to be passed
       */
      notifier = (eventName, data) => {
        const event = new CustomEvent(eventName, data);
        // Why host? Cause we need to notify the parent of this component
        // who lives outside of the shadowroot.
        this.shadowRoot.host.dispatchEvent(event);
      };

      /**
       * Called when the component is mounted
       */
      connectedCallback() {
        this.component.onMount && this.component.onMount();
        this.renderStyle(styles);
        this.render();
      }

      /**
       * Called when the component is unmounted
       */
      disconnectedCallback() {
        this.unmounted = true;

        // Dispose the event handlers
        while (this.eventTargets.length) {
          const dispose = this.eventTargets.pop();
          dispose();
        }
        this.eventTargets = [];

        this.component.onUnmount && this.component.onUnmount();
        this.component = null;
      }

      /**
       * Called when the component is moved
       */
      adoptedCallback() {
        this.render();
      }

      /**
       * Called when any of the observedAttributes changes
       */
      attributeChangedCallback(name, oldValue) {
        const newProps = parseAttributes(this);
        this.component.onPropsChanged &&
          // we want to inform the component of the newProps so we compute it
          // but we also want to inform of the old props, so take the computed new
          // props and update changed prop to contain the old value
          this.component.onPropsChanged(newProps, {
            ...newProps,
            ...parseAttribute({ name, value: oldValue }),
          });
      }

      /**
       * Renders the component's template
       */
      render = memo(() => {
        this.unmounted = false;
        const template = this.component.render();
        this.renderHtml(template);
      });

      /**
       * Renders the style element as the first child of the shadowRoot
       */
      renderStyle = memo((css) => {
        if (!css) {
          return;
        }
        const styleTag = document.createElement("style");
        styleTag.textContent = css;

        const existingStyle = this.shadowRoot.firstElementChild;
        if (existingStyle) {
          this.shadowRoot.replaceChild(styleTag, existingStyle);
        } else {
          this.shadowRoot.appendChild(styleTag);
        }
      });

      /**
       * Renders the html as the last child of the shadowRoot
       */
      renderHtml = memo((template) => {
        const templateNode = document.createElement("template");
        templateNode.innerHTML = template || "";
        const newDom = templateNode.content.cloneNode(true);

        if (newDom.children && newDom.children.length > 2) {
          throw new Error("Nodes cannot have multiple children");
        }

        // Obviously this sucks big time as we always
        // construct the dom even if there's very little that changes.
        // The best way to do this is instead to use an htmlparser
        // convert the DOM to an AST and then memoize each node
        // instead.
        if (this.templateNode && this.templateNode.isEqualNode(newDom)) {
          // if we cached the last dom and it is exactly the same as the new dom
          // then we can skip updates
          return;
        } else {
          // else if we already have the shadow dom, just replace it
          if (
            this.shadowRoot.lastChild &&
            this.shadowRoot.lastChild.nodeName !== "STYLE"
          ) {
            this.shadowRoot.replaceChild(newDom, this.shadowRoot.lastChild);
          } else {
            this.shadowRoot.appendChild(newDom);
          }

          this.processEventBindings();
        }
      });

      /**
       * Performs a DFS to inspect the shadowRoot of this component only
       * and attach and event listeners. We don't process child components
       * as their own lifecycle will handle it for us.
       */
      processEventBindings() {
        // Dispose the existing event handlers
        while (this.eventTargets.length) {
          const dispose = this.eventTargets.pop();
          dispose();
        }
        this.eventTargets = [];

        // Let's do some DFS
        const nodes = new Array();
        if (this.shadowRoot.childElementCount) {
          nodes.push(...Array.from(this.shadowRoot.children));
        }

        while (nodes.length) {
          // Pop the top of the stack in our DFS
          const top = nodes.pop();

          if (top.nodeType === this.ELEMENT_NODE) {
            Array.from(top.attributes).forEach(({ name, value }) => {
              // if an attrbute starts with @
              const event = parseEventAttribte({ name });
              if (event) {
                const handler = this.component[value];
                if (handler) {
                  const dispose = attachEventHandler(top, event, handler);
                  this.eventTargets.push(dispose);
                }
              }
            });

            // If the node has element children
            // Then dive deeper
            if (top.childElementCount) {
              nodes.push(...Array.from(top.children));
            }
          }
        }
      }
    }
  );

  return (props) => componentTemplateConstructor(tag, props);
};

/**
 * Given a set of tags and props, serialzie them and create a render string
 * that the caller can use to create this component
 */
const componentTemplateConstructor = (tag, props = {}) => {
  const { children, ...rest } = props;

  const attributes = Array.from(Object.keys(rest)).reduce(
    (acc, attr) => [
      ...acc,
      serializeAttribute({ name: attr, value: props[attr] }),
    ],
    []
  );

  if (children && typeof children !== "string") {
    throw new Error("Children need to be string");
  }

  return `<${tag} ${attributes.join(" ")}>${children || ""}</${tag}>`;
};

/**
 * A simple component state tracker
 * @param {Function} onStateChanged A callback to notify when the state has changed
 * @returns An accesor that allows to get the current reference of the state and a state updator
 * that allows changing the state
 */
const createState = (onStateChanged) => {
  let state = {};

  const currentState = () => state;

  const stateUpdater = (value) => {
    if (typeof value === "function") {
      const newState = value(state);
      if (newState === state) {
        return;
      }
      state = { ...state, ...newState };
    } else {
      state = { ...state, ...value };
    }
    onStateChanged();
    return state;
  };

  return [currentState, stateUpdater];
};

/**
 * Track any event bindings under eventTargets so that they can be
 * safely disposed on unmount
 * @param {*} target The target dom element
 * @param {*} event The event to be handled
 * @param {*} handler The handler registered
 * @returns A dispose function to remove the attached handler
 */
const attachEventHandler = (target, event, handler) => {
  target.addEventListener(event, handler);
  return () => target.removeEventListener(event, handler);
};
