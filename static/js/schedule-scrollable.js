var ScheduleScrollableExperimentModel, ScheduleScrollableViewModel, ScheduleScrollableVisitModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ko.subscribable.fn.subscribeChanged = function(callback) {
  var oldValue;
  oldValue = void 0;
  this.subscribe((function(_oldValue) {
    return oldValue = _oldValue;
  }), this, "beforeChange");
  return this.subscribe(function(newValue) {
    return callback(newValue, oldValue);
  });
};

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
        bindingContext.$root.visibleStartDate(bindingContext.$root.visibleStartDate().subtract('s', event.dx / bindingContext.$root.secPxScale()));
        return bindingContext.$root.visibleEndDate(bindingContext.$root.visibleEndDate().subtract('s', event.dx / bindingContext.$root.secPxScale()));
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
  function ScheduleScrollableExperimentModel(data) {
    this.loadVisits = __bind(this.loadVisits, this);
    this.id = ko.observable(data.id);
    this.shortname = ko.observable(data.shortname);
    this.longname = ko.observable(data.longname);
    this.loadingVisits = ko.observable(false);
    this.visits = ko.observableArray([]);
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
  function ScheduleScrollableViewModel() {
    this.loadExperiments = __bind(this.loadExperiments, this);
    this.updateHeaderTimes = __bind(this.updateHeaderTimes, this);
    this.updateVisits = __bind(this.updateVisits, this);
    this.zoomWheel = __bind(this.zoomWheel, this);
    this.zoom = __bind(this.zoom, this);
    this.scrollToTomorrow = __bind(this.scrollToTomorrow, this);
    this.scrollToToday = __bind(this.scrollToToday, this);
    this.visibleDateRange = __bind(this.visibleDateRange, this);
    this.dateRange = __bind(this.dateRange, this);
    this.bufferFactor = 3;
    this.extendDays = 2;
    this.startDate = ko.observable(moment());
    this.endDate = ko.observable(moment());
    this.visibleStartDate = ko.observable(this.startDate());
    this.visibleEndDate = ko.observable(this.endDate());
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
    this.visibleEndDateUnix = ko.computed((function(_this) {
      return function() {
        return _this.visibleEndDate().unix();
      };
    })(this));
    this.experiments = ko.observableArray([]);
    this.headerTimes = ko.observableArray([]);
    this.startDate.subscribe((function(_this) {
      return function() {
        var diff;
        diff = _this.dateRange() - (_this.bufferFactor * _this.visibleDateRange());
        if (diff > 0) {
          return _this.endDate(_this.endDate().subtract('d', diff));
        } else {
          _this.updateVisits();
          return _this.updateHeaderTimes();
        }
      };
    })(this));
    this.endDate.subscribe((function(_this) {
      return function() {
        var diff;
        diff = _this.dateRange() - (_this.bufferFactor * _this.visibleDateRange());
        if (diff > 0) {
          return _this.startDate(_this.startDate().add('d', diff));
        } else {
          _this.updateVisits();
          return _this.updateHeaderTimes();
        }
      };
    })(this));
    this.visibleStartDate.subscribe((function(_this) {
      return function() {
        var daysToExtend;
        if (_this.startDate() >= _this.visibleStartDate()) {
          daysToExtend = Math.ceil((_this.startDate().diff(_this.visibleStartDate(), 'days') + 1) / _this.extendDays) * _this.extendDays;
          return _this.startDate(_this.startDate().subtract('d', daysToExtend));
        }
      };
    })(this));
    this.visibleEndDate.subscribe((function(_this) {
      return function() {
        var daysToExtend;
        if (_this.endDate() <= _this.visibleEndDate()) {
          daysToExtend = Math.ceil((_this.visibleEndDate().diff(_this.endDate(), 'days') + 1) / _this.extendDays) * _this.extendDays;
          return _this.endDate(_this.endDate().add('d', daysToExtend));
        }
      };
    })(this));
    this.secPxScale.subscribeChanged((function(_this) {
      return function(newValue, oldValue) {
        var diffDateRange;
        diffDateRange = ((oldValue - newValue) / newValue) * _this.visibleDateRange('s');
        _this.visibleStartDate(_this.visibleStartDate().subtract('s', 0.5 * diffDateRange));
        return _this.visibleEndDate(_this.visibleEndDate().add('s', 0.5 * diffDateRange));
      };
    })(this));
  }

  ScheduleScrollableViewModel.prototype.dateRange = function(unit) {
    if (unit == null) {
      unit = 'days';
    }
    return this.endDate().diff(this.startDate(), unit);
  };

  ScheduleScrollableViewModel.prototype.visibleDateRange = function(unit) {
    if (unit == null) {
      unit = 'days';
    }
    return this.visibleEndDate().diff(this.visibleStartDate(), unit) + 1;
  };

  ScheduleScrollableViewModel.prototype.scrollToToday = function(width) {
    this.visibleStartDate(moment().subtract('s', 0.5 * width / this.secPxScale()));
    return this.visibleEndDate(moment().add('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.scrollToTomorrow = function(width) {
    this.visibleStartDate(moment().add('d', 1).subtract('s', 0.5 * width / this.secPxScale()));
    return this.visibleEndDate(moment().add('d', 1).add('s', 0.5 * width / this.secPxScale()));
  };

  ScheduleScrollableViewModel.prototype.zoom = function(delta) {
    if (this.secPxScale() + delta > 1.0e-6) {
      return this.secPxScale(this.secPxScale() + delta);
    }
  };

  ScheduleScrollableViewModel.prototype.zoomWheel = function(data, event) {
    var delta, e;
    e = event.originalEvent;
    delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    return this.zoom(delta * 0.001);
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
        _this.experiments($.map(data.experiments, function(item) {
          return new ScheduleScrollableExperimentModel(item);
        }));
        return _this.updateVisits();
      };
    })(this));
  };

  return ScheduleScrollableViewModel;

})();

$(function() {
  var scheduleScrollableViewModel;
  ko.validation.init();
  scheduleScrollableViewModel = new ScheduleScrollableViewModel();
  ko.applyBindings(scheduleScrollableViewModel, $('#schedule-scrollable-widget').get(0));
  return scheduleScrollableViewModel.loadExperiments();
});
