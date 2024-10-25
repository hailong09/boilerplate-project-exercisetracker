const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()
// Define Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
}, { versionKey: false })

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: String
  },
  description: {
    type: String,
    required: String
  },
  duration: Number,
  date: Date
}, { versionKey: false })

// Define Modal
const User = new mongoose.model('User', userSchema)
const Excercise = new mongoose.model('Exercise', exerciseSchema)

// Connect Database
async function connectDB() {
  await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.evzlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  console.log('Database connected')
}

// Run Database
connectDB().catch(err => console.log(err))

app.use(cors())
app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username })
    await user.save()
    res.json(user)
  } catch (err) {
    console.log(err)
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log(req.body)
  try {
    const id = req.params._id
    console.log(id)
    const foundUser = await User.findById(id).exec();
    console.log(foundUser)
    const date = req.body.date != '' ? new Date(req.body.date) : new Date()
    if (foundUser) {
      const newExercise = new Excercise({
        username: foundUser.username,
        description: req.body.description,
        duration: Number(req.body.duration),
        date: date
      })

      await newExercise.save()
      res.json({
        _id: foundUser._id,
        username: foundUser.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: new Date(newExercise.date).toDateString()

      })
    }
  } catch (err) {
    console.log(err)
  }


})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
