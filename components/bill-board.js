import { queryBillBoard } from "../state/store.js";
import { Component } from "../framework/component.js";
import { IsInView } from "../utilities/is-in-view.js";

/**
 * Renders a billboard either inline or a non-inline
 */
class BillBoard {
  constructor(getState, updateState, _notify, ref) {
    this.getState = getState;
    this.updateState = updateState;
    this.ref = ref;
  }

  onMount() {
    // Mark the current host to be tracked via the IsInView library
    this.dispose = IsInView(this.ref.host);
  }

  onUnmount() {
    // Dispose the observer if still running
    this.dispose();
  }

  onPropsChanged({
    "movie-id": movieId,
    "billboard-id": billBoardId,
    isinview: isInView,
  }) {
    if (movieId == null || billBoardId == null) {
      return;
    }

    // Due to a bug in reconciliation
    // By using logical state refresh, we wouldnt be able to trigger
    // the transition as the nodes are different. However in an ideal
    // framework, these nodes should remain same by reference
    if (isInView) {
      const hiddenElement = this.ref.querySelector(".hidden");
      if (hiddenElement) hiddenElement.classList.remove("hidden");
    }

    const { billBoard, movie } = queryBillBoard(billBoardId, movieId);
    if (!billBoard || !movie) {
      return;
    }

    this.updateState({ billBoard, movie });
  }

  render() {
    const {
      billBoard: { type },
    } = this.getState();

    if (type === "inline") {
      return this.renderInlineBillBoard();
    }

    return this.renderHeroBillBoard();
  }

  renderInlineBillBoard() {
    const { movie } = this.getState();
    const { title, logo, backgroundShort } = movie;

    // potential optmization to load box shot first and then
    // swap to the actual image
    return `
      <div class="row-billboard row-billboard-inline" aria-label="${title}" tabindex="0" role="row" aria-label="${title}">
        <div id="billboard-background" class="billboard-background" style="background-image: url('${backgroundShort}')" title="${title}" alt="${title}">        
        </div>
        <div class="billboard-metadata hidden">
          <img loading="lazy" class="billboard-metadata-logo" alt="${title}" src="${logo}"></img>
          ${this.renderButtons()}
        </div>
      </div>`;
  }

  renderHeroBillBoard() {
    const { movie } = this.getState();
    const { title, synopsis, logo, background } = movie;

    // potential optmization to load box shot first and then
    // swap to the actual image
    return `
      <div class="row-billboard" aria-label="${title}, ${synopsis}" tabindex="0" role="row">
        <div class="billboard-background" style="background-image: url('${background}')">        
        </div>
        <div class="billboard-metadata">
          <img alt="${title}" class="billboard-metadata-logo" title="${title}" src="${logo}"></img>
          <div class="billboard-metadata-synopsis">${synopsis}</div>
          ${this.renderButtons()}
        </div>
      </div>`;
  }

  renderButtons() {
    const {
      billBoard: { buttons },
    } = this.getState();

    return buttons
      .map(
        ({ type, text }) =>
          `<button class="billboard-metadata-button ${
            type === "play" ? "billboard-metadata-button-play" : ""
          }" aria-label="${text}" title="${text}">
        ${text}
      </button>`
      )
      .join("");
  }
}

const styles = `
/**
 * Billboard Row Container.
 *
 * Container for the billboard image and metadata block.
 */
.row-billboard {
  position: relative;
}

/**
 * Billboard Background Image.
 *
 * The actual image element for the billboard.
 */
.billboard-background {
  width: 128rem;
  height: 72rem;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

/**
 * Billboard Metadata Container.
 *
 * Contains the logo, synopsis and action buttons.
 */
.billboard-metadata {
  position: absolute;
  top: 8rem;
  left: 8rem;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: opacity 1s, transform 1s;
}

/**
 * Billboard Metadata Container Visibility.
 *
 * When we have an inline billboard, we don't display the metadata container until
 * it's in the viewport. This CSS class takes care of keeping it hidden.
 *
 * Removing it will set opacity to 1 with a transition.
 */
.billboard-metadata.hidden {
  opacity: 0;
  transform: translate3d(1rem, 0, 0);
}

/**
 * Logo element
 */
.billboard-metadata-logo {
  display: block;
}

/**
 * Synopsis Text
 */
.billboard-metadata-synopsis {
  max-width: 50rem;
  font-size: 2rem;
  margin: 2rem 0;
}

/**
 * Metadata Buttons
 */
.billboard-metadata-button {
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  margin: 2rem 1.5rem 0 0;
  padding: 1rem 2.5rem;
  color: #fff;
  border: 0.1rem solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0.1rem 0.2rem rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.4);
}

/**
 * Special Red Play Metadata Button
 */
.billboard-metadata-button-play {
  background-color: #ff0a16;
  border-color: #ff0a16;
}

/**
 * Custom inline billboard
 */
.row-billboard-inline .billboard-background {
  height: 19.2rem;
}

.row-billboard-inline .billboard-metadata {
  top: 1.5rem;
  right: 5rem;
  left: auto;
}
`;

export const billBoard = Component(
  BillBoard,
  ["movie-id", "billboard-id", "isinview"],
  styles
);
