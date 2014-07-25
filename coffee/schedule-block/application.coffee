


class ScheduleBlockRowModel
  constructor: (startDate, endDate, experiments) ->
    # data
    @startDate = ko.observable(startDate)
    @endDate = ko.observable(endDate)
    @experiments = experiments

    # computed data
    @days = ko.computed =>
      numberDays = @endDate().diff(@startDate(), 'd')
      localStartDate = moment(@startDate())
      dayMoments = []
      for i in [0..numberDays] by 1
        dayMoments.push {'day': moment(localStartDate)}
        localStartDate.add('d', 1)
      dayMoments

    @months = ko.computed =>
      numberDays = @endDate().diff(@startDate(), 'd')
      localStartDate = moment(@startDate())
      monthMoments = []
      lastMonth = -1
      for i in [0..numberDays] by 1
        if localStartDate.month() != lastMonth
          lastMonth = localStartDate.month()
          monthMoments.push {
            'month': moment(localStartDate),
            'days': 1
          }
        else
          monthMoments[monthMoments.length-1]['days'] += 1
        localStartDate.add('d', 1)
      monthMoments

class ScheduleBlockViewModel
  constructor: ->
    # data
    @startDate = ko.observable(moment())
    @endDate = ko.observable(moment().add('w', 2))
    @numberWeeksPerCalendarRow = ko.observable(1)
    @rowsArray = ko.observableArray([])
    @experiments = ko.observableArray([])

    # computed data
    @visibleStartDate = ko.computed => @startDate().day(1)
    @visibleEndDate = ko.computed => @endDate().day(7)
    @numberWeeks = ko.computed => @visibleEndDate().diff(@visibleStartDate(),'w')+1
    @weekDayNames = ko.computed =>
      dayNames = []
      for i in [0..@numberWeeksPerCalendarRow()-1] by 1
        dayNames.push {'weekDayName': dayName} for dayName in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
      dayNames

    @rows = ko.computed =>
      localStartDate = moment(@visibleStartDate())
      @rowsArray.removeAll() # TODO: clever update instead of remove All
      for i in [0..@numberWeeks()-1] by 1
        @rowsArray.push new ScheduleBlockRowModel(
          moment(localStartDate),
          moment(localStartDate.add('d', 7*@numberWeeksPerCalendarRow()).subtract('d', 1)),
          @experiments
        )
        localStartDate.add('d', 1)
      @rowsArray()

  updateVisits: =>
    exp.loadVisits(@visibleStartDate(), @visibleEndDate()) for exp in @experiments()

  loadExperiments: =>
    $.getJSON "/api/experiments", (data) =>
      @experiments($.map data.experiments, (item) => new ScheduleExperimentModel(item))
      @updateVisits()


$ ->
  ko.validation.init()
  scheduleBlockViewModel = new ScheduleBlockViewModel()
  ko.applyBindings(scheduleBlockViewModel, $('#schedule-block-widget').get(0))
  scheduleBlockViewModel.loadExperiments()
