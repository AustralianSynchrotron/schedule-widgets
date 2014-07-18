
ko.bindingHandlers.hidden = {
    update: (element, valueAccessor)  ->
      valueUnwrapped = ko.unwrap(valueAccessor())
      ko.bindingHandlers.visible.update element, -> !valueUnwrapped
}

ko.bindingHandlers.date = {
  update: (element, valueAccessor, bindingHandlers, viewModel, bindingContext) ->
    pattern = bindingHandlers().format or 'DD/MM/YYYY'
    valueUnwrapped = ko.unwrap(valueAccessor())
    output = "-"
    if valueUnwrapped?
      output = moment(valueUnwrapped).format(pattern)
      if $(element).is("input")
        $(element).val(output)
      else
        $(element).text(output)
}
