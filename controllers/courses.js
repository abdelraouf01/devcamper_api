const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@desc  get  courses
// --> to get all courses availabe <--
//@route  GET /api/v1/courses
// --> to get all courses of a specific bootcamp <--
//@route  GET /api/v1/bootcamps/:bootcampId/courses
//@access  public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // if bootcampId is passed then get courses with the reference to that bootcamp
  if (req.params.bootcampId) {
    // no advancedResults for courses for a specific bootcamp
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // get all courses
    // populate('bootcamp') gives the entire object that was referenced to by mongoose objectId
    // so here we specifiy the fields we need
    /*query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });*/

    // advanced Results for all courses
    res.status(200).json(res.advancedResults);
  }
});

//@desc  single course
//@route  GET /api/v1/courses/:id
//@access  public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc  add course
//@route  POST /api/v1/bootcamps/:bootcampId/courses
//@access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No Bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  // make sure that the bootcamp owner is the user that's logged in or the admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized add a course to bootcamp ${bootcamp._id}`,
        404
      )
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc  update course
//@route  PUT /api/v1/courses/:id
//@access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  // make sure that the course owner is the user that's logged in or the admin before we update it
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized update a course  ${course._id}`,
        404
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // returns the new updated version
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc  delete course
//@route  DELETE /api/v1/courses/:id
//@access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  // make sure that the course owner is the user that's logged in or the admin before we update it
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized delete a course  ${course._id}`,
        404
      )
    );
  }
  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
