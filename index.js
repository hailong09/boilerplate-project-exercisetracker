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

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const foundUser = await User.findById(req.params._id)
    const query = { username: foundUser.username }

    if (req.query.from) {
      query['date'] = {
        ...query['date'],
        $gte: req.query.from
      }
    }

    if (req.query.to) {
      query['date'] = {
        ...query['date'],
        $lte: req.query.to
      }
    }
    const foundExcercise = await Excercise.find(query).limit(req.query.limit)

    const mapFoundExcercise = foundExcercise.map(excercise => {
      const editedExercise = {
        description: excercise.description,
        duration: Number(excercise.duration),
        date: new Date(excercise.date).toDateString()
      }
      return editedExercise
    })
    // https://3000-freecodecam-boilerplate-advond9g91z.ws-us116.gitpod.io/api/users/671b7bd83b12890779bee60b/logs?limit=1
    return res.json(
      {
        username: foundUser.username,
        count: foundExcercise.length,
        _id: foundUser._id,
        log: [
          ...mapFoundExcercise
        ]
      }
    )



  } catch (err) {
    console.log(err)
  }
})
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().exec()
    return res.json(users.map(user => ({ _id: user.id, username: user.username })))
  } catch (err) {
    console.log(err)
  }
})

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
  try {
    const id = req.params._id
    const foundUser = await User.findById(id).exec();
    const date = !req.body.date ? new Date() : new Date(req.body.date)
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
