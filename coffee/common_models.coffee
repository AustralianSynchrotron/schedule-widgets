class ScheduleVisitModel
  constructor: (data) ->
    # data
    @id = ko.observable(data.id)
    @startDate = ko.observable(moment(data.startDate))
    @endDate = ko.observable(moment(data.endDate))
    @startDateUnix = ko.computed => @startDate().unix()
    @endDateUnix = ko.computed => @endDate().unix()


class ScheduleExperimentModel
  constructor: (data) ->
    # data
    @id = ko.observable(data.id)
    @shortname = ko.observable(data.shortname)
    @longname = ko.observable(data.longname)
    @loadingVisits = ko.observable(false)
    @visits = ko.observableArray([]);

  visitsByDate: (startDate, endDate) =>
    ko.utils.arrayFilter @visits(), (visit) ->
      return visit.startDate() <= endDate() and visit.endDate() >= startDate()

  loadVisits: (startDate, endDate) =>
    if !@loadingVisits()
      @loadingVisits(true)
      $.getJSON "/api/visits?expId=#{@id()}&startDate=#{startDate.toISOString()}&endDate=#{endDate.toISOString()}", (data) =>
        @visits($.map data.visits, (item) => new ScheduleVisitModel(item))
        @loadingVisits(false)
