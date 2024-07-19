// implement your posts router here
const express = require('express')

const router = express.Router()

const Post = require('./posts-model')

router.get('/', (req, res) => {
    Post.find()
    .then(posts => {
        res.json(posts)
    })
    .catch(err => {
        res.status(500).json({ message: "The posts information could not be retrieved" })
    })
})
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        if(!post){
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        }
        res.json(post)
    })
    .catch(err => {
        res.status(500).json({ message: "The post information could not be retrieved" })
    })

})
router.post('/', (req, res) => {
    const newPost = req.body
    if(!newPost.title || !newPost.contents){
        res.status(400).json({ message: "Please provide title and contents for the post" })
    }else{
        Post.insert(newPost)
        .then(({id}) => {
            return Post.findById(id)
        })
        .then(post => {
            res.status(201).json(post) 
        })
        .catch(err => {
            res.status(500).json({ message: "There was an error while saving the post to the database" })
        })
    }
})
router.put('/:id', (req, res) => {
    const {title, contents} = req.body
    const postID = req.params.id
    if(!title || !contents){
        res.status(400).json({ message: "Please provide title and contents for the post" })
    }else{
        Post.findById(postID)
        .then(post => {
            if(!post){
                res.status(404).json({ message: "The post with the specified ID does not exist" })
            }else{
               return Post.update(postID, req.body)
            }
        })
        .then(data => {
            if(data) return Post.findById(req.params.id)
        })
        .then(newPost => {
           if(newPost) res.json(newPost)
        })
        .catch(err => {
            res.status(500).json({ message: "The post information could not be modified" })
        })
    }

})
router.delete('/:id', async (req, res) => {
    const userID = req.params.id
    Post.remove(userID)
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        }else{
            await Post.remove(req.params.id)
            res.json(post)
        }
    }
    catch(err){
        res.status(500).json({ message: "The post could not be removed" })
    }
})
router.get('/:id/comments', async (req, res) => {
    const postID = req.params.id
    try{
        const post = await Post.findById(postID)
        if(!post){
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        }else{
            const comments = await Post.findPostComments(postID)
            res.json(comments)
        }
    }
    catch(err){
        res.status(500).json({ message: "The comments information could not be retrieved" })
    }

})

module.exports = router