ko.bindingHandlers.dayWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    $(element).width("#{100.0 / (bindingContext.$root.numberWeeksPerCalendarRow()*7)}%")
}

ko.bindingHandlers.monthWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    valueUnwrapped = ko.unwrap(valueAccessor())
    $(element).width("#{valueUnwrapped * 100.0 / (bindingContext.$root.numberWeeksPerCalendarRow()*7)}%")
}