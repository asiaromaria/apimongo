const { User } = require('../models/user');
const { Product, validate, productSchema } = require("../models/products");
const express = require("express");
const router = express.Router();

//Here we are specifying that we want both a user id and a product id to be 
//passed to the route handler via the requestor’s endpoint URL. 
router.post('/:userId/shoppingcart/:productId', async (req, res) => {
    try{
        //We then  take both  of  the  id’s  and  query  the  respective  collection to 
        //ensure  that  those  id’ s are  valid  and  belong to  existing  documents in  their  collection.
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(400).send(`The product with id "${req.params.productId}" does not exist. `);

        user.shoppingCart.push(product);
        await user.save();
        return res.send(user.shoppingCart);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

router.put('/:userId/shoppingcart/:productId', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error);

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send(`The user with id "${req.params.productId}" does not exist in the users shopping cart.`);

        const product = user.shoppingCart.id(req.params.productId);
        if (!product) return res.status(400).send(`The product with id "${req.params.productId}" does not in the users shopping cart.`); 

        product.name = req.body.name;
        product.description = req.body.description;
        product.category = req.body.category;
        product.price = req.body.price;
        product.dateModified = Date.now();

        await user.save();
        return res.send(product);
    }   catch (ex) {
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

router.delete('/:userId/shoppingcart/:productId', async (req, res) => {   
    try {            
        const user = await User.findById(req.params.userId);     
        if (!user) return res.status(400).send(`The user with id "${req.params.userId}" does not exist.`);      
        let product = user.shoppingCart.id(req.params.productId);     
        if (!product) return res.status(400).send(`The product with id "${req.params.productId}" does not in the users shopping cart.`);      
        
        product = await product.remove();      
        await user.save();     
        return res.send(product);    
    }   catch (ex) {     
        return res.status(500).send(`Internal Server Error: ${ex}`);   
    } 
}); 

module.exports = router;