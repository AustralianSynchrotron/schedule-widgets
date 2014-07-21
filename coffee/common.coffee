ko.subscribable.fn.subscribeChanged = (callback) ->
  oldValue = undefined
  @subscribe ((_oldValue) ->
    oldValue = _oldValue
  ), this, "beforeChange"
  @subscribe (newValue) ->
    callback newValue, oldValue
