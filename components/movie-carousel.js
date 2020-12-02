import { Component } from "../framework/component.js";
import { IsInView } from "../utilities/is-in-view.js";

import { movieCard } from "./movie-card.js";

/**
 * Movie carousel component that renders a horizontal row of boxshots
 */
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

  onPropsChanged(props) {
    if (!Array.isArray(props.movies)) {
      return;
    }

    // Due to a bug in reconciliation
    // By using logical state refresh, we wouldnt be able to trigger
    // the transition as the nodes are different. However in an ideal
    // framework, these nodes should remain same by reference
    if (props.isinview) {
      const element = this.ref.querySelector(".hidden");
      if (element) element.classList.remove("hidden");
    }

    this.updateState({ movies: props.movies });
  }

  render() {
    const { movies } = this.getState();

    const children = movies
      .map((movieId) => movieCard({ "movie-id": movieId }))
      .join("");

    return `
      <div class="row-videos hidden" role="row">
        ${children}
      </div>`;
  }
}

const styles = `
/**
 * Video Row Container.
 *
 * We stack each row on top of each other in the gallery. Inside we place the image boxshots.
 */
.row-videos {
  margin: 1rem 0;
  display: inline-flex;
  opacity: 1;
  transition: opacity 1s;
}

/**
 * Video Row Container Visibility.
 *
 * When we have an row, we don't display it until
 * it's in the viewport. This CSS class takes care of keeping it hidden.
 *
 * Removing it will set opacity to 1 with a transition.
 */
.row-videos.hidden {
  opacity: 0;
}

/**
 * An example of how a host would add styles to a web component.
 * Since the movie component isn't aware of where it is executing,
 * the host needs to determine on how the external styles look.
 */
movie-card {
  margin-right: 0.3rem;
}

movie-card:last-child {
  margin-right: 0;
}
`;

export const movieCarousel = Component(
  MovieCarousel,
  ["movies", "isinview"],
  styles
);
