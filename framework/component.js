import { kebabCase, memo } from "../utilities/_.js";
import {
  parseAttributes,
  parseAttribute,
  serializeAttribute,
} from "./attributes.js";

export const Component = (constructor) => {
  const tag = kebabCase(constructor);
  if (customElements.get(tag)) {
    throw new Error(`A component with the tag: ${tag}, was already defined.`);
  }

  customElements.define(
    tag,
    class extends HTMLElement {
      eventTargets = Array();

      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.name = tag;
        this.unmounted = true;

        // Create a state and hook up the state updator
        // to the component lifecycle
        this.component = Reflect.construct(constructor, [
          ...createState(this.onStateChanged),
          this.notifier,
        ]);
      }

      notifier = (eventName, data) => {
        const event = new CustomEvent(eventName, data);
        this.shadowRoot.host.dispatchEvent(event);
      };

      onStateChanged = (state) => {
        if (this.unmounted) return;
        console.log("State has changed!", state);
        this.render();
      };

      connectedCallback() {
        this.component.onMount && this.component.onMount(parseAttributes(this));
        this.render();
      }

      disconnectedCallback() {
        this.unmounted = true;
        this.removeEventHandlers();
        this.component.onUnmount && this.component.onUnmount();
        this.component = null;
      }

      adoptedCallback() {
        this.render();
      }

      attributeChangedCallback(name, oldValue) {
        const newProps = parseAttributes(this);
        this.component.onProps &&
          this.component.onProps(newProps, {
            ...newProps,
            ...parseAttribute({ name, value: oldValue }),
          });
      }

      attachEventHandler(target, event, handler) {
        if (!this.eventTargets) {
          this.eventTargets = [];
        }
        target.addEventListener(event, handler);
        this.eventTargets.push([target, { event, handler }]);
      }

      removeEventHandlers() {
        if (!this.eventTargets) {
          return;
        }
        while (this.eventTargets.length) {
          const [target, { event, handler }] = this.eventTargets.pop();
          target.removeEventListener(event, handler);
        }
        this.eventTargets = null;
      }

      render() {
        const [template, styles] = [this.component.render()].flat();
        this._renderStyle(styles);
        this._renderTemplate(template);
        this.unmounted = false;
      }

      _renderTemplate = memo((template) => {
        const templateNode = document.createElement("template");
        templateNode.innerHTML = template;
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
          if (this.shadowDom) {
            this.shadowRoot.replaceChild(newDom, this.shadowRoot.lastChild);
          } else {
            this.shadowRoot.appendChild(newDom);
          }
          this.shadowDom = newDom;
          this.processEventBindings();
        }
      });

      _renderStyle = memo((css) => {
        if (!css) {
          return;
        }
        if (this.styleNode) {
          this.styleNode.textContent = css;
        } else {
          const styleTag = document.createElement("style");
          styleTag.textContent = css;
          this.styleNode = this.shadowRoot.appendChild(styleTag);
        }
      });

      processEventBindings() {
        this.removeEventHandlers();

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
              if (/^@/.test(name)) {
                const [, event] = name.split("@");
                const handler = this.component[value];
                if (handler) {
                  this.attachEventHandler(top, event, handler);
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
    onStateChanged(state);
    return state;
  };

  return [currentState, stateUpdater];
};
