const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../data/tours-simple.json`, 'utf8'),
// );

//exports.checkID = (req, res, next) => {
//const id = req.params.id * 1;
// const selectedTour = tours.find((el) => el.id === id);
// if (!selectedTour) {
//   return res.status(404).send('Não encontrado');
// }
// req.selectedTour = selectedTour;
// next();
//};
// exports.checkBodyCreate = (req, res, next) => {
//   if (!req.body.name || !req.body.duration) {
//     return res.status(400).json({
//       status: 'Falha',
//       message: 'O nome e a duração são obrigatários',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price, ratingsAverage,summary,difficulty';
  next();
};

exports.allTours = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();
  //O objeto query do mongoose se obtem com o Tour.find
  const tours = await features.query;

  //const tours = await Tour.find().where('duration').equals(5);
  res.status(200).json({
    result: tours.length,
    status: 'success',
    message: tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
// const newID = tours[tours.length - 1].id + 1;
// const newTour = { id: newID, ...req.body };
// tours.push(newTour);

// fs.writeFile(
//   `${__dirname}/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });};

//Selecionar uma tuor
exports.oneTour = catchAsync(async (req, res, next) => {
  const selectedTour = await Tour.findById(req.params.id);

  if (!selectedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: selectedTour,
    },
  });
});

//atualizar tuor

exports.updateTour = catchAsync(async (req, res, next) => {
  /*const upTour = req.selectedTour;
  const newData = req.body;
  upTour.name = newData.name || upTour.name;
  upTour.duration = newData.duration || upTour.duration; */

  const upTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true, //sempre q atualiza os campos atualizados são validados de novo no schema
  });
  res.status(200).json({
    status: 'success',
    update_tour: upTour,
  });
});
//deletar
exports.delTour = catchAsync(async (req, res, next) => {
  const selectedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!selectedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
  });
});
//   const delTour = tours.findIndex((el) => el.id === id);

//   if (delTour !== -1) {
//     tours.splice(delTour, 1);
//     return res.status(200).json({
//       // o certo é não retornar nada no corpo(204)

//   }
//   return res.status(404).json({
//     status: 'failed',
//     message: 'Elemento não encontrado',
//   });
// };

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, //é somado 1 a todos os documentos do gp
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});

//retorna a quatidade de tours por mes
exports.getMouthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, //retorna uma arry com os nomes
      },
    },
    {
      $addFields: { month: '$_id' }, //adicionando um campo
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});
// Mês mais movimentado de um determinado ano
