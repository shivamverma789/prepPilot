const mongoose = require("mongoose");

/* ===============================
   Bullet Schema
================================*/

const bulletSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },

  isAIEnhanced: {
    type: Boolean,
    default: false
  },

  hasMetric: {
    type: Boolean,
    default: false
  }

},{ _id:true });

/* ===============================
   Entry Schema
================================*/

const entrySchema = new mongoose.Schema({

  title: String,
  subtitle: String,

  location: String,

  startDate: String,
  endDate: String,

  links:[
    {
      label:String,
      url:String
    }
  ],

  bullets:[bulletSchema]

},{ _id:true });

/* ===============================
   Section Schema
================================*/

const sectionSchema = new mongoose.Schema({

  title:{
    type:String,
    required:true
  },

  type:{
    type:String,
    enum:[
      "text",
      "list",
      "grouped-list",
      "entries"
    ],
    required:true
  },

  order:{
    type:Number,
    required:true
  },

  data: mongoose.Schema.Types.Mixed,

  isRequired:{
    type:Boolean,
    default:false
  }

},{ _id:true });

/* ===============================
   Resume Schema
================================*/

const resumeSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
  },

  title:{
    type:String,
    default:"Untitled Resume"
  },

  template:{
    type:String,
    default:"classic"
  },

  status:{
    type:String,
    enum:["draft","ready","optimized"],
    default:"draft"
  },

  basics:{
    fullName:String,
    email:String,
    phone:String,
    location:String,

    links:[
      {
        label:String,
        url:String
      }
    ]
  },

  sections:[sectionSchema],

  optimizationMeta:{

    quantifiedBullets:{
      type:Number,
      default:0
    },

    totalBullets:{
      type:Number,
      default:0
    },

    vagueBullets:{
      type:Number,
      default:0
    },

    overallImpactScore:{
      type:Number,
      default:0
    },

    lastAnalyzedAt:Date
  },
  aiCache: {
    
  optimizedResume: mongoose.Schema.Types.Mixed,
  atsScoreBefore: Number,
  atsScoreAfter: Number,
  missingSkills: [String],
  improvementNotes: [String],
  lastGenerated: Date
}

},{ timestamps:true });

module.exports = mongoose.model("Resume",resumeSchema);