(function () {
  var path = window.location.pathname;
  var storageKey = 'adf_liked:' + path;

  function likeCountFromDom() {
    var likeEl = document.getElementById('nav-like');
    if (!likeEl) return '';
    var match = likeEl.textContent.match(/\d+/);
    return match ? match[0] : '';
  }

  function markLiked(count) {
    var likeEl = document.getElementById('nav-like');
    if (!likeEl) return;
    var value = typeof count === 'number' ? String(count) : count || likeCountFromDom();
    likeEl.innerHTML =
      '<img src="/resources/images/1x1.png" class="active" alt="">' + value;
    likeEl.classList.add('adf-liked');
    likeEl.setAttribute('aria-pressed', 'true');
  }

  function appreciateUrl() {
    var url = new URL(window.location.href);
    url.searchParams.delete('appreciate');
    url.searchParams.set('appreciate', 'true');
    return url.pathname + url.search;
  }

  function submitLike() {
    if (localStorage.getItem(storageKey)) {
      markLiked();
      return;
    }

    $.getJSON(appreciateUrl())
      .done(function (data) {
        if (!data || !data.success) return;
        localStorage.setItem(storageKey, '1');
        markLiked(data.count);
      })
      .fail(function () {
        $('#nav-like').removeClass('adf-liked').removeAttr('aria-pressed');
      });
  }

  window.saveAppreciate = function () {
    submitLike();
  };

  $(function () {
    if (!document.getElementById('nav-like')) return;

    if (localStorage.getItem(storageKey)) {
      markLiked();
    }

    $(document).off('click', '#nav-like');
    $(document).on('click', '#nav-like', function (event) {
      event.preventDefault();
      submitLike();
    });
  });
})();
