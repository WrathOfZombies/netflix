import { Component } from "../framework.js";

class LargeObject {
  constructor() {
    this.items = new Array(100000).fill(
      Number.MAX_SAFE_INTEGER * Math.random()
    );
  }
}

class NetflixApp {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  largeObjects = [];

  renderStyle() {
    return `h1 { color: red; }`;
  }

  render() {
    const { user, time } = this.getState();
    return `
      <h1 @click="onClick">Welcome to Netflix app, ${user}</h1>
      <p>The time now is ${time}</>
    `;
  }

  onMount(props) {
    const interval = setInterval(() => {
      this.updateState({ time: Date.now() });
    }, 1000);
    this.updateState({ user: props.user, time: Date.now(), interval });
  }

  onPropsChanged(newProps, oldProps) {
    console.log("Props changed", newProps, oldProps);
    this.updateState({ user: newProps.user });
  }

  onUnmount() {
    const { interval } = this.getState();
    clearInterval(interval);
    console.log("Unmouted");
  }

  onClick = (event) => {
    this.largeObjects.push(new LargeObject());
    console.log("Click triggered", event);
  };
}

Component(NetflixApp);
