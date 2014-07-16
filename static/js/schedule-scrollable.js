var ScheduleScrollableExperimentModel, ScheduleScrollableViewModel, ScheduleScrollableVisitModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ko.bindingHandlers.visitPosition = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var duration, startDate;
    startDate = bindingContext.$data.startDateUnix() - bindingContext.$root.startDateUnix();
    duration = bindingContext.$data.endDateUnix() - bindingContext.$data.startDateUnix();
    $(element).css({
      left: startDate * bindingContext.$root.secPxScale()
    });
    return $(element).width(duration * bindingContext.$root.secPxScale());
  }
};

ko.bindingHandlers.timeMarkerPosition = {
  init: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    return setInterval(function() {
      var current_time;
      current_time = moment().unix() - bindingContext.$root.startDateUnix();
      return $(element).css({
        left: current_time * bindingContext.$root.secPxScale()
      });
    }, 30000);
  },
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var current_time;
    current_time = moment().unix() - bindingContext.$root.startDateUnix();
    return $(element).css({
      left: current_time * bindingContext.$root.secPxScale()
    });
  }
};

ko.bindingHandlers.scrollSource = {
  init: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    bindingContext.$root.scrollToToday($(element.parentNode).width());
    return interact(element).draggable({
      onmove: function(event) {
        var currPos, currWidth;
        currPos = $(element).position().left + event.dx;
        currWidth = $(element).width();
        if (currPos < 20 && currPos + currWidth > $(element.parentNode).width() - 20) {
          return bindingContext.$root.visibleStartDate(bindingContext.$root.visibleStartDate().subtract('s', event.dx / bindingContext.$root.secPxScale()));
        }
      }
    }).inertia(true).restrict({
      drag: element.parentNode,
      endOnly: false
    });
  }
};

ko.bindingHandlers.scrollTarget = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var offset;
    offset = (bindingContext.$root.startDateUnix() - bindingContext.$root.visibleStartDateUnix()) * bindingContext.$root.secPxScale();
    return element.style.webkitTransform = element.style.transform = "translate(" + offset + "px, 0)";
  }
};

ko.bindingHandlers.scrollWidth = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    return $(element).width((bindingContext.$root.endDateUnix() - bindingContext.$root.startDateUnix()) * bindingContext.$root.secPxScale());
  }
};

ScheduleScrollableVisitModel = (function() {
  function ScheduleScrollableVisitModel(data) {
    this.id = ko.observable(data.id);
    this.startDate = ko.observable(moment(data.startDate));
    this.endDate = ko.observable(moment(data.endDate));
    this.startDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.startDate().unix();
      };
    })(this));
    this.endDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.endDate().unix();
      };
    })(this));
  }

  return ScheduleScrollableVisitModel;

})();

ScheduleScrollableExperimentModel = (function() {
  function ScheduleScrollableExperimentModel(data, startDate, endDate) {
    this.loadVisits = __bind(this.loadVisits, this);
    this.id = ko.observable(data.id);
    this.shortname = ko.observable(data.shortname);
    this.longname = ko.observable(data.longname);
    this.visits = ko.observableArray([]);
    this.loadVisits(startDate, endDate);
    this.id.subscribe = (function(_this) {
      return function(newValue) {
        return console.log(newValue);
      };
    })(this);
  }

  ScheduleScrollableExperimentModel.prototype.loadVisits = function(startDate, endDate) {
    return $.getJSON("/api/visits?expId=" + (this.id()) + "&startDate=" + (startDate.toISOString()) + "&endDate=" + (endDate.toISOString()), (function(_this) {
      return function(data) {
        return _this.visits($.map(data.visits, function(item) {
          return new ScheduleScrollableVisitModel(item);
        }));
      };
    })(this));
  };

  return ScheduleScrollableExperimentModel;

})();

ScheduleScrollableViewModel = (function() {
  function ScheduleScrollableViewModel(startDate, endDate) {
    this.loadExperiments = __bind(this.loadExperiments, this);
    this.updateVisits = __bind(this.updateVisits, this);
    this.scrollToTomorrow = __bind(this.scrollToTomorrow, this);
    this.scrollToToday = __bind(this.scrollToToday, this);
    this.test = __bind(this.test, this);
    this.startDate = ko.observable(moment(startDate));
    this.endDate = ko.observable(moment(endDate));
    this.visibleStartDate = ko.observable(this.startDate());
    this.secPxScale = ko.observable(0.01);
    this.startDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.startDate().unix();
      };
    })(this));
    this.endDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.endDate().unix();
      };
    })(this));
    this.visibleStartDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.visibleStartDate().unix();
      };
    })(this));
    this.experiments = ko.observableArray([]);
    this.loadExperiments();
    this.startDate.subscribe = (function(_this) {
      return function(newValue) {
        return _this.updateVisits();
      };
    })(this);
    this.endDate.subscribe = (function(_this) {
      return function(newValue) {
        return _this.updateVisits();
      };
    })(this);
  }

  ScheduleScrollableViewModel.prototype.test = function() {
    return this.secPxScale(this.secPxScale() * 5.0);
  };

  ScheduleScrollableViewModel.prototype.scrollToToday = function(width) {
    return this.visibleStartDate(moment().subtract('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.scrollToTomorrow = function(width) {
    return this.visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.updateVisits = function() {
    return ko.utils.arrayForEach(this.experiments()((function(_this) {
      return function(exp) {
        return exp.loadVisits(_this.startDate()(_this.endDate()));
      };
    })(this)));
  };

  ScheduleScrollableViewModel.prototype.loadExperiments = function() {
    return $.getJSON("/api/experiments", (function(_this) {
      return function(data) {
        return _this.experiments($.map(data.experiments, function(item) {
          return new ScheduleScrollableExperimentModel(item, _this.startDate(), _this.endDate());
        }));
      };
    })(this));
  };

  return ScheduleScrollableViewModel;

})();

$(function() {
  var scheduleScrollableViewModel;
  scheduleScrollableViewModel = new ScheduleScrollableViewModel(moment().subtract('d', 2).toISOString(), moment().add('d', 4).toISOString());
  scheduleScrollableViewModel.loadExperiments();
  return ko.applyBindings(scheduleScrollableViewModel);
});
