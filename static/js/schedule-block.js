var ScheduleBlockRowModel, ScheduleBlockViewModel, ScheduleExperimentModel, ScheduleVisitModel,
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

ScheduleVisitModel = (function() {
  function ScheduleVisitModel(data) {
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

  return ScheduleVisitModel;

})();

ScheduleExperimentModel = (function() {
  function ScheduleExperimentModel(data) {
    this.loadVisits = __bind(this.loadVisits, this);
    this.visitsByDate = __bind(this.visitsByDate, this);
    this.id = ko.observable(data.id);
    this.shortname = ko.observable(data.shortname);
    this.longname = ko.observable(data.longname);
    this.loadingVisits = ko.observable(false);
    this.visits = ko.observableArray([]);
  }

  ScheduleExperimentModel.prototype.visitsByDate = function(startDate, endDate) {
    return ko.utils.arrayFilter(this.visits(), function(visit) {
      return visit.startDate() <= endDate() && visit.endDate() >= startDate();
    });
  };

  ScheduleExperimentModel.prototype.loadVisits = function(startDate, endDate) {
    if (!this.loadingVisits()) {
      this.loadingVisits(true);
      return $.getJSON("/api/visits?expId=" + (this.id()) + "&startDate=" + (startDate.toISOString()) + "&endDate=" + (endDate.toISOString()), (function(_this) {
        return function(data) {
          _this.visits($.map(data.visits, function(item) {
            return new ScheduleVisitModel(item);
          }));
          return _this.loadingVisits(false);
        };
      })(this));
    }
  };

  return ScheduleExperimentModel;

})();

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

ko.bindingHandlers.blDayWidth = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    return $(element).width("" + (100.0 / (bindingContext.$root.numberWeeksPerCalendarRow() * 7)) + "%");
  }
};

ko.bindingHandlers.blMonthWidth = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var valueUnwrapped;
    valueUnwrapped = ko.unwrap(valueAccessor());
    return $(element).width("" + (valueUnwrapped * 100.0 / (bindingContext.$root.numberWeeksPerCalendarRow() * 7)) + "%");
  }
};

ko.bindingHandlers.blVisitPosition = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var endOffset, rowSeconds, rowStartDate, rowStartUnix, startOffset;
    rowStartDate = bindingHandlers().blRowStartDate || null;
    if (rowStartDate != null) {
      rowStartUnix = moment(rowStartDate()).startOf('day').unix();
      rowSeconds = bindingContext.$root.numberWeeksPerCalendarRow() * 604800;
      startOffset = bindingContext.$data.startDateUnix() - rowStartUnix;
      endOffset = bindingContext.$data.endDateUnix() - rowStartUnix;
      $(element).css({
        left: "" + (100.0 * startOffset / rowSeconds) + "%"
      });
      return $(element).width("" + (100.0 * (endOffset - startOffset) / rowSeconds) + "%");
    }
  }
};

ScheduleBlockRowModel = (function() {
  function ScheduleBlockRowModel(startDate, endDate, experiments) {
    this.startDate = ko.observable(startDate);
    this.endDate = ko.observable(endDate);
    this.experiments = experiments;
    this.days = ko.computed((function(_this) {
      return function() {
        var dayMoments, i, localStartDate, numberDays, _i;
        numberDays = _this.endDate().diff(_this.startDate(), 'd');
        localStartDate = moment(_this.startDate());
        dayMoments = [];
        for (i = _i = 0; _i <= numberDays; i = _i += 1) {
          dayMoments.push({
            'day': moment(localStartDate)
          });
          localStartDate.add('d', 1);
        }
        return dayMoments;
      };
    })(this));
    this.months = ko.computed((function(_this) {
      return function() {
        var i, lastMonth, localStartDate, monthMoments, numberDays, _i;
        numberDays = _this.endDate().diff(_this.startDate(), 'd');
        localStartDate = moment(_this.startDate());
        monthMoments = [];
        lastMonth = -1;
        for (i = _i = 0; _i <= numberDays; i = _i += 1) {
          if (localStartDate.month() !== lastMonth) {
            lastMonth = localStartDate.month();
            monthMoments.push({
              'month': moment(localStartDate),
              'days': 1
            });
          } else {
            monthMoments[monthMoments.length - 1]['days'] += 1;
          }
          localStartDate.add('d', 1);
        }
        return monthMoments;
      };
    })(this));
  }

  return ScheduleBlockRowModel;

})();

ScheduleBlockViewModel = (function() {
  function ScheduleBlockViewModel() {
    this.loadExperiments = __bind(this.loadExperiments, this);
    this.updateVisits = __bind(this.updateVisits, this);
    this.startDate = ko.observable(moment());
    this.endDate = ko.observable(moment().add('w', 2));
    this.numberWeeksPerCalendarRow = ko.observable(1);
    this.rowsArray = ko.observableArray([]);
    this.experiments = ko.observableArray([]);
    this.visibleStartDate = ko.computed((function(_this) {
      return function() {
        return _this.startDate().day(1);
      };
    })(this));
    this.visibleEndDate = ko.computed((function(_this) {
      return function() {
        return _this.endDate().day(7);
      };
    })(this));
    this.numberWeeks = ko.computed((function(_this) {
      return function() {
        return _this.visibleEndDate().diff(_this.visibleStartDate(), 'w') + 1;
      };
    })(this));
    this.weekDayNames = ko.computed((function(_this) {
      return function() {
        var dayName, dayNames, i, _i, _j, _len, _ref, _ref1;
        dayNames = [];
        for (i = _i = 0, _ref = _this.numberWeeksPerCalendarRow() - 1; _i <= _ref; i = _i += 1) {
          _ref1 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            dayName = _ref1[_j];
            dayNames.push({
              'weekDayName': dayName
            });
          }
        }
        return dayNames;
      };
    })(this));
    this.rows = ko.computed((function(_this) {
      return function() {
        var i, localStartDate, _i, _ref;
        localStartDate = moment(_this.visibleStartDate());
        _this.rowsArray.removeAll();
        for (i = _i = 0, _ref = _this.numberWeeks() - 1; _i <= _ref; i = _i += 1) {
          _this.rowsArray.push(new ScheduleBlockRowModel(moment(localStartDate), moment(localStartDate.add('d', 7 * _this.numberWeeksPerCalendarRow()).subtract('d', 1)), _this.experiments));
          localStartDate.add('d', 1);
        }
        return _this.rowsArray();
      };
    })(this));
  }

  ScheduleBlockViewModel.prototype.updateVisits = function() {
    var exp, _i, _len, _ref, _results;
    _ref = this.experiments();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      exp = _ref[_i];
      _results.push(exp.loadVisits(this.visibleStartDate(), this.visibleEndDate()));
    }
    return _results;
  };

  ScheduleBlockViewModel.prototype.loadExperiments = function() {
    return $.getJSON("/api/experiments", (function(_this) {
      return function(data) {
        _this.experiments($.map(data.experiments, function(item) {
          return new ScheduleExperimentModel(item);
        }));
        return _this.updateVisits();
      };
    })(this));
  };

  return ScheduleBlockViewModel;

})();

$(function() {
  var scheduleBlockViewModel;
  ko.validation.init();
  scheduleBlockViewModel = new ScheduleBlockViewModel();
  ko.applyBindings(scheduleBlockViewModel, $('#schedule-block-widget').get(0));
  return scheduleBlockViewModel.loadExperiments();
});
