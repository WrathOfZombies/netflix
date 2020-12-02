import { Component } from "./framework/component.js";
import { queryIsBillBoard, queryMoviesList } from "./state/store.js";
import { first } from "./utilities/_.js";
import { billBoard } from "./components/bill-board.js";
import { movieCarousel } from "./components/movie-carousel.js";

class NetflixApp {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  onMount() {
    const moviesList = queryMoviesList();
    if (!moviesList || !moviesList.length) {
      return;
    }

    this.updateState({ moviesList });
  }

  render() {
    const { moviesList } = this.getState();

    const children = moviesList
      .map((row, index) =>
        queryIsBillBoard(index)
          ? billBoard({ "movie-id": first(row), "billboard-id": index })
          : movieCarousel({ movies: row })
      )
      .join("");

    return [
      `<div class="gallery" role="grid">
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
