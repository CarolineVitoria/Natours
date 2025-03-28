const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//middleware de parametros
//router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.allTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMouthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.allTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.oneTour)
  .patch(tourController.updateTour)
  .delete(tourController.delTour);

module.exports = router;
