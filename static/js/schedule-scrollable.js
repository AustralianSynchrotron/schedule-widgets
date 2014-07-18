var ScheduleScrollableExperimentModel, ScheduleScrollableViewModel, ScheduleScrollableVisitModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ko.bindingHandlers.hidden = {
  update: function(element, valueAccessor) {
    var valueUnwrapped;
    valueUnwrapped = ko.unwrap(valueAccessor());
    return ko.bindingHandlers.visible.update(element, function() {
      return !valueUnwrapped;
    });
  }
};

ko.bindingHandlers.date = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var output, pattern, valueUnwrapped;
    pattern = bindingHandlers().format || 'DD/MM/YYYY';
    valueUnwrapped = ko.unwrap(valueAccessor());
    output = "-";
    if (valueUnwrapped != null) {
      output = moment(valueUnwrapped).format(pattern);
      if ($(element).is("input")) {
        return $(element).val(output);
      } else {
        return $(element).text(output);
      }
    }
  }
};

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

ko.bindingHandlers.headerTimePosition = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var startDate;
    startDate = bindingContext.$data.headerDate.unix() - bindingContext.$root.startDateUnix();
    return $(element).css({
      left: startDate * bindingContext.$root.secPxScale()
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
        } else {
          if (currPos >= 20) {
            return bindingContext.$root.addPastVisits();
          } else {
            return bindingContext.$root.addFutureVisits();
          }
        }
      }
    }).restrict({
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
    this.loadingVisits = ko.observable(false);
    this.visits = ko.observableArray([]);
    this.loadVisits(startDate, endDate);
  }

  ScheduleScrollableExperimentModel.prototype.loadVisits = function(startDate, endDate) {
    if (!this.loadingVisits()) {
      this.loadingVisits(true);
      return $.getJSON("/api/visits?expId=" + (this.id()) + "&startDate=" + (startDate.toISOString()) + "&endDate=" + (endDate.toISOString()), (function(_this) {
        return function(data) {
          _this.visits($.map(data.visits, function(item) {
            return new ScheduleScrollableVisitModel(item);
          }));
          return _this.loadingVisits(false);
        };
      })(this));
    }
  };

  return ScheduleScrollableExperimentModel;

})();

ScheduleScrollableViewModel = (function() {
  function ScheduleScrollableViewModel(startDate, endDate) {
    this.loadExperiments = __bind(this.loadExperiments, this);
    this.updateHeaderTimes = __bind(this.updateHeaderTimes, this);
    this.updateVisits = __bind(this.updateVisits, this);
    this.addFutureVisits = __bind(this.addFutureVisits, this);
    this.addPastVisits = __bind(this.addPastVisits, this);
    this.scrollToTomorrow = __bind(this.scrollToTomorrow, this);
    this.scrollToToday = __bind(this.scrollToToday, this);
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
    this.headerTimes = ko.observableArray([]);
    this.loadExperiments();
    this.updateHeaderTimes();
    this.startDate.subscribe((function(_this) {
      return function() {
        _this.updateVisits();
        return _this.updateHeaderTimes();
      };
    })(this));
    this.endDate.subscribe((function(_this) {
      return function() {
        _this.updateVisits();
        return _this.updateHeaderTimes();
      };
    })(this));
  }

  ScheduleScrollableViewModel.prototype.scrollToToday = function(width) {
    return this.visibleStartDate(moment().subtract('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.scrollToTomorrow = function(width) {
    return this.visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.addPastVisits = function() {
    return this.startDate(this.startDate().subtract('d', 1));
  };

  ScheduleScrollableViewModel.prototype.addFutureVisits = function() {
    return this.endDate(this.endDate().add('d', 1));
  };

  ScheduleScrollableViewModel.prototype.updateVisits = function() {
    var exp, _i, _len, _ref, _results;
    _ref = this.experiments();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exp = _ref[_i];
      _results.push(exp.loadVisits(this.startDate(), this.endDate()));
    }
    return _results;
  };

  ScheduleScrollableViewModel.prototype.updateHeaderTimes = function() {
    var blockStart, _results;
    blockStart = moment(this.startDate()).millisecond(0).second(0).minute(0).hour(Math.ceil(this.startDate().hour() / 4) * 4);
    this.headerTimes.removeAll();
    _results = [];
    while (blockStart < this.endDate()) {
      this.headerTimes.push({
        'headerDate': moment(blockStart)
      });
      _results.push(blockStart.add('h', 4));
    }
    return _results;
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
