Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  Meteor.subscribe("tasks");
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: 1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: 1}});
      }
    },
    hideCompleted: function() {
      return Session.get("hideCompleted");
    },
    incompleteCount: function() {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    'change .hide-completed input': function (event) {
      Session.set("hideCompleted", event.target.checked);
    },
    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted

      var text = event.target.text.value;

      Meteor.call("addTask", text)
      // Clear form
      event.target.text.value = "";
      console.log(event);
      // Prevent default form submit
      return false;
    },
    'click .toggle-checked': function () {
      // Set the cheked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    'click .delete': function () {
      Meteor.call("deleteTask", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}     

Meteor.methods({
  addTask: function(text) {
    // Make sre the user is logged in befor einserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    };

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    Tasks.update(taskId, {$set: {checked: setChecked}});
  }
});

if (Meteor.isServer) {
  Meteor.publish("tasks", function() {
    return Tasks.find();
  });
};