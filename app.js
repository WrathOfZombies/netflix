import { Component } from "./framework/component.js";
import { data } from "./data.js";
import { first } from "./utilities/_.js";
import { billBoard } from "./components/bill-board.js";
import { movieCarousel } from "./components/movie-carousel.js";

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

    const children = content
      .map((row, index) =>
        row.length === 1
          ? billBoard({ "movie-id": first(row), "billboard-id": index })
          : movieCarousel({ movies: row })
      )
      .join("");

    return [
      `<div class="gallery">
        ${children}
      </div>`,
      style(),
    ];
  }
}

const style = () =>
  `h1 { color: red; }

  /**
   * The gallery container.
   *
   * It wraps all the rows and boxshots.
   */
  .gallery { 
    width: 1280px;
    margin: 0 auto;
  }`;

export const netflixApp = Component(NetflixApp);
