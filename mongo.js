const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nam = process.argv[3]
const num = process.argv[4]

const url =
    `mongodb+srv://hennaojala:${password}@cluster0.fsde9fk.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)


const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 3) {

  // ID:n generointi toiminnallisuus randomilla, kokonaisluku väliltä 5-1000
  const generateId = () => {
    return Math.floor(Math.random() * (1000 - 5 + 1)) + 5
  }

  const person = new Person({
    name: nam,
    number: num,
    id: generateId()
  })

  person.save().then(() => {
    console.log(`added ${nam} number ${num} to phonebook`)
    mongoose.connection.close()
  })
}
else {

  //Tulosta kaikki tietokannan henkilot konsoliin
  Person
    .find({})
    .then(person => {
      console.log(person)
      mongoose.connection.close()
    })
}