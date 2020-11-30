import { Component } from "../framework.js";

const NetflixApp = (updateState) => ({
  onMount: (props) => {
    console.log("Mounted", props);
    updateState({ user: props.user });
  },
  onProps(newProps, oldProps) {
    console.log("Props changed", newProps, oldProps);
  },
  onUnmount() {
    console.log("Unmouted");
  },
  onClick(event) {
    console.log("Click triggered", event);
  },
});

Component(
  NetflixApp,
  `h1 { color: red; }`,
  `<h1 @click={onClick}>Welcome to Netflix app, {{user}}</h1>`
);
