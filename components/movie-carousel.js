import { Component } from "../framework/component.js";
import { data } from "../data.js";
import { IsInView } from "../utilities/is-in-view.js";

class MovieCarousel {
  constructor(getState, updateState, _notify, ref) {
    this.getState = getState;
    this.updateState = updateState;
    this.ref = ref;
  }

  onMount() {
    this.dispose = IsInView(this.ref.host);
  }

  onUnmount() {
    this.dispose();
  }

  render() {
    const { movies } = this.getState();
    const children = movies
      .map(
        ({ title, boxart, id }, index) =>
          `<img role="grid-cell" class="boxshot hidden" tabindex="0" src="${boxart}" id="movie-${id}" title="${title}" aria-colindex="${
            index + 1
          }"/>`
      )
      .join("");

    return [
      `<section class="row-videos" role="row">
        ${children}
      </section>`,
      styles(),
    ];
  }

  onPropsChanged(props) {
    if (!Array.isArray(props.movies)) {
      return;
    }

    // Due to a bug in reconciliation
    // By using logical state refresh, we wouldnt be able to trigger
    // the transition as the nodes are different. However in an ideal
    // framework, these nodes should remain same by reference
    if (props.isinview) {
      const hiddenElements = this.ref.querySelectorAll(".hidden");
      if (hiddenElements && hiddenElements.length)
        hiddenElements.forEach((element) => element.classList.remove("hidden"));
    }

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
  position: "relative",
  opacity: 1;
  transition: opacity 1s;
  -webkit-user-drag: none;
}

.boxshot:last-child {
  margin-right: 0;
}

/**
 * Boxshot Image Visibility.
 *
 * When we have an boxshot, we don't display the image until
 * it's in the viewport. This CSS class takes care of keeping it hidden.
 *
 * Removing it will set opacity to 1 with a transition.
 */
.boxshot.hidden {
  opacity: 0;
}
`;

export const movieCarousel = Component(MovieCarousel, ["movies", "isinview"]);
