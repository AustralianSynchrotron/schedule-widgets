ko.bindingHandlers.blDayWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    $(element).width("#{100.0 / (bindingContext.$root.numberWeeksPerCalendarRow()*7)}%")
}

ko.bindingHandlers.blMonthWidth = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    valueUnwrapped = ko.unwrap(valueAccessor())
    $(element).width("#{valueUnwrapped * 100.0 / (bindingContext.$root.numberWeeksPerCalendarRow()*7)}%")
}

ko.bindingHandlers.blVisitPosition = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    rowStartDate = bindingHandlers().blRowStartDate or null
    if rowStartDate?
      #console.log(moment(rowStartDate()).toISOString())
      #console.log(moment(rowStartDate()).hours(0).minutes(0).seconds(0).milliseconds(0).toISOString())
      rowStartUnix = moment(rowStartDate()).startOf('day').unix()
      rowSeconds = bindingContext.$root.numberWeeksPerCalendarRow() * 604800
      startOffset = bindingContext.$data.startDateUnix() - rowStartUnix
      endOffset = bindingContext.$data.endDateUnix() - rowStartUnix
      $(element).css({left: "#{100.0*startOffset/rowSeconds}%"})
      $(element).width("#{100.0*(endOffset-startOffset)/rowSeconds}%")
}