const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have less or equal then 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Dificulty is either, medium, difficuklt',
      },
      lowercase: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number, // Corrigido de 'rype' para 'type'
      default: 0,
    },
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: true },
    priceDiscount: {
      type: Number,
      validator: function (val) {
        //esse validator customizado só funciona quando se cria um novo documento
        return val < this.price;
      },
      messsage: 'Discount price ({VALUE}) should be below regular price',
    }, // Corrigido e adicionado 'type'
    summary: {
      type: String,
      trim: true, // Remove os espaços em branco do início e do fim
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, //informando que as propriedades fazem parte dos "outputs"
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware: runs before .save() as .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*tourSchema.post('save', function(doc, next){
  console.log(doc);
  next();
}) 
*/

//query middleware
//exe:quando quer q uma consulta não seja utilizada pelo público em geral, tipo ter uma tour que é exclusiva
tourSchema.pre(/^find/, function (next) {
  // expressão regular, todas as querys q começam com find entram nessa função.
  this.find({ secretTour: { $ne: true } }); //this aponta para a consulta atual
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (next) {
  console.log(
    `Tempo da consulta realizada, query took: ${Date.now() - this.start} miliseconds`,
  );
});

//AGGREGATION MIDDLEWARE
//o this representa o obj aggregation
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
