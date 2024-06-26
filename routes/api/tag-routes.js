const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  Tag.findAll({
    attributes: ['id', 'tag_name'],
    include: [
      {
        model: Product,
        attributes: ['id', 'product_name']
      }
    ]
  })
    .then(tagData => res.json(tagData))
    .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });
});

router.get('/:id', async (req, res) => {
  Tag.findOne({
    where:{
      id: req.params.id
    }, 
    include: [
      {
        model: Product, 
        attributes: ['product_name', 'price', 'stock']
      }
    ]
  })
  .then(tagData => {
    if (!tagData) {
      res.status(404).json({message: 'no tag found with this id'});
      return;
    }
    res.json(tagData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.post('/', async (req, res) => {
  const { tag_name } = req.body;

  try {
    // Create a new tag in the database
    const newTag = await Tag.create({ tag_name });

    // Send a success response with the newly created tag
    res.status(201).json(newTag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  const tagId = req.params.id;
  const { tag_name } = req.body;

  try {
    // Update the tag's name by its id
    const [rowsUpdated] = await Tag.update({ tag_name }, { where: { id: tagId } });

    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Update the corresponding ProductTag entries
    await ProductTag.update({ tag_id: tagId }, { where: { tag_id: tagId } });

    // Send a success response indicating the tag was updated
    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const tagId = req.params.id;

  try {
    // Find the tag by its id and delete it
    const rowsDeleted = await Tag.destroy({ where: { id: tagId } });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Delete the corresponding ProductTag entries
    await ProductTag.destroy({ where: { tag_id: tagId } });

    // Send a success response indicating the tag was deleted
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;