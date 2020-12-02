/**
 * Sets up a global intersection observer to that we can detect
 * if something is in the viewport in an efficient manner. I know
 * global = EWW but lack of a proper state management, forced me to
 * go down this path.
 */
export const setupIsInView = () => {
  if (window.__isInView__) {
    return false;
  }

  window.__isInView__ = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("isInView", "true");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px 100px 0px" }
  );

  return true;
};

/**
 * Exports a function that updates the property on the
 * target when it is in view. Again "update property" = EWW
 * but the lack of a proper reconciler forced me to go down this
 * path.
 * @param {HTMLElement} target The node to be observed
 */
export const IsInView = (target) => {
  if (
    !window.__isInView__ ||
    !(window.__isInView__ instanceof IntersectionObserver)
  ) {
    throw new Error("Please setupIsInView first");
  }

  window.__isInView__.observe(target);

  return () => {
    if (
      !window.__isInView__ ||
      !(window.__isInView__ instanceof IntersectionObserver)
    ) {
      throw new Error("Please setupIsInView first");
    }

    window.__isInView__.unobserve(target);
  };
};
