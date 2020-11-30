import { Component } from "../framework.js";

class MovieCard {
  constructor(getState, updateState, notify) {
    this.getState = getState;
    this.updateState = updateState;
    this.notify = notify;
  }

  onTitleClicked = () => {
    console.log("Notifying of movie title clicks");
    this.notify("titleclicked", {
      title: this.getState().title,
      time: Date.now(),
    });
  };

  render() {
    const { title } = this.getState();
    return [
      `<p @click="onTitleClicked">This is a good movie: ${title}</>`,
      `p { color: cyan; }`,
    ];
  }

  onMount(props) {
    this.updateState({ title: props.title });
  }

  onPropsChanged(newProps, oldProps) {
    console.log("Props changed", newProps, oldProps);
  }

  onUnmount() {
    console.log("Unmouted");
  }
}

Component(MovieCard);
