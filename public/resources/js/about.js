(function () {
  const slides = Array.from(document.querySelectorAll('.adf-t-slide'));  const dots = Array.from(document.querySelectorAll('.adf-t-dot'));
  if (!slides.length) return;

  let slideIdx = 0;
  let slideTimer;

  function showSlide(i) {
    slideIdx = i;
    slides.forEach((s, n) => s.classList.toggle('adf-t-active', n === i));
    dots.forEach((d, n) => d.classList.toggle('adf-t-dot-active', n === i));
  }

  function nextSlide() {
    showSlide((slideIdx + 1) % slides.length);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.i));
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 6000);
    });
  });

  if (slides.length > 1) {
    slideTimer = setInterval(nextSlide, 6000);
  }
})();
