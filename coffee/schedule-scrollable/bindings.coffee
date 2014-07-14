
ko.bindingHandlers.visitPosition = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    startDate = bindingContext.$data.startDateUnix() - bindingContext.$parent.startDateUnix()
    duration = bindingContext.$data.endDateUnix() - bindingContext.$data.startDateUnix()
    $(element).css({left: startDate * bindingContext.$root.pxSecScale()})
    $(element).width(duration * bindingContext.$root.pxSecScale())
}

ko.bindingHandlers.timeMarkerPosition = {
  init: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    setInterval ->
      current_time = moment().unix() - bindingContext.$root.startDateUnix()
      $(element).css({left: current_time * bindingContext.$root.pxSecScale()})
    , 30000

  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    current_time = moment().unix() - bindingContext.$root.startDateUnix()
    $(element).css({left: current_time * bindingContext.$root.pxSecScale()})
}
