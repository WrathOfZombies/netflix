import { Component } from "../framework/component.js";
import { queryMovie } from "../state/store.js";

class MovieCard {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  onPropsChanged({ "movie-id": movieId, index }) {
    if (!movieId) {
      return;
    }
    const movie = queryMovie(movieId);
    if (!movie) {
      return;
    }
    this.updateState({ movie, index });
  }

  render() {
    const { movie, index } = this.getState();
    const { title, boxart, id } = movie;
    return [
      `<img loading="lazy" role="grid-cell" class="boxshot" tabindex="0" src="${boxart}" id="movie-${id}" title="${title}" aria-colindex="${index}" @click="onMovieClicked"/>`,
      styles(),
    ];
  }

  onMovieClicked = (event) => {
    const {
      movie: { title },
    } = this.getState();
    console.log(`This ${title} was selected`, event);
  };
}

const styles = () => `
/**
 * Video boxshot.
 *
 * The actual image for a video
 */
.boxshot {
  width: 253px;
  height: 142px;
  position: "relative",
  -webkit-user-drag: none;
}
`;

export const movieCard = Component(MovieCard, ["movie-id", "index"]);
