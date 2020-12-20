// DATA MODULE
var controlBudget = (function () {
  // Expense constructor
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Income constructor
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };


  return {
    addItem: function (type, desc, val) {
      var newItem, itemId;

      // Create new ID
      if (data.allItems[type].length > 0) {
        itemId = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        itemId = 0;
      }

      // create new item based on income or expense
      if (type === "inc"){
        newItem = new Income(itemId, desc, val);
      }
      else if (type === "exp") {
        newItem = new Expense(itemId, desc, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function(type, id) {
      var index, ids;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(current){
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(current){
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function () {
      console.log(data);
    }
  };
})();

// UI MODULE
var controlUI = (function () {
  var domStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBTN: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetTopLabel: ".budget__value",
    incomeTopLabel: ".budget__income--value",
    expenseTopLabel: ".budget__expenses--value",
    percentTopLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercentLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, intPart, decPart;
    
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    intPart = numSplit[0];
    if (intPart.length > 3) {
      intPart = intPart.substr(0, intPart.length - 3) + "," + intPart.substr(intPart.length - 3, 3);
    }

    decPart = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + intPart + "." + decPart;
    
  };

  var nodeListForEach = function (list, callBack) {
    for (var i = 0; i < list.length; i++) {
      callBack(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder
      if (type === "inc") {
        element = domStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      else if (type === "exp") {
        element = domStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = "inc" : type = 'exp';
      document.querySelector(domStrings.budgetTopLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(domStrings.incomeTopLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(domStrings.expenseTopLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percentage > -1){
        document.querySelector(domStrings.percentTopLabel).textContent = obj.percentage + '%';
      }
      else{
        document.querySelector(domStrings.percentTopLabel).textContent = '--'
      }

    },
    deleteListItem: function(selectorId) {
      var element;

      element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    displayPercentages: function(percentages) {
      var fields;

      fields = document.querySelectorAll(domStrings.expensePercentLabel);

      nodeListForEach(fields, function(current, index){
        if (percentages[index] > -1){
          current.textContent = percentages[index] + "%";
        }
        else {
          current.textContent = '--';
        }
      });
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        domStrings.inputType + ', ' +
        domStrings.inputDescription + ', ' +
        domStrings.inputValue
      );

      nodeListForEach(fields, function(current){
        current.classList.toggle('red-focus');
      });
      document.querySelector(domStrings.inputBTN).classList.toggle('red');
    },

    getDomStrings: function () {
      return domStrings;
    }
  };
})();

// APP CONTROLLER MODULE
var controlApp = (function (ctrlBudget, ctrlUI) {
  var setUpEventListeners = function() {

    var dom = ctrlUI.getDomStrings();

    document.querySelector(dom.inputBTN).addEventListener("click", ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.key == 'Enter') {
        ctrlAddItem();
      }
    })

    document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(dom.inputType).addEventListener('change', ctrlUI.changedType);
  };

  var updatePercentages = function() {

    // Calculate percentages
    ctrlBudget.calculatePercentages();

    // Read percentages from budget controller
    var percentages = ctrlBudget.getPercentages();

    // Update the UI with the new percentages
    ctrlUI.displayPercentages(percentages);
    

  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data
    input = ctrlUI.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to budget controller
      newItem = ctrlBudget.addItem(input.type, input.description, input.value);

      // 3. Add the item to UI
      ctrlUI.addListItem(newItem, input.type);

      // 4. Clear fields
      ctrlUI.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentage
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);

      // Delete the item from data structure
      ctrlBudget.deleteItem(type, id);

      // Delete the item from UI
      ctrlUI.deleteListItem(itemID);

      // Update and show the new budget
      updateBudget();

      // Calculate and update percentage
      updatePercentages();
    }
  };
  var updateBudget = function() {

    // Calculate the budget
    ctrlBudget.calculateBudget();

    // Return the budget
    var budget = ctrlBudget.getBudget();
    
    // Display the budget on the UI
    ctrlUI.displayBudget(budget);
  };

  return {
    init: function() {
      console.log("App has started!");
      ctrlUI.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setUpEventListeners();
    }
  }
})(controlBudget, controlUI);

controlApp.init();
