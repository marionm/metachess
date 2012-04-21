var showDialog = function(selector, title, buttons, extraOptions) {
  var dialog = $(selector);

  var options = {
    title:     title,
    modal:     true,
    resizable: false,
    buttons:   buttons
  };

  options = $.extend(true, {}, options, extraOptions);

  dialog.dialog(options);
};
