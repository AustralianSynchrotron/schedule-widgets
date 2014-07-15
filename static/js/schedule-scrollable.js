var ScheduleScrollableExperimentModel, ScheduleScrollableViewModel, ScheduleScrollableVisitModel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ko.bindingHandlers.visitPosition = {
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var duration, startDate;
    startDate = bindingContext.$data.startDateUnix() - bindingContext.$parent.startDateUnix();
    duration = bindingContext.$data.endDateUnix() - bindingContext.$data.startDateUnix();
    $(element).css({
      left: startDate * bindingContext.$root.pxSecScale()
    });
    return $(element).width(duration * bindingContext.$root.pxSecScale());
  }
};

ko.bindingHandlers.timeMarkerPosition = {
  init: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    return setInterval(function() {
      var current_time;
      current_time = moment().unix() - bindingContext.$root.startDateUnix();
      return $(element).css({
        left: current_time * bindingContext.$root.pxSecScale()
      });
    }, 30000);
  },
  update: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var current_time;
    current_time = moment().unix() - bindingContext.$root.startDateUnix();
    return $(element).css({
      left: current_time * bindingContext.$root.pxSecScale()
    });
  }
};

ko.bindingHandlers.scrollSource = {
  init: function(element, valueAccessor, bindingHandlers, viewModel, bindingContext) {
    var x;
    x = 0;
    return interact(element).draggable({
      onmove: function(event) {
        var currPos, currWidth;
        currPos = $(element).position().left + event.dx;
        currWidth = $(element).width();
        if (currPos < 20 && currPos + currWidth > $(element.parentNode).width() - 20) {
          x += event.dx;
          return bindingContext.$root.scrollOffset(x);
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
    return element.style.webkitTransform = element.style.transform = "translate(" + (bindingContext.$root.scrollOffset()) + "px, 0)";
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
    this.startDate = ko.observable(startDate);
    this.endDate = ko.observable(endDate);
    this.startDateIso = ko.computed((function(_this) {
      return function() {
        return _this.startDate().toISOString();
      };
    })(this));
    this.endDateIso = ko.computed((function(_this) {
      return function() {
        return _this.endDate().toISOString();
      };
    })(this));
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
    this.visits = ko.observableArray([]);
    this.loadVisits();
    this.id.subscribe = (function(_this) {
      return function(newValue) {
        return console.log(newValue);
      };
    })(this);
  }

  ScheduleScrollableExperimentModel.prototype.loadVisits = function() {
    return $.getJSON("/api/visits?expId=" + (this.id()) + "&startDate=" + (this.startDateIso()) + "&endDate=" + (this.endDateIso()), (function(_this) {
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
    this.test = __bind(this.test, this);
    this.startDate = ko.observable(moment(startDate));
    this.endDate = ko.observable(moment(endDate));
    this.pxSecScale = ko.observable(0.01);
    this.scrollOffset = ko.observable(0.0);
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
    this.experiments = ko.observableArray([]);
    this.loadExperiments();
  }

  ScheduleScrollableViewModel.prototype.test = function() {
    return this.pxSecScale(this.pxSecScale() * 5.0);
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
  scheduleScrollableViewModel = new ScheduleScrollableViewModel(moment().subtract('h', 2).toISOString(), moment().add('d', 1).toISOString());
  scheduleScrollableViewModel.loadExperiments();
  return ko.applyBindings(scheduleScrollableViewModel);
});
