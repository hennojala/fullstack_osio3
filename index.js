require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
require('mongoose')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())


// Määritä mukautettu token morganille näyttämään POST-pyynnön datan.
morgan.token('postData', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

// Morganin konfiguraatio ja käyttöönotto
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

// Infotekstin näyttö
app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      const personCount = persons.length
      const currentDate = new Date()
      res.send(`<p>Phonebook has info for ${personCount} people</p> <p>${currentDate}</p>`)
    })
    .catch(error => next(error))
})


//Kaikkien henkilöiden haku
app.get('/api/persons/', (req, res, next) => {
  Person.find({})
    .then(person => {
      if (person) {
        console.log(person)
        res.json(person)
      }
      else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Toiminnallisuus hakea henkilö id:llä
app.get('/api/persons/:id', (request, res, next) => {
  const id = request.params.id

  Person.findById(id)
    .then(person => {
      if (person) {
        console.log(person)
        res.json(person)
      } else {
        res.status(404).end() // Jos käyttäjää ei löydy, palauta 404 - Not Found
      }
    })
    .catch(error => next(error))
})

// Poista käyttäjä
app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Uuden käyttäjän vienti järjestelmään
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
        console.log('BackEnd: Person is already on notebook.')
        return error => next(error)
      }
      else {
        const person = new Person({
          name: body.name,
          number: body.number
        })

        person.save()
          .then(savedPerson => {
            response.json(savedPerson)
          })
          .catch(error => next(error))
      }
    })
})

// Käyttäjän päivitys
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'Internal Server Error') {
    return response.status(500).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// Serveriä ajava portti
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
