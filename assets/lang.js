/*
 * Page language (English / Turkish).
 *
 * Every page holds both languages: elements marked data-l="en" or data-l="tr"
 * are hidden by style.css unless they match <html lang>. This script picks the
 * language before the page is drawn, in this order:
 *   1. #english / #turkce in the URL (links into the privacy policy)
 *   2. the visitor's own earlier choice (saved only when they press a button)
 *   3. the browser's language list
 *   4. English
 * It also swaps the document title (data-title-en / data-title-tr on <html>)
 * and aria-labels (data-aria-en / data-aria-tr). Without JavaScript the page
 * stays in English.
 */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'tr'];
  var FALLBACK = 'en';
  var KEY = 'duka.lang';
  var HASHES = { '#english': 'en', '#turkce': 'tr' };
  var root = document.documentElement;

  function isSupported(lang) { return SUPPORTED.indexOf(lang) !== -1; }

  function savedLang() {
    try {
      var v = localStorage.getItem(KEY);
      return isSupported(v) ? v : null;
    } catch (e) { return null; }
  }

  function saveLang(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage blocked */ }
  }

  function browserLang() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).slice(0, 2).toLowerCase();
      if (isSupported(code)) return code;
    }
    return FALLBACK;
  }

  function syncDom(lang) {
    var labelled = document.querySelectorAll('[data-aria-' + lang + ']');
    for (var i = 0; i < labelled.length; i++) {
      labelled[i].setAttribute('aria-label', labelled[i].getAttribute('data-aria-' + lang));
    }
    var buttons = document.querySelectorAll('button[data-set-lang]');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute('aria-pressed', String(buttons[j].getAttribute('data-set-lang') === lang));
    }
  }

  function setLang(lang) {
    root.lang = lang;
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    if (document.readyState !== 'loading') syncDom(lang);
  }

  root.setAttribute('data-js', '');
  setLang(HASHES[location.hash] || savedLang() || browserLang());

  document.addEventListener('DOMContentLoaded', function () {
    syncDom(root.lang);
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-set-lang]');
      if (!el) return;
      var lang = el.getAttribute('data-set-lang');
      if (!isSupported(lang)) return;
      setLang(lang);
      saveLang(lang);
    });
  });

  window.addEventListener('hashchange', function () {
    if (HASHES[location.hash]) setLang(HASHES[location.hash]);
  });
})();
