var ScheduleBlockRowModel, ScheduleBlockViewModel;

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

ko.bindingHandlers.dayWidth = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    return $(element).width("" + (100.0 / (bindingContext.$root.numberWeeksPerCalendarRow() * 7)) + "%");
  }
};

ScheduleBlockRowModel = (function() {
  function ScheduleBlockRowModel(startDate, endDate) {
    this.startDate = ko.observable(startDate);
    this.endDate = ko.observable(endDate);
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
  }

  return ScheduleBlockRowModel;

})();

ScheduleBlockViewModel = (function() {
  function ScheduleBlockViewModel() {
    this.startDate = ko.observable(moment());
    this.endDate = ko.observable(moment().add('w', 2));
    this.numberWeeksPerCalendarRow = ko.observable(1);
    this.rowsArray = ko.observableArray([]);
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
          _this.rowsArray.push(new ScheduleBlockRowModel(moment(localStartDate), moment(localStartDate.add('d', 7 * _this.numberWeeksPerCalendarRow()).subtract('d', 1))));
          localStartDate.add('d', 1);
        }
        return _this.rowsArray();
      };
    })(this));
  }

  return ScheduleBlockViewModel;

})();

$(function() {
  var scheduleBlockViewModel;
  ko.validation.init();
  scheduleBlockViewModel = new ScheduleBlockViewModel();
  return ko.applyBindings(scheduleBlockViewModel, $('#schedule-block-widget').get(0));
});
