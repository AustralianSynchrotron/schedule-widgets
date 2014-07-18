

class ScheduleScrollableVisitModel
  constructor: (data) ->
    # data
    @id = ko.observable(data.id)
    @startDate = ko.observable(moment(data.startDate))
    @endDate = ko.observable(moment(data.endDate))
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()


class ScheduleScrollableExperimentModel
  constructor: (data) ->
    # data
    @id = ko.observable(data.id)
    @shortname = ko.observable(data.shortname)
    @longname = ko.observable(data.longname)

    # computed data
    @loadingVisits = ko.observable(false)
    @visits = ko.observableArray([]);

  loadVisits: (startDate, endDate) =>
    console.log(startDate.toISOString())
    console.log(endDate.toISOString())
    if !@loadingVisits()
      @loadingVisits(true)
      $.getJSON "/api/visits?expId=#{@id()}&startDate=#{startDate.toISOString()}&endDate=#{endDate.toISOString()}", (data) =>
        @visits($.map data.visits, (item) => new ScheduleScrollableVisitModel(item))
        @loadingVisits(false)


class ScheduleScrollableViewModel
  constructor: ->
    # static variables
    @bufferFactor = 3 # buffer the number of visible days multiplied by this factor
    @extendDays = 2 # number of days to extend the timeline

    # data
    @startDate = ko.observable(moment())
    @endDate = ko.observable(moment())
    @visibleStartDate = ko.observable(@startDate())
    @visibleEndDate = ko.observable(@endDate())
    @secPxScale = ko.observable(0.01) # seconds to pixel conversion factor

    # computed data
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()
    @visibleStartDateUnix = ko.computed => @visibleStartDate().unix()
    @visibleEndDateUnix = ko.computed => @visibleEndDate().unix()
    @experiments = ko.observableArray([]);
    @headerTimes = ko.observableArray([]);

    # subscriptions
    @startDate.subscribe =>
      diff = @dateRange() - (@bufferFactor * @visibleDateRange())
      if diff > 0
        @endDate(@endDate().subtract('d', diff))
      else
        @updateVisits()
        @updateHeaderTimes()

    @endDate.subscribe =>
      diff = @dateRange() - (@bufferFactor * @visibleDateRange())
      if diff > 0
        @startDate(@startDate().add('d', diff))
      else
        @updateVisits()
        @updateHeaderTimes()

    @visibleStartDate.subscribe =>
      if @startDate() >= @visibleStartDate()
        daysToExtend = Math.ceil((@startDate().diff(@visibleStartDate(), 'days')+1) / @extendDays) * @extendDays
        @startDate(@startDate().subtract('d', daysToExtend))

    @visibleEndDate.subscribe =>
      if @endDate() <= @visibleEndDate()
        daysToExtend = Math.ceil((@visibleEndDate().diff(@endDate(), 'days')+1) / @extendDays) * @extendDays
        @endDate(@endDate().add('d', daysToExtend))

  dateRange: (unit='days') =>
    result = @endDate().diff(@startDate(), unit)
    if result == 0 then 1 else result

  visibleDateRange: (unit='days') =>
    result = @visibleEndDate().diff(@visibleStartDate(), unit)
    if result == 0 then 1 else result

  scrollToToday: (width) =>
    @visibleStartDate(moment().subtract('s', 0.5 * width / @secPxScale()))
    @visibleEndDate(moment().add('s', 0.5 * width / @secPxScale()))

  scrollToTomorrow: (width) =>
    @visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / @secPxScale()))
    @visibleEndDate(moment().add('d', 1).add('s', 0.5 * width / @secPxScale()))

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
      @experiments($.map data.experiments, (item) => new ScheduleScrollableExperimentModel(item))
      @updateVisits()


$ ->
  scheduleScrollableViewModel = new ScheduleScrollableViewModel()
  ko.applyBindings(scheduleScrollableViewModel)
  scheduleScrollableViewModel.loadExperiments()
