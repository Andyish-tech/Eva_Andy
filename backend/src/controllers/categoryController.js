const { executeQuery } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get all categories (with product count)
const getCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.parent_id,
        c.image_url,
        c.created_at,
        c.updated_at,
        parent.name as parent_name,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    const categories = await executeQuery(query);

    // Build category tree structure
    const categoryTree = buildCategoryTree(categories);

    res.status(200).json({
      success: true,
      data: {
        categories: categoryTree,
        flat_list: categories
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get single category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.parent_id,
        c.image_url,
        c.created_at,
        c.updated_at,
        parent.name as parent_name,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const categories = await executeQuery(query, [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    // Get subcategories
    const subcategoriesQuery = `
      SELECT 
        id,
        name,
        description,
        image_url,
        created_at
      FROM categories
      WHERE parent_id = ?
      ORDER BY name ASC
    `;

    const subcategories = await executeQuery(subcategoriesQuery, [id]);

    const category = {
      ...categories[0],
      subcategories
    };

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

// Create new category (admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id, image_url } = req.body;

    // Check if category name already exists
    const existingCategory = await executeQuery('SELECT id FROM categories WHERE name = ?', [name]);
    if (existingCategory.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
        error: 'CATEGORY_EXISTS'
      });
    }

    // If parent_id is provided, check if it exists
    if (parent_id) {
      const parentCategory = await executeQuery('SELECT id FROM categories WHERE id = ?', [parent_id]);
      if (parentCategory.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
          error: 'PARENT_CATEGORY_NOT_FOUND'
        });
      }
    }

    // Create category
    const result = await executeQuery(
      'INSERT INTO categories (name, description, parent_id, image_url) VALUES (?, ?, ?, ?)',
      [name, description, parent_id, image_url]
    );

    // Get created category
    const newCategory = await executeQuery(
      `SELECT c.*, parent.name as parent_name 
       FROM categories c 
       LEFT JOIN categories parent ON c.parent_id = parent.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: newCategory[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update category (admin only)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if category exists
    const existingCategory = await executeQuery('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    // Check for circular reference if updating parent_id
    if (updateFields.parent_id) {
      if (updateFields.parent_id == id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent',
          error: 'CIRCULAR_REFERENCE'
        });
      }

      // Check if parent exists
      const parentCategory = await executeQuery('SELECT id FROM categories WHERE id = ?', [updateFields.parent_id]);
      if (parentCategory.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found',
          error: 'PARENT_CATEGORY_NOT_FOUND'
        });
      }

      // Check for circular reference in the hierarchy
      const isCircular = await checkCircularReference(id, updateFields.parent_id);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set parent: would create circular reference',
          error: 'CIRCULAR_REFERENCE'
        });
      }
    }

    // If updating name, check if it already exists (excluding current category)
    if (updateFields.name) {
      const existingName = await executeQuery('SELECT id FROM categories WHERE name = ? AND id != ?', [updateFields.name, id]);
      if (existingName.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists',
          error: 'CATEGORY_EXISTS'
        });
      }
    }

    // Build dynamic update query
    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(id);

    await executeQuery(
      `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get updated category
    const updatedCategory = await executeQuery(
      `SELECT c.*, parent.name as parent_name 
       FROM categories c 
       LEFT JOIN categories parent ON c.parent_id = parent.id 
       WHERE c.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await executeQuery('SELECT id FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    // Check if category has products
    const productCount = await executeQuery(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = true',
      [id]
    );

    if (productCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category: it contains active products',
        error: 'CATEGORY_HAS_PRODUCTS',
        product_count: productCount[0].count
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await executeQuery(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );

    if (subcategoryCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category: it has subcategories',
        error: 'CATEGORY_HAS_SUBCATEGORIES',
        subcategory_count: subcategoryCount[0].count
      });
    }

    // Delete category
    await executeQuery('DELETE FROM categories WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to build category tree
function buildCategoryTree(categories, parentId = null) {
  const tree = [];
  
  for (const category of categories) {
    if (category.parent_id === parentId) {
      const children = buildCategoryTree(categories, category.id);
      if (children.length > 0) {
        category.subcategories = children;
      }
      tree.push(category);
    }
  }
  
  return tree;
}

// Helper function to check circular reference
async function checkCircularReference(categoryId, potentialParentId) {
  let currentId = potentialParentId;
  
  while (currentId) {
    if (currentId == categoryId) {
      return true; // Circular reference found
    }
    
    const parent = await executeQuery('SELECT parent_id FROM categories WHERE id = ?', [currentId]);
    if (parent.length === 0) {
      break;
    }
    
    currentId = parent[0].parent_id;
  }
  
  return false; // No circular reference
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
