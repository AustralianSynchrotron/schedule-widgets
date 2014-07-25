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
      rowStartUnix = moment(rowStartDate()).startOf('day').unix()
      rowSeconds = bindingContext.$root.numberWeeksPerCalendarRow() * 604800
      startOffset = bindingContext.$data.startDateUnix() - rowStartUnix
      endOffset = bindingContext.$data.endDateUnix() - rowStartUnix
      $(element).css({left: "#{100.0*startOffset/rowSeconds}%"})
      $(element).width("#{100.0*(endOffset-startOffset)/rowSeconds}%")
}

ko.bindingHandlers.blTimeMarkerPosition = {
  init: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    setInterval ->
      rowStartDate = bindingHandlers().blRowStartDate or null
      if rowStartDate?
        rowStartUnix = moment(rowStartDate()).startOf('day').unix()
        rowSeconds = bindingContext.$root.numberWeeksPerCalendarRow() * 604800
        current_time = moment().unix() - rowStartUnix
        if current_time >= 0
          $(element).css({left: "#{100.0*current_time/rowSeconds}%"})
          $(element).show()
        else
          $(element).hide()
    , 30000

  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    rowStartDate = bindingHandlers().blRowStartDate or null
    if rowStartDate?
      rowStartUnix = moment(rowStartDate()).startOf('day').unix()
      rowSeconds = bindingContext.$root.numberWeeksPerCalendarRow() * 604800
      current_time = moment().unix() - rowStartUnix
      if current_time >= 0
        $(element).css({left: "#{100.0*current_time/rowSeconds}%"})
        $(element).show()
      else
        $(element).hide()
}
