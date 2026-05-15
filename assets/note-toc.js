(function () {
  function ensureHeadingId(heading, index) {
    if (!heading.id) {
      heading.id = "note-section-" + String(index + 1).padStart(2, "0");
    }
    return heading.id;
  }

  function createToc(article) {
    if (article.querySelector(".note-toc")) return;

    var headings = Array.prototype.filter.call(article.children, function (element) {
      return element.tagName === "H2" || element.tagName === "H3";
    });

    if (!headings.length) return;

    var nav = document.createElement("nav");
    nav.className = "note-toc";
    nav.setAttribute("aria-label", "개념노트 목차");

    var title = document.createElement("div");
    title.className = "note-toc-title";
    title.innerHTML = "<span>목차</span><strong>시험 전 빠른 점검</strong>";

    var list = document.createElement("ol");
    list.className = "note-toc-list";

    var h2Count = 0;
    var h3Count = 0;

    headings.forEach(function (heading, index) {
      var isMain = heading.tagName === "H2";
      if (isMain) {
        h2Count += 1;
        h3Count = 0;
      } else {
        h3Count += 1;
      }

      var number = isMain
        ? String(h2Count).padStart(2, "0")
        : h2Count + "." + h3Count;

      heading.dataset.noteIndex = number;
      ensureHeadingId(heading, index);

      var item = document.createElement("li");
      item.className = isMain ? "toc-level-2" : "toc-level-3";

      var link = document.createElement("a");
      link.href = "#" + heading.id;

      var badge = document.createElement("span");
      badge.className = "toc-number";
      badge.textContent = number;

      var label = document.createElement("span");
      label.textContent = heading.textContent.trim();

      link.appendChild(badge);
      link.appendChild(label);
      item.appendChild(link);
      list.appendChild(item);
    });

    nav.appendChild(title);
    nav.appendChild(list);
    article.insertBefore(nav, article.firstElementChild);
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".subject-note article"), createToc);
  });
})();
