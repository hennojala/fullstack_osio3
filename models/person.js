const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

    const personSchema = new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 3 // Vähimmäispituus nimeen
        },
        number: {
          type: String,
          required: true,
          minlength: 8,
          validate: {
              validator: function(v) {
                  return /\d{2,3}-\d{6,}/.test(v);
              },
              message: props => `${props.value} is not a valid phone number! Valid formats: 09-1234567 or 040-1234567 and minlength 8.`
          }
      }
      });

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
