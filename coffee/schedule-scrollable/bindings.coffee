
ko.bindingHandlers.visitPosition = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    startDate = bindingContext.$data.startDateUnix() - bindingContext.$root.startDateUnix()
    duration = bindingContext.$data.endDateUnix() - bindingContext.$data.startDateUnix()
    $(element).css({left: startDate * bindingContext.$root.secPxScale()})
    $(element).width(duration * bindingContext.$root.secPxScale())
}

ko.bindingHandlers.timeMarkerPosition = {
  init: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    setInterval ->
      current_time = moment().unix() - bindingContext.$root.startDateUnix()
      $(element).css({left: current_time * bindingContext.$root.secPxScale()})
    , 30000

  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    current_time = moment().unix() - bindingContext.$root.startDateUnix()
    $(element).css({left: current_time * bindingContext.$root.secPxScale()})
}

ko.bindingHandlers.headerTimePosition = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    startDate = bindingContext.$data.headerDate.unix() - bindingContext.$root.startDateUnix()
    $(element).css({left: startDate * bindingContext.$root.secPxScale()})
}

ko.bindingHandlers.scrollSource = {
  init: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    # centre around current date
    bindingContext.$root.scrollToToday($(element.parentNode).width())

    # attach the draggable callback
    interact element
    .draggable {
        onmove: (event) ->
          bindingContext.$root.visibleStartDate(bindingContext.$root.visibleStartDate().subtract('s', event.dx / bindingContext.$root.secPxScale()))
          bindingContext.$root.visibleEndDate(bindingContext.$root.visibleEndDate().subtract('s', event.dx / bindingContext.$root.secPxScale()))
    }
    #.inertia true
    .restrict {
        drag: element.parentNode,
        endOnly: false
    }
}

ko.bindingHandlers.scrollTarget = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    offset = (bindingContext.$root.startDateUnix() - bindingContext.$root.visibleStartDateUnix()) * bindingContext.$root.secPxScale()
    element.style.webkitTransform =
    element.style.transform = "translate(#{offset}px, 0)"
}

ko.bindingHandlers.scrollWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    $(element).width((bindingContext.$root.endDateUnix()-bindingContext.$root.startDateUnix()) * bindingContext.$root.secPxScale())
}
