(function () {
  "use strict";

  var config = window.ADSP_CBT_CONFIG || {};
  var questions = Array.isArray(config.questions) ? config.questions : [];
  var state = {
    subject: "전체",
    category: "전체",
    mode: "single",
    current: 0,
    answers: {},
    checked: {}
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return a.localeCompare(b, "ko");
    });
  }

  function filteredQuestions() {
    return questions.filter(function (question) {
      var subjectOk = state.subject === "전체" || question.subject === state.subject;
      var categoryOk = state.category === "전체" || question.category === state.category;
      return subjectOk && categoryOk;
    });
  }

  function setSelectOptions(select, values, currentValue) {
    select.innerHTML = "";
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = values.includes(currentValue) ? currentValue : "전체";
  }

  function setupFilters() {
    var subjectSelect = byId("subjectFilter");
    var categorySelect = byId("categoryFilter");
    setSelectOptions(subjectSelect, ["전체"].concat(unique(questions.map(function (q) { return q.subject; }))), state.subject);
    updateCategoryOptions();

    subjectSelect.addEventListener("change", function () {
      state.subject = subjectSelect.value;
      state.category = "전체";
      state.current = 0;
      updateCategoryOptions();
      render();
    });

    categorySelect.addEventListener("change", function () {
      state.category = categorySelect.value;
      state.current = 0;
      render();
    });
  }

  function updateCategoryOptions() {
    var scoped = questions.filter(function (question) {
      return state.subject === "전체" || question.subject === state.subject;
    });
    setSelectOptions(byId("categoryFilter"), ["전체"].concat(unique(scoped.map(function (q) { return q.category; }))), state.category);
  }

  function renderNumberNav(list) {
    var nav = byId("numberNav");
    nav.innerHTML = "";
    list.forEach(function (question, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = String(index + 1);
      button.className = [
        index === state.current ? "current" : "",
        state.answers[question.id] ? "answered" : "",
        state.checked[question.id] ? "checked" : ""
      ].join(" ").trim();
      button.addEventListener("click", function () {
        state.current = index;
        state.mode = "single";
        updateModeButtons();
        render();
      });
      nav.appendChild(button);
    });
  }

  function renderQuestion(question, index, total) {
    var selected = state.answers[question.id];
    var isChecked = Boolean(state.checked[question.id]);
    var selectedIsCorrect = selected === question.answer;
    var card = document.createElement("section");
    card.className = "question-card";
    card.dataset.questionId = question.id;

    var choices = question.choices.map(function (choice, choiceIndex) {
      var number = choiceIndex + 1;
      var className = "choice";
      if (isChecked && number === question.answer) {
        className += " correct";
      }
      if (isChecked && selected === number && selected !== question.answer) {
        className += " wrong";
      }
      return [
        '<label class="' + className + '">',
        '<input type="radio" name="' + question.id + '" value="' + number + '"' + (selected === number ? " checked" : "") + (isChecked ? " disabled" : "") + ">",
        '<span>' + number + ". " + escapeHtml(choice) + "</span>",
        "</label>"
      ].join("");
    }).join("");

    card.innerHTML = [
      '<div class="question-meta">',
      '<span class="tag">' + escapeHtml(question.id) + "</span>",
      '<span class="tag">' + escapeHtml(question.subject) + "</span>",
      '<span class="tag">' + escapeHtml(question.category) + "</span>",
      '<span>' + (index + 1) + " / " + total + "</span>",
      "</div>",
      '<p class="question-text">' + escapeHtml(question.question) + "</p>",
      renderQuestionSupplement(question),
      '<div class="choices">' + choices + "</div>",
      '<div class="question-actions">',
      '<button type="button" class="primary check-button"' + (selected && !isChecked ? "" : " disabled") + ">" + (isChecked ? "확인 완료" : "정답 확인") + "</button>",
      "</div>",
      '<div class="answer-panel' + (isChecked ? " show " + (selectedIsCorrect ? "correct" : "wrong") : "") + '">',
      isChecked ? renderExplanation(question, selected, selectedIsCorrect) : "",
      "</div>"
    ].join("");

    card.querySelectorAll("input[type='radio']").forEach(function (input) {
      input.addEventListener("change", function () {
        state.answers[question.id] = Number(input.value);
        render();
      });
    });

    card.querySelector(".check-button").addEventListener("click", function () {
      checkQuestion(question);
    });

    return card;
  }

  function renderQuestionSupplement(question) {
    var parts = [];
    if (Array.isArray(question.context) && question.context.length) {
      question.context.forEach(function (line) {
        parts.push("<p>" + escapeHtml(line) + "</p>");
      });
    }
    if (question.formula) {
      var formulas = Array.isArray(question.formula) ? question.formula : [question.formula];
      parts.push('<div class="formula-box">' + formulas.map(function (formula) {
        return "<code>" + escapeHtml(formula) + "</code>";
      }).join("") + "</div>");
    }
    if (question.table) {
      parts.push(renderQuestionTable(question.table));
    }
    return parts.length ? '<div class="question-supplement">' + parts.join("") + "</div>" : "";
  }

  function renderQuestionTable(table) {
    var headers = Array.isArray(table.headers) ? table.headers : [];
    var rows = Array.isArray(table.rows) ? table.rows : [];
    return [
      '<div class="question-table-wrap">',
      table.caption ? '<div class="question-table-caption">' + escapeHtml(table.caption) + "</div>" : "",
      "<table>",
      headers.length ? "<thead><tr>" + headers.map(function (header) {
        return "<th>" + escapeHtml(header) + "</th>";
      }).join("") + "</tr></thead>" : "",
      "<tbody>",
      rows.map(function (row) {
        return "<tr>" + row.map(function (cell) {
          return "<td>" + escapeHtml(cell) + "</td>";
        }).join("") + "</tr>";
      }).join(""),
      "</tbody>",
      "</table>",
      "</div>"
    ].join("");
  }

  function renderExplanation(question, selected, selectedIsCorrect) {
    var selectedText = question.choices[selected - 1] || "미선택";
    var correctText = question.choices[question.answer - 1] || "";
    return [
      '<p><strong class="' + (selectedIsCorrect ? "status-ok" : "status-bad") + '">' + (selectedIsCorrect ? "정답입니다." : "오답입니다.") + "</strong></p>",
      "<p>내 답: " + selected + ". " + escapeHtml(selectedText) + "</p>",
      "<p>정답: " + question.answer + ". " + escapeHtml(correctText) + "</p>",
      "<p>해설: " + escapeHtml(question.explanation) + "</p>",
      '<p class="footer-note">출처: ' + escapeHtml(question.source || "학습용 예상문제") + "</p>"
    ].join("");
  }

  function checkQuestion(question) {
    var selected = state.answers[question.id];
    if (!selected) {
      return;
    }
    state.checked[question.id] = true;
    window.ADSPStorage.recordAnswer({
      questionId: question.id,
      questionText: question.question,
      subject: question.subject,
      category: question.category,
      selectedAnswer: selected,
      selectedAnswerText: question.choices[selected - 1],
      correctAnswer: question.answer,
      correctAnswerText: question.choices[question.answer - 1],
      isCorrect: selected === question.answer,
      explanation: question.explanation,
      source: question.source,
      answeredAt: new Date().toISOString()
    });
    render();
    showFinalResultIfComplete();
  }

  function render() {
    var list = filteredQuestions();
    var shell = byId("questionShell");
    var summary = byId("cbtSummary");
    shell.innerHTML = "";
    if (state.current >= list.length) {
      state.current = Math.max(0, list.length - 1);
    }

    summary.textContent = "표시 문제 " + list.length + "개 / 전체 " + questions.length + "개";
    renderNumberNav(list);

    if (!list.length) {
      shell.innerHTML = '<div class="empty">조건에 맞는 문제가 없습니다.</div>';
      return;
    }

    if (state.mode === "all") {
      list.forEach(function (question, index) {
        shell.appendChild(renderQuestion(question, index, list.length));
      });
    } else {
      shell.appendChild(renderQuestion(list[state.current], state.current, list.length));
    }
  }

  function updateModeButtons() {
    byId("singleMode").classList.toggle("active", state.mode === "single");
    byId("allMode").classList.toggle("active", state.mode === "all");
  }

  function ensureShuffleButton() {
    if (byId("shuffleButton")) {
      return;
    }
    var button = document.createElement("button");
    button.type = "button";
    button.id = "shuffleButton";
    button.className = "secondary";
    button.textContent = "문제 섞기";

    var nextButton = byId("nextQuestion");
    var toolbar = nextButton ? nextButton.parentNode : document.querySelector(".toolbar");
    if (nextButton && toolbar) {
      toolbar.insertBefore(button, nextButton.nextSibling);
    } else if (toolbar) {
      toolbar.appendChild(button);
    }
  }

  function shuffleQuestions() {
    for (var index = questions.length - 1; index > 0; index -= 1) {
      var swapIndex = Math.floor(Math.random() * (index + 1));
      var temp = questions[index];
      questions[index] = questions[swapIndex];
      questions[swapIndex] = temp;
    }
  }

  function buildScoreSummary(list) {
    var subjectStats = {};
    var answered = list.filter(function (question) {
      return state.checked[question.id];
    });
    var correct = answered.filter(function (question) {
      return state.answers[question.id] === question.answer;
    });

    list.forEach(function (question) {
      if (!subjectStats[question.subject]) {
        subjectStats[question.subject] = { total: 0, answered: 0, correct: 0 };
      }
      subjectStats[question.subject].total += 1;
      if (state.checked[question.id]) {
        subjectStats[question.subject].answered += 1;
        if (state.answers[question.id] === question.answer) {
          subjectStats[question.subject].correct += 1;
        }
      }
    });

    return {
      total: list.length,
      answered: answered.length,
      correct: correct.length,
      rate: answered.length ? Math.round((correct.length / answered.length) * 100) : 0,
      subjectStats: subjectStats
    };
  }

  function renderScoreSummary(list, title) {
    var summary = buildScoreSummary(list);
    var subjectRows = Object.keys(summary.subjectStats).sort(function (a, b) {
      return a.localeCompare(b, "ko");
    }).map(function (subject) {
      var item = summary.subjectStats[subject];
      var subjectRate = item.answered ? Math.round((item.correct / item.answered) * 100) : 0;
      return "<tr><td>" + escapeHtml(subject) + "</td><td>" + item.answered + " / " + item.total + "</td><td>" + item.correct + "</td><td>" + subjectRate + "%</td></tr>";
    }).join("");

    byId("scoreResult").innerHTML = [
      '<div class="score-summary">',
      "<h3>" + escapeHtml(title) + "</h3>",
      '<div class="score-metrics">',
      '<div class="metric"><strong>' + summary.correct + " / " + summary.total + '</strong><span>전체 정답</span></div>',
      '<div class="metric"><strong>' + summary.rate + '%</strong><span>정답률</span></div>',
      '<div class="metric"><strong>' + summary.answered + " / " + summary.total + '</strong><span>확인 완료</span></div>',
      "</div>",
      "<table><thead><tr><th>과목</th><th>풀이</th><th>정답</th><th>정답률</th></tr></thead><tbody>",
      subjectRows,
      "</tbody></table>",
      summary.answered < summary.total ? '<p class="footer-note">아직 정답 확인을 누르지 않은 문제가 있습니다.</p>' : "",
      "</div>"
    ].join("");
  }

  function showFinalResultIfComplete() {
    var list = filteredQuestions();
    if (list.length && list.every(function (question) { return state.checked[question.id]; })) {
      renderScoreSummary(list, "전체 결과");
    }
  }

  function bindActions() {
    ensureShuffleButton();
    byId("singleMode").addEventListener("click", function () {
      state.mode = "single";
      updateModeButtons();
      render();
    });
    byId("allMode").addEventListener("click", function () {
      state.mode = "all";
      updateModeButtons();
      render();
    });
    byId("prevQuestion").addEventListener("click", function () {
      state.current = Math.max(0, state.current - 1);
      state.mode = "single";
      updateModeButtons();
      render();
    });
    byId("nextQuestion").addEventListener("click", function () {
      state.current = Math.min(filteredQuestions().length - 1, state.current + 1);
      state.mode = "single";
      updateModeButtons();
      render();
    });
    byId("shuffleButton").addEventListener("click", function () {
      shuffleQuestions();
      state.current = 0;
      state.mode = "single";
      byId("scoreResult").textContent = "문제 순서를 무작위로 섞었습니다. 선택한 답과 오답 기록은 문제 ID 기준으로 유지됩니다.";
      updateModeButtons();
      render();
    });
    byId("scoreButton").addEventListener("click", function () {
      var list = filteredQuestions();
      renderScoreSummary(list, "현재 필터 기준 결과");
    });
    byId("resetButton").addEventListener("click", function () {
      state.answers = {};
      state.checked = {};
      byId("scoreResult").textContent = "";
      render();
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    byId("pageTitle").textContent = config.title || "ADsP CBT";
    setupFilters();
    bindActions();
    updateModeButtons();
    render();
  });
})();
