(function (context, parent) {
  var $monolog,
  $mainContainer,
  $subContainer;
  var interval;
  var onOpening,
  onOpened,
  onClosing,
  onClosed,
  respectiveClose;
  var Monolog = function (params) {
    if (!params)
      return;
    var content = (params.content !== undefined ? params.content : '');
    var loader = (params.loader === true);
    onOpening = typeof params.onOpening === 'function' ? params.onOpening.bind(this) : emptyFunction;
    onOpened = typeof params.onOpened === 'function' ? params.onOpened.bind(this) : emptyFunction;
    onClosing = typeof params.onClosing === 'function' ? params.onClosing.bind(this) : emptyFunction;
    onClosed = typeof params.onClosed === 'function' ? params.onClosed.bind(this) : emptyFunction;
    $subContainer = parseElement('<div class="monolog-sub-container"></div>');
    $subContainer.innerHTML = (loader ? '<div class="monolog-loader"></div>' : content);
    $mainContainer = parseElement('<div class="monolog-main-container"></div>');
    $mainContainer.appendChild($subContainer);
    $monolog = parseElement('<div class="monolog"></div>');
    $monolog.appendChild($mainContainer);
    if (params.close !== false) {
      var $closeButton = parseElement('<div class="monolog-close">&times;</div>');
      $closeButton.addEventListener('click', this.close);
      $monolog.appendChild($closeButton);
    }
    $monolog.style.opacity = 0;
  };
  function emptyFunction() {}
  function parseElement(html) {
    if (typeof html !== 'string' || html.trim() === '')
      return '';
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstElementChild;
  }
  Monolog.prototype.show = function (time) {
    if ($monolog.style.opacity > 0)
      return;
    onOpening();
    time = (time === undefined) ? 300 : time;
    $monolog.setAttribute('class', 'monolog monolog-fade-in');
    $monolog.style.animationDuration = time + 'ms';
    $monolog.style.opacity = 1;
    document.body.appendChild($monolog);
    respectiveClose = this.hide.bind(this, time);
    setTimeout((function () {
        clearInterval(interval);
        onOpened();
      }).bind(this), time);
  };
  Monolog.prototype.hide = function (time) {
    if ($monolog.style.opacity < 1)
      return;
    onClosing();
    time = (time === undefined) ? 300 : time;
    $monolog.setAttribute('class', 'monolog monolog-fade-out');
    $monolog.style.animationDuration = time + 'ms';
    $monolog.style.opacity = 0;
    setTimeout((function () {
        clearInterval(interval);
        document.body.removeChild($monolog);
        onClosed();
      }).bind(this), time);
  };
  Monolog.prototype.close = function () {
    respectiveClose();
  };
  Monolog.prototype.setContent = function (content) {
    $subContainer.innerHTML = String(content).trim();
  };
  context.Monolog = Monolog.bind(undefined);
})(window, document.body);
