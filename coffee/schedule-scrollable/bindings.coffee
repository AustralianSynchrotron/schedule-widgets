
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

ko.bindingHandlers.scrollSource = {
  init: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    x = 0
    interact element
    .draggable {
        onmove: (event) ->
          currPos = $(element).position().left + event.dx
          currWidth = $(element).width()
          if currPos < 20 and currPos+currWidth > $(element.parentNode).width() - 20
            x += event.dx
            bindingContext.$root.scrollOffset(x)
    }
    .inertia true
    .restrict {
        drag: element.parentNode,
        endOnly: false
    }
}

ko.bindingHandlers.scrollTarget = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    element.style.webkitTransform =
    element.style.transform = "translate(#{bindingContext.$root.scrollOffset()}px, 0)"
}
