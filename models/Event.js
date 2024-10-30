const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  start: { 
    type: Date, 
    required: true,
    set: function(date) {
      if (typeof date === 'string') {
        const [day, month, year] = date.split('/');
        return new Date(year, month - 1, day);
      }
      return date;
    }
  },
  end: { 
    type: Date, 
    required: true,
    set: function(date) {
      if (typeof date === 'string') {
        // Converte DD/MM/YYYY para Date
        const [day, month, year] = date.split('/');
        return new Date(year, month - 1, day);
      }
      return date;
    }
  },
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;