

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
    @loadingVisits = ko.observable(false)
    @visits = ko.observableArray([]);

    # operations
    @loadVisits(startDate, endDate)

  loadVisits: (startDate, endDate) =>
    if !@loadingVisits()
      @loadingVisits(true)
      $.getJSON "/api/visits?expId=#{@id()}&startDate=#{startDate.toISOString()}&endDate=#{endDate.toISOString()}", (data) =>
        @visits($.map data.visits, (item) => new ScheduleScrollableVisitModel(item))
        @loadingVisits(false)


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
    @headerTimes = ko.observableArray([]);

    # operations
    @loadExperiments()
    @updateHeaderTimes()

    # subscriptions
    @startDate.subscribe =>
      @updateVisits()
      @updateHeaderTimes()

    @endDate.subscribe =>
      @updateVisits()
      @updateHeaderTimes()

  scrollToToday: (width) =>
    @visibleStartDate(moment().subtract('s', 0.5 * width / @secPxScale()))

  scrollToTomorrow: (width) =>
    @visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / @secPxScale()))

  addPastVisits: =>
    @startDate(@startDate().subtract('d', 1))

  addFutureVisits: =>
    @endDate(@endDate().add('d', 1))

  updateVisits: =>
    exp.loadVisits(@startDate(), @endDate()) for exp in @experiments()

  updateHeaderTimes: =>
    # split date range into 4 hour blocks
    blockStart = moment(@startDate()).millisecond(0).second(0).minute(0).hour(Math.ceil(@startDate().hour() / 4) * 4)
    @headerTimes.removeAll() # TODO: clever update instead of remove All
    while blockStart < @endDate()
      @headerTimes.push({'headerDate': moment(blockStart)})
      blockStart.add('h', 4)

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
