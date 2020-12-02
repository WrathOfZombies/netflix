import { Component } from "./framework/component.js";
import { queryIsBillBoard, queryMoviesList } from "./state/store.js";
import { first } from "./utilities/_.js";

import { billBoard } from "./components/bill-board.js";
import { movieCarousel } from "./components/movie-carousel.js";

/**
 * Bootstraps the application on the UI
 * and renders a list of movies. If we had to do
 * infinite loading, this component would wire up a child
 * that is capable of doing the same and would supply the
 * item renderer.
 */
class NetflixApp {
  // This was only needed due to the lack of decorators
  // else could have been avoided.
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  // when the component is mounted, then go ahead and query
  // for the movies and trigger a UI update.
  onMount() {
    const moviesList = queryMoviesList();
    if (!moviesList || !moviesList.length) {
      return;
    }

    this.updateState({ moviesList });
  }

  render() {
    const { moviesList } = this.getState();

    // For each movie in movie list,
    // render a billboard or a movie carousel
    const children = moviesList
      .map((row, index) =>
        // By taking this approach, we can dynamically promote some
        // items to be a billboard or become a box short instead
        queryIsBillBoard(index)
          ? billBoard({ "movie-id": first(row), "billboard-id": index })
          : movieCarousel({ movies: row })
      )
      .join("");

    return `
      <div class="gallery" role="grid">
        ${children}
      </div>`;
  }
}

const styles = `
h1 { color: red; }

/**
 * The gallery container.
 *
 * It wraps all the rows and boxshots.
 */
.gallery { 
  width: 1280px;
  margin: 0 auto;
}`;

export const netflixApp = Component(NetflixApp, [], styles);
