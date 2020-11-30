import { Component } from "../framework.js";

class NetflixApp {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  render() {
    const { user, time } = this.getState();

    const movies = new Array(10)
      .fill(undefined)
      .map(
        (_, index) =>
          `<movie-card title="The adventures of movie ${
            index + 1
          }" @titleclicked="onMovieTitleClicked"></movie-card>`
      )
      .join("");

    return [
      `<div>
      <h1 @click="onClick">Welcome to Netflix app, ${user}</h1>
      ${movies}
      <p>The time now is ${time}</></div>`,
      `h1 { color: red; }`,
    ];
  }

  onMovieTitleClicked = (event) => {
    console.log("Movie title clicked", event, this.getState());
  };

  onMount(props) {
    this.updateState({ user: props.user });
  }

  onPropsChanged(newProps, oldProps) {
    console.log("Props changed", newProps, oldProps);
    this.updateState({ user: newProps.user });
  }

  onClick = (event) => {
    console.log("Click triggered", this.getState(), event);
  };
}

Component(NetflixApp);
