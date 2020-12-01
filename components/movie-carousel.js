import { Component } from "../framework.js";
import { data } from "../data.js";

class MovieCarousel {
  constructor(getState, updateState, notify) {
    this.getState = getState;
    this.updateState = updateState;
    this.notify = notify;
  }

  render() {
    const { movies } = this.getState();
    const children = movies
      .map(
        ({ title, boxart, id }) =>
          `<img class="boxshot" src="${boxart}" id="movie-${id}" title="${title}"/>`
      )
      .join("");

    return [
      `<section class="row-videos">
        ${children}
      </section>`,
      styles(),
    ];
  }

  onMount(props) {
    const videos = new Map(data.videos.map((video) => [video.id, video]));
    const movies = props.movies.map((movie) => videos.get(movie));
    this.updateState({ movies });
  }
}

const styles = () => `
/**
 * Video Row Container.
 *
 * We stack each row on top of each other in the gallery. Inside we place the image boxshots.
 */
.row-videos {
  margin: 10px 0;
  display: inline-flex;
}

/**
 * Video boxshot.
 *
 * The actual image for a video
 */
.boxshot {
  width: 253px;
  height: 142px;
  margin-right: 3px;
}

.boxshot:last-child {
  margin-right: 0;
}
`;

export const movieCarousel = Component(MovieCarousel);
