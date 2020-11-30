import { Component } from "./framework.js";
import { data } from "./data.js";
import "./components/movie.js";
import { first } from "./_.js";

class NetflixApp {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  onMount() {
    this.updateState({ content: data.rows });
  }

  render() {
    const { content = [] } = this.getState();

    const movies = content
      .map(
        (row, index) =>
          row.length === 1 ? 
          `<bill-board movieId="${first(row)}" billboardId="${index}" />`
          `<movie-card title=" ${title}" @titleclicked="onMovieTitleClicked"></movie-card>`
      )
      .join("");

    return [
      `<div class="gallery">
        <h1 @click="onClick">Netflix</h1>
        ${movies}
      </div>`,
      `
h1 { color: red; }

.gallery { 
  width: 1280px;
  margin: 0 auto;
}
      `,
    ];
  }
}

Component(NetflixApp);
