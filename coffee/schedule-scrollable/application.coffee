

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

    # computed data
    @visits = ko.observableArray([]);

    # operations
    @loadVisits(startDate, endDate)

    @id.subscribe = (newValue) =>
      console.log(newValue)

  loadVisits: (startDate, endDate) =>
    $.getJSON "/api/visits?expId=#{@id()}&startDate=#{startDate.toISOString()}&endDate=#{endDate.toISOString()}", (data) =>
      @visits($.map data.visits, (item) => new ScheduleScrollableVisitModel(item))


class ScheduleScrollableViewModel
  constructor: (startDate, endDate) ->
    # data
    @startDate = ko.observable(moment(startDate))
    @endDate = ko.observable(moment(endDate))
    @visibleStartDate = ko.observable(@startDate())
    @secPxScale = ko.observable(0.01) # seconds to pixel conversion factor

    # computed data
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()
    @visibleStartDateUnix = ko.computed => @visibleStartDate().unix()
    @experiments = ko.observableArray([]);

    # operations
    @loadExperiments()

    # subscriptions
    @startDate.subscribe = (newValue) =>
      @updateVisits()

    @endDate.subscribe = (newValue) =>
      @updateVisits()

  test: =>
    @secPxScale(@secPxScale()*5.0)

  scrollToToday: (width) =>
    @visibleStartDate(moment().subtract('s', 0.5 * width / @secPxScale()))

  scrollToTomorrow: (width) =>
    @visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / @secPxScale()))

  updateVisits: =>
    ko.utils.arrayForEach @experiments() (exp) =>
        exp.loadVisits @startDate() @endDate()

  loadExperiments: =>
    $.getJSON "/api/experiments", (data) =>
      @experiments($.map data.experiments, (item) => new ScheduleScrollableExperimentModel(item, @startDate(), @endDate()))




$ ->
  scheduleScrollableViewModel = new ScheduleScrollableViewModel(
    moment().subtract('d', 2).toISOString(),
    moment().add('d', 4).toISOString()
  )

  scheduleScrollableViewModel.loadExperiments()
  ko.applyBindings(scheduleScrollableViewModel)
