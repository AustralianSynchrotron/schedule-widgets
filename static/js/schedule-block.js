ko.subscribable.fn.subscribeChanged = function(callback) {
  var oldValue;
  oldValue = void 0;
  this.subscribe((function(_oldValue) {
    return oldValue = _oldValue;
  }), this, "beforeChange");
  return this.subscribe(function(newValue) {
    return callback(newValue, oldValue);
  });
};

ko.bindingHandlers.hidden = {
  update: function(element, valueAccessor) {
    var valueUnwrapped;
    valueUnwrapped = ko.unwrap(valueAccessor());
    return ko.bindingHandlers.visible.update(element, function() {
      return !valueUnwrapped;
    });
  }
};

ko.bindingHandlers.date = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var output, pattern, valueUnwrapped;
    pattern = bindingHandlers().format || 'DD/MM/YYYY';
    valueUnwrapped = ko.unwrap(valueAccessor());
    output = "-";
    if (valueUnwrapped != null) {
      output = moment(valueUnwrapped).format(pattern);
      if ($(element).is("input")) {
        return $(element).val(output);
      } else {
        return $(element).text(output);
      }
    }
  }
};
