export const setupIsInView = () => {
  if (window.__isInView__) {
    return false;
  }

  window.__isInView__ = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log(entry);
          entry.target.src = entry.target.dataset.src;
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -200px 0px" }
  );

  return true;
};

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
