ko.bindingHandlers.dayWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    $(element).width("#{100.0 / (bindingContext.$root.numberWeeksPerCalendarRow()*7)}%")
}