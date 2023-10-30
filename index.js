const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

// Määritä mukautettu token morganille näyttämään POST-pyynnön datan.
morgan.token('postData', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});

// Morganin konfiguraatio ja käyttöönotto
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));


// Kovakoodattu data henkilöistä
let persons = [
    {
        "name": "Arto Hellas Lovelace",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

// Infotekstin näyttö
app.get('/info', (req, res) => {
    const numberOfPersons = persons.length;
    const currentDate = new Date();
    res.send(`<p>Phonebook has info for ${numberOfPersons} people</p> <p>${currentDate}</p>`);
});

//Kaikkien henkilöiden haku
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

// Toiminnallisuus hakea henkilö id:llä
app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) { //Jos käyttäjä löytyy, palauta se
        response.json(person)
    } else {
        response.status(404).end() // Muussa tapauksessa anna virheilmoitus
    }
})

// Poista käyttäjä
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end() // Jos poistettavaa ei ole olemassa, virheilmoitus
})

// ID:n generointi toiminnallisuus randomilla, kokonaisluku väliltä 5-1000
const generateId = () => {
    return Math.floor(Math.random() * (1000 - 5 + 1)) + 5;
}

// Uuden käyttäjän vienti järjestelmään
app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) { // jos nimeä tai numeroa ei ole, virheilmoitus
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    //Jos nimi on jo luettelossa, virheilmoitus
    const duplicateName = persons.find(person => person.name === body.name);
    if (duplicateName) {
        return response.status(409).json({
            error: 'Name must be unique'
        });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(person)
    response.json(person)
})

// Serveriä ajava portti
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})