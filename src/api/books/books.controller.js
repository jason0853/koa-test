const Joi = require('joi');
const { Types: { ObjectId } } = require('mongoose');
const Book = require('models/book');

exports.list = async ctx => {
  let books = null;

  try {
    books = await Book.find().sort({_id: -1}).limit(3).exec();
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = books;
};

exports.get = async ctx => {
  const { id } = ctx.params;
  let book = null;

  try {
    book = await Book.findById(id).exec();
  } catch (e) {
    return ctx.throw(500, e);
  }

  if (!book) {
    ctx.status = 404;
    ctx.body = {
      message: 'book not found'
    };
    return;
  }

  ctx.body = book;
};

exports.create = async ctx => {
  const {
    title,
    authors,
    publishedDate,
    price,
    tag
  } = ctx.request.body;

  const book = new Book({
    title,
    authors,
    publishedDate,
    price,
    tag
  });

  try {
    await book.save();
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = 'Saved successfully';
};

exports.delete = async ctx => {
  const { id } = ctx.params;
  let book = null;

  try {
    book = await Book.findByIdAndRemove(id).exec();
  } catch (e) {
    if (e.name === 'CastError') {
      ctx.status = 400;
      return;
    }
  }

  if (!book) {
    ctx.status = 404;
    ctx.body = {
      message: 'Not found'
    };
    return;
  }

  ctx.body = 204;
};

exports.put = async ctx => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = {
      message: 'Wrong id'
    };
    return;
  }

  const schema = Joi.object().keys({
    title: Joi.string().required(),
    authors: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    })),
    publishedDate: Joi.date().required(),
    price: Joi.number().required(),
    tag: Joi.array().items((Joi.string()).required())
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  let book = null;

  try {
    book = await Book.findByIdAndUpdate(id, ctx.request.body, {
      upsert: true,
      new: true
    });
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = book;
};

exports.patch = async ctx => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = {
      message: 'Wrong id'
    };
    return;
  }

  let book;

  try {
    book = await Book.findByIdAndUpdate(id, ctx.request.body, {
      new: true
    });
  } catch (e) {
    return ctx.throw(500, e);
  }

  ctx.body = book;
};