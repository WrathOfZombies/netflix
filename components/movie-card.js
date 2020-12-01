import { Component } from "../framework/component.js";
import { data } from "../data.js";

class MovieCard {
  constructor(getState, updateState) {
    this.getState = getState;
    this.updateState = updateState;
  }

  render() {
    const { movie, index } = this.getState();
    if (!movie) {
      return [];
    }
    const { title, boxart, id } = movie;

    return [
      `<img role="grid-cell" class="boxshot" tabindex="0" src="${boxart}" id="movie-${id}" title="${title}" aria-colindex="${index}" @click="onMovieClicked"/>`,
      styles(),
    ];
  }

  onPropsChanged({ "movie-id": movieId, index }) {
    if (!movieId) {
      return;
    }

    const videos = new Map(data.videos.map((video) => [video.id, video]));
    const movie = videos.get(movieId);
    this.updateState({ movie, index });
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
