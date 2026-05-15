(function () {
  "use strict";

  var STORAGE_KEY = "adspStudyData";

  function defaultData() {
    return {
      version: 1,
      totalAnswered: 0,
      correctCount: 0,
      wrongCount: 0,
      lastStudiedAt: null,
      bySubject: {},
      byCategory: {},
      wrongQuestions: {},
      sessions: []
    };
  }

  function ensureBucket(collection, key) {
    var safeKey = key || "미분류";
    if (!collection[safeKey]) {
      collection[safeKey] = { answered: 0, correct: 0, wrong: 0 };
    }
    return collection[safeKey];
  }

  function mergeData(raw) {
    var base = defaultData();
    if (!raw || typeof raw !== "object") {
      return base;
    }
    return Object.assign(base, raw, {
      bySubject: raw.bySubject || {},
      byCategory: raw.byCategory || {},
      wrongQuestions: raw.wrongQuestions || {},
      sessions: Array.isArray(raw.sessions) ? raw.sessions : []
    });
  }

  function getStudyData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return mergeData(raw ? JSON.parse(raw) : null);
    } catch (error) {
      return defaultData();
    }
  }

  function saveStudyData(data) {
    var normalized = mergeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetStudyData() {
    var data = defaultData();
    saveStudyData(data);
    return data;
  }

  function recordAnswer(questionInfo) {
    var data = getStudyData();
    var now = questionInfo.answeredAt || new Date().toISOString();
    var isCorrect = Boolean(questionInfo.isCorrect);
    var subject = questionInfo.subject || "미분류";
    var category = questionInfo.category || "미분류";
    var id = questionInfo.questionId;
    var record = Object.assign({}, questionInfo, {
      subject: subject,
      category: category,
      isCorrect: isCorrect,
      answeredAt: now
    });

    data.totalAnswered += 1;
    if (isCorrect) {
      data.correctCount += 1;
    } else {
      data.wrongCount += 1;
    }
    data.lastStudiedAt = now;

    var subjectBucket = ensureBucket(data.bySubject, subject);
    var categoryBucket = ensureBucket(data.byCategory, category);
    subjectBucket.answered += 1;
    categoryBucket.answered += 1;
    if (isCorrect) {
      subjectBucket.correct += 1;
      categoryBucket.correct += 1;
    } else {
      subjectBucket.wrong += 1;
      categoryBucket.wrong += 1;
    }

    if (id) {
      if (isCorrect) {
        delete data.wrongQuestions[id];
      } else {
        data.wrongQuestions[id] = record;
      }
    }

    data.sessions.unshift(record);
    data.sessions = data.sessions.slice(0, 100);
    return saveStudyData(data);
  }

  function exportStudyData() {
    return JSON.stringify(getStudyData(), null, 2);
  }

  window.ADSPStorage = {
    getStudyData: getStudyData,
    saveStudyData: saveStudyData,
    resetStudyData: resetStudyData,
    recordAnswer: recordAnswer,
    exportStudyData: exportStudyData
  };

  window.getStudyData = getStudyData;
  window.saveStudyData = saveStudyData;
  window.resetStudyData = resetStudyData;
  window.recordAnswer = recordAnswer;
  window.exportStudyData = exportStudyData;
})();
