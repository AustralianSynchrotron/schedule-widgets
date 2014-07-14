

class ScheduleScrollableVisitModel
  constructor: (data) ->
    # data
    @id = ko.observable(data.id)
    @startDate = ko.observable(moment(data.startDate))
    @endDate = ko.observable(moment(data.endDate))
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()


class ScheduleScrollableExperimentModel
  constructor: (data, startDate, endDate) ->
    # data
    @id = ko.observable(data.id)
    @shortname = ko.observable(data.shortname)
    @longname = ko.observable(data.longname)
    @startDate = ko.observable(startDate)
    @endDate = ko.observable(endDate)

    # computed data
    @startDateIso = ko.computed => @startDate().toISOString()
    @endDateIso = ko.computed => @endDate().toISOString()
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()
    @visits = ko.observableArray([]);

    # operations
    @loadVisits()

    @id.subscribe = (newValue) =>
      console.log(newValue)

  loadVisits: =>
    $.getJSON "/api/visits?expId=#{@id()}&startDate=#{@startDateIso()}&endDate=#{@endDateIso()}", (data) =>
      @visits($.map data.visits, (item) => new ScheduleScrollableVisitModel(item))


class ScheduleScrollableViewModel
  constructor: (startDate, endDate) ->
    # data
    @startDate = ko.observable(moment(startDate))
    @endDate = ko.observable(moment(endDate))
    @pxSecScale = ko.observable(0.01)

    # computed data
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()
    @experiments = ko.observableArray([]);

    # operations
    @loadExperiments()

  test: =>
    @pxSecScale(@pxSecScale()*5.0)

  loadExperiments: =>
    $.getJSON "/api/experiments", (data) =>
      @experiments($.map data.experiments, (item) => new ScheduleScrollableExperimentModel(item, @startDate(), @endDate()))




$ ->
  scheduleScrollableViewModel = new ScheduleScrollableViewModel(
    moment().subtract('h', 2).toISOString(),
    moment().add('d', 1).toISOString()
  )

  scheduleScrollableViewModel.loadExperiments()
  ko.applyBindings(scheduleScrollableViewModel)
