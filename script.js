const root = document.getElementById("scroll-root");
const intro = document.getElementById("intro");
const panels = Array.from(document.querySelectorAll(".panel"));

const currentIndex = () => Math.round(root.scrollLeft / window.innerWidth);

const goTo = (index) => {
  const clamped = Math.min(panels.length - 1, Math.max(0, index));
  root.scrollTo({ left: panels[clamped].offsetLeft, behavior: "smooth" });
};

// Démarrer sur la section d'accueil (au centre)
window.addEventListener("load", () => {
  if (intro) root.scrollLeft = intro.offsetLeft;
});

// Convertit le scroll vertical (molette) en défilement horizontal
let isAnimating = false;

root.addEventListener(
  "wheel",
  (event) => {
    const panel = panels[currentIndex()];

    // Laisse défiler verticalement à l'intérieur d'une section trop haute
    if (panel && panel.scrollHeight > panel.clientHeight + 1) {
      const atTop = panel.scrollTop <= 0;
      const atBottom =
        panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
      if (event.deltaY > 0 && !atBottom) return;
      if (event.deltaY < 0 && !atTop) return;
    }

    if (Math.abs(event.deltaY) < 4) return;
    event.preventDefault();
    if (isAnimating) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    const next = currentIndex() + direction;
    if (next < 0 || next > panels.length - 1) return;

    isAnimating = true;
    goTo(next);
    setTimeout(() => {
      isAnimating = false;
    }, 700);
  },
  { passive: false }
);

// Navigation clavier (flèches)
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    goTo(currentIndex() + 1);
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    goTo(currentIndex() - 1);
  }
});

// Boutons de la page d'accueil
document.querySelectorAll("button[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const target = document.getElementById(targetId);
    if (!target) return;
    root.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  });
});

// Animation d'apparition du contenu des sections
const slideObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  },
  { root, threshold: 0.35 }
);

document
  .querySelectorAll("#designer, #data")
  .forEach((panel) => slideObserver.observe(panel));

// Barre du haut en sombre uniquement sur la page d'accueil (fond clair)
const topbar = document.querySelector(".topbar");
if (topbar && intro) {
  const topbarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        topbar.classList.toggle("brand-dark", entry.isIntersecting);
      });
    },
    { root, threshold: 0.5 }
  );
  topbarObserver.observe(intro);
}

// Filtres de projets par catégorie
document.querySelectorAll("[data-filter-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;

    const section = group.closest(".panel");
    const cards = section.querySelectorAll(".pcard");
    const wasActive = button.classList.contains("active");

    group
      .querySelectorAll(".filter")
      .forEach((f) => f.classList.remove("active"));

    // Re-clic sur le filtre actif : on réaffiche tout
    if (wasActive) {
      cards.forEach((card) => {
        card.style.display = "";
      });
      return;
    }

    button.classList.add("active");
    const category = button.dataset.cat;
    cards.forEach((card) => {
      const cats = (card.dataset.cat || "").split(/\s+/);
      const visible = category === "all" || cats.includes(category);
      card.style.display = visible ? "" : "none";
    });
  });
});
