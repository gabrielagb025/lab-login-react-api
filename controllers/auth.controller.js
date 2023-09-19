const mongoose = require('mongoose');
const User = require('../models/User.model');
const { StatusCodes } = require('http-status-codes')

module.exports.register = (req, res, next) => {
    User.create(req.body)
    .then(user => res.status(StatusCodes.CREATED).json(user))
    .catch(next)
}   