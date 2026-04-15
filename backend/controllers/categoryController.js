const Category = require('../models/Category');

// @desc  Get all categories
// @route GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({ isDefault: -1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc  Create category
// @route POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const existing = await Category.findOne({ userId: req.user._id, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(400).json({ success: false, message: 'Category with this name already exists' });

    const category = await Category.create({ name, icon, color, userId: req.user._id, isDefault: false });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc  Update category
// @route PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.isDefault) return res.status(400).json({ success: false, message: 'Default categories cannot be edited' });

    const { name, icon, color } = req.body;
    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete category
// @route DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.isDefault) return res.status(400).json({ success: false, message: 'Default categories cannot be deleted' });

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
